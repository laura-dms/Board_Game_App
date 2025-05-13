import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

const app = express();
const port = 3001; // Backend server port
const secretKey = crypto.randomBytes(64).toString('hex');

dotenv.config();

// MySQL Database Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
}).promise();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Default route for root path
app.get('/', (req, res) => {
  res.send('Welcome to the Board Game App API!');
});

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// API Endpoints

// Register Endpoint
app.post('/register', async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ message: 'Username and Password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    pool.query(
      'INSERT INTO Users (Username, Password, Role_User) VALUES (?, ?, "User")',
      [Username, hashedPassword],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        const userId = results.insertId;
        const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
        res.status(201).json({ message: 'User created successfully', token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => { // Make the main route handler async
  console.log("Login request received:", req.body);

  const { Username, Password } = req.body;

  if (!Username || !Password) {
    console.log("Missing Username or Password");
    return res.status(400).json({ message: 'Username and Password are required' });
  }

  console.log(`Attempting to query database for user: ${Username}`);

  try { // Wrap the database operation and subsequent logic in a try-catch
    const [results] = await pool.query('SELECT * FROM Users WHERE Username = ?', [Username]);
    // Note: When using pool.promise().query(), results is typically the first element of the array returned.
    // For SELECT, it's an array of rows. For INSERT/UPDATE, it's an OkPacket.

    console.log("Query results:", results);

    if (!results || results.length === 0) { // Check if results array is empty or undefined
      console.log("No user found with the provided username:", Username);
      return res.status(401).json({ message: 'Invalid credentials - user not found.' });
    }

    const user = results[0];
    console.log("User found:", user);

    if (!user || typeof user.Password !== 'string') {
      console.error("User data is invalid or password field is missing/not a string for user:", Username, user);
      return res.status(500).json({ message: 'Server error: Invalid user data.' });
    }

    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    console.log("Password valid for user", Username, ":", isPasswordValid);
    console.log

    if (!isPasswordValid) {
      console.log("Password comparison failed for user:", Username);
      return res.status(401).json({ message: 'Invalid credentials - password mismatch.' });
    }

    const token = jwt.sign({ userId: user.ID_User }, secretKey, { expiresIn: '1h' });
    console.log("Token generated for user", Username, ":", token);

    res.json({ success: true, username: user.Username, token });

  } catch (error) {
    console.error("Error during login processing (database or other):", error); // More generic error log
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during login processing. Please check server logs.' });
    }
  }
});

app.get('/api/login', (req, res) => {
  res.send('This is the login endpoint. Please use POST requests to log in.');
});

// Get Games Endpoint
app.get('/api/games', async (req, res) => {
  try {
    const [games] = await pool.query('SELECT * FROM Games');
    res.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Error fetching games" });
  }
});

app.post('/api/likes', async (req, res) => {
  const { username, gameId } = req.body;

  // --- Basic Input Validation ---
  if (!username || !gameId) {
    return res.status(400).json({ error: 'Username and gameId are required.' });
  }

  let connection; // Declare connection variable outside try block

  try {
     // Get a connection from the pool for transaction
     connection = await pool.promise().getConnection();
     await connection.beginTransaction();

     // --- 1. Find User ID from Username ---
     const [users] = await connection.query('SELECT ID_User FROM users WHERE Username = ?', [username]);

     if (users.length === 0) {
       await connection.rollback(); // Rollback transaction
       connection.release();      // Release connection
       return res.status(404).json({ error: 'User not found.' });
     }
     const userId = users[0].ID_User;

     // --- 2. Check if the like already exists ---
     const [likes] = await connection.query(
       'SELECT COUNT(*) as count FROM like_a WHERE ID_User = ? AND ID_Game = ?',
       [userId, gameId]
     );
     const likeExists = likes[0].count > 0;

     let newLikeStatus;

     // --- 3. Insert or Delete the like ---
     if (likeExists) {
       // Like exists, so delete it (unlike)
       await connection.query(
         'DELETE FROM like_a WHERE ID_User = ? AND ID_Game = ?',
         [userId, gameId]
       );
       newLikeStatus = false; // User unliked the game
       console.log(`User ${userId} unliked game ${gameId}`);
     } else {
       // Like doesn't exist, so insert it (like)
       await connection.query(
         'INSERT INTO like_a (ID_User, ID_Game, Date_like) VALUES (?, ?, NOW())',
         [userId, gameId]
       );
       newLikeStatus = true; // User liked the game
       console.log(`User ${userId} liked game ${gameId}`);
     }

     // --- 4. Commit Transaction ---
     await connection.commit();

     // --- 5. Send Success Response ---
     res.status(200).json({ liked: newLikeStatus }); // Return the new status

  } catch (error) {
    console.error('Error processing like request:', error);
    // Rollback transaction in case of any error during the process
    if (connection) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Error rolling back transaction:', rollbackError);
        }
    }
    // Send generic error response
    res.status(500).json({ error: 'Database error occurred while updating like status.' });
  } finally {
      // --- 6. Release Connection ---
      if (connection) {
          connection.release();
      }
  }
});

app.post('/api/like', async (req, res) => {
  const { username, gameId } = req.body;

  try {
    const [[user]] = await pool.query('SELECT ID_User FROM users WHERE Username = ?', [username]);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    await pool.query(
      'INSERT INTO like_a (ID_User, ID_Game, Date_like) VALUES (?, ?, NOW())',
      [user.ID_User, gameId]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/recommendations/:username', async (req, res) => {
  const username = req.params.username;

  try {
    // 1. Récupérer l'ID_User à partir du username
    const [userResult] = await pool.query(
      'SELECT ID_User FROM users WHERE Username = ?',
      [username]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userId = userResult[0].ID_User;

    // 2. Appeler la procédure stockée
    await pool.query('CALL generate_recommendations(?)', [userId]);

    // 3. Récupérer les recommandations depuis la table gamerecommendations
    const [recommendations] = await pool.query(
      'SELECT * FROM gamerecommendations WHERE ID_User = ? ORDER BY Score DESC',
      [userId]
    );

    res.json(recommendations);
  } catch (err) {
    console.error('Erreur lors de la récupération des recommandations :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/recommendations/1/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await pool.execute(`
      SELECT g.ID_Game, g.Name_Game, g.Description_Game, g.Thumbnail_Game
      FROM gamerecommendations gr
      JOIN users u ON gr.ID_User = u.ID_User
      JOIN games g ON gr.ID_Game = g.ID_Game
      WHERE u.Username = ?
      ORDER BY gr.Score DESC
      LIMIT 10
    `, [username]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des recommandations' });
  }
});



// Fetch Games Function
async function fetchGames() {
  try {
    const response = await axios.get("http://localhost:3001/api/games");
    console.log("Fetched games:", response.data); // Log the raw data
    this.allGames = response.data.map((game) => ({
      id: game.id || null,
      title: game.title || "No Title",
      poster: game.poster || "https://placehold.co/200x300?text=No+Image",
      description: game.description || "No Description Available",
    }));
    console.log("Processed games:", this.allGames); // Log the processed data
    this.filteredGames = this.allGames;
  } catch (error) {
    console.error("Error fetching games:", error);
  }
}

// Launch the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});