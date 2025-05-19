import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path'; // Import the 'path' module
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { initializeDatabase } from './database.js';

// Determine the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the same directory as server.js
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = 3001; // Backend server port
const secretKey = crypto.randomBytes(64).toString('hex');

// MySQL Database Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // Ensure you are using process.env.DB_USER here
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

console.log("Connecté avec succès à la base de données MySQL.");
if (!process.env.DB_USER) {
    console.warn("ATTENTION: La variable d'environnement DB_USER n'est pas définie. Vérifiez votre fichier .env et sa configuration.");
}

await initializeDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Endpoint pour lister les catégories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT ID_Category, Category_Name FROM Categories ORDER BY Category_Name");
        res.json(rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        res.status(500).json({ error: 'Impossible de récupérer les catégories' });
    }
});

// Endpoint pour lister les mécaniques
app.get('/api/mechanics', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT ID_Mechanics, Mechanic_name FROM Mechanics ORDER BY Mechanic_name");
        res.json(rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des mécaniques:", error);
        res.status(500).json({ error: 'Impossible de récupérer les mécaniques' });
    }
});

// Endpoint pour obtenir des recommandations de jeux
app.post('/api/recommendations', async (req, res) => {
    const { criteria: userCriteria } = req.body;

    if (!userCriteria || !Array.isArray(userCriteria) || userCriteria.length === 0) {
        return res.status(400).json({ error: 'Les critères sont requis.' });
    }

    try {
        const [allGames] = await pool.query("SELECT * FROM Games");
        if (allGames.length === 0) {
            return res.json({ recommendations: [] });
        }

        const [gameCategoryLinks] = await pool.query("SELECT DISTINCT ID_Game, ID_Category FROM have_a WHERE ID_Category IS NOT NULL");
        const [gameMechanicLinks] = await pool.query("SELECT DISTINCT ID_Game, ID_Mechanics FROM have_a WHERE ID_Mechanics IS NOT NULL");

        const gameCategoriesMap = new Map();
        gameCategoryLinks.forEach(link => {
            if (!gameCategoriesMap.has(link.ID_Game)) {
                gameCategoriesMap.set(link.ID_Game, new Set());
            }
            gameCategoriesMap.get(link.ID_Game).add(link.ID_Category);
        });

        const gameMechanicsMap = new Map();
        gameMechanicLinks.forEach(link => {
            if (!gameMechanicsMap.has(link.ID_Game)) {
                gameMechanicsMap.set(link.ID_Game, new Set());
            }
            gameMechanicsMap.get(link.ID_Game).add(link.ID_Mechanics);
        });

        let scoredGames = [];
        const totalPossibleScoreForAllCriteria = userCriteria.reduce((sum, crit) => {
            return sum + (userCriteria.length - (crit.order - 1));
        }, 0);


        for (const game of allGames) {
            let gameMatchScore = 0;
            const gameCats = gameCategoriesMap.get(game.ID_Game) || new Set();
            const gameMechs = gameMechanicsMap.get(game.ID_Game) || new Set();

            for (const crit of userCriteria) {
                const criterionWeight = (userCriteria.length - (crit.order - 1));
                let match = false;
                const critValue = crit.value; 

                switch (crit.id) {
                    case 'category':
                        if (gameCats.has(parseInt(critValue))) match = true;
                        break;
                    case 'mechanic':
                        if (gameMechs.has(parseInt(critValue))) match = true;
                        break;
                    case 'minPlayers':
                        if (game.Min_players_Game >= parseInt(critValue)) match = true;
                        break;
                    case 'maxPlayers':
                        if (game.Max_players_Game <= parseInt(critValue)) match = true;
                        break;
                    case 'minAge':
                        if (game.Min_age_Game <= parseInt(critValue)) match = true;
                        break;
                    case 'yearPublished':
                        if (game.Year_published_Game == parseInt(critValue)) match = true;
                        break;
                    case 'playingTime':
                        const playingTime = parseFloat(game.Playing_time_Game);
                        if (critValue === '0-30') {
                            if (playingTime <= 30) match = true;
                        } else if (critValue === '30-60') {
                            if (playingTime > 30 && playingTime <= 60) match = true;
                        } else if (critValue === '60-120') {
                            if (playingTime > 60 && playingTime <= 120) match = true;
                        } else if (critValue === '120+') {
                            if (playingTime > 120) match = true;
                        }
                        break;
                }
                if (match) {
                    gameMatchScore += criterionWeight;
                }
            }

            if (gameMatchScore > 0) {
                const normalizedScore = totalPossibleScoreForAllCriteria > 0 ? Math.round((gameMatchScore / totalPossibleScoreForAllCriteria) * 100) : 0;
                scoredGames.push({
                    id: game.ID_Game,
                    Name_Game: game.Name_Game,
                    Description_Game: game.Description_Game,
                    Thumbnail_Game: game.Thumbnail_Game,
                    score: normalizedScore
                });
            }
        }

        scoredGames.sort((a, b) => {
            if (b.score === a.score) {
                return a.Name_Game.localeCompare(b.Name_Game);
            }
            return b.score - a.score;
        });
        
        res.json({ recommendations: scoredGames.slice(0, 3) });

    } catch (error) {
        console.error("Erreur lors de la récupération des recommandations:", error);
        res.status(500).json({ error: 'Impossible de récupérer les recommandations' });
    }
});


// PAGE HOME
app.get('/api/games', async (req, res) => {
    try {
        const [games] = await pool.query('SELECT ID_Game, Name_Game, Thumbnail_Game, Description_Game FROM Games');
        const formattedGames = games.map(game => ({
            id: game.ID_Game,
            title: game.Name_Game,
            poster: game.Thumbnail_Game,
            description: game.Description_Game
        }));
        res.json(formattedGames);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux depuis la BD:', error);
        res.status(500).send('Erreur lors de la récupération des jeux');
    }
});


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
    return res.status(400).json({ success: false, message: 'Username and Password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const [results] = await pool.query(
      'INSERT INTO Users (Username, Password, Role_User) VALUES (?, ?, "User")',
      [Username, hashedPassword]
    );

    const userId = results.insertId;
    const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });

    return res.status(201).json({ success: true, message: 'User created successfully', token });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ success: false, message: error.message });
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

    res.json({ success: true, username: user.Username, token, userId : user.ID_User });

  } catch (error) {
    console.error("Error during login processing (database or other):", error); // More generic error log
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during login processing. Please check server logs.' });
    }
  }
});

app.post('/api/profile/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Lock the user row for update
    const [users] = await connection.query(
      'SELECT * FROM Users WHERE Username = ? FOR UPDATE',
      [username]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(currentPassword, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE Users SET Password = ? WHERE Username = ?', [hashedNewPassword, username]);

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error("Error during password update:", error);
    return res.status(500).json({ message: 'Server error while updating password.' });
  }
});


app.get('/api/login', (req, res) => {
  res.send('This is the login endpoint. Please use POST requests to log in.');
});

// Get Games Endpoint (for a single game)
app.get('/api/games/:gameID', async (req, res) => {
  const gameIdFromParams = req.params.gameID;
  try {
    // 1. Fetch main game data from the Games table
    const [gameRows] = await pool.query('SELECT * FROM Games WHERE ID_Game = ?', [gameIdFromParams]);

    if (gameRows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    const gameData = gameRows[0]; // The raw data from the Games table

    // 2. Fetch associated categories for the game
    const [categoryLinks] = await pool.query(
      `SELECT c.Category_Name 
       FROM Categories c
       JOIN have_a ha ON c.ID_Category = ha.ID_Category
       WHERE ha.ID_Game = ?`,
      [gameIdFromParams]
    );
    // Format categories as a comma-separated string
    const categories = categoryLinks.map(cat => cat.Category_Name).join(', ');

    // 3. Fetch associated mechanics for the game
    const [mechanicLinks] = await pool.query(
      `SELECT m.Mechanic_name 
       FROM Mechanics m
       JOIN have_a ha ON m.ID_Mechanics = ha.ID_Mechanics 
       WHERE ha.ID_Game = ?`,
      [gameIdFromParams]
    );
    // Format mechanics as a comma-separated string
    const mechanics = mechanicLinks.map(mech => mech.Mechanic_name).join(', ');

    // 4. Construct the response object with keys expected by SingleGamePage.vue
    const responseData = {
      id: gameData.ID_Game,
      title: gameData.Name_Game, // Frontend expects 'title'
      poster: gameData.Thumbnail_Game, // Frontend expects 'poster'
      description: gameData.Description_Game, // Frontend expects 'description'
      Min_players_Game: gameData.Min_players_Game,
      Max_players_Game: gameData.Max_players_Game,
      Playing_time_Game: gameData.Playing_time_Game,
      Min_age_Game: gameData.Min_age_Game,
      Year_published_Game: gameData.Year_published_Game,
      category: categories || 'Not specified', // Use fetched categories
      mechanics: mechanics || 'Not specified' // Use fetched mechanics
      // Add any other fields from gameData if needed by the frontend,
      // ensuring the key names match what SingleGamePage.vue uses.
    };

    res.json(responseData);

  } catch (error) {
    console.error(`Error fetching game with ID ${gameIdFromParams}:`, error);
    res.status(500).json({ message: 'Error fetching game details from server' });
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
    const [userResult] = await pool.execute(
      'SELECT ID_User FROM users WHERE Username = ?',
      [username]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userId = userResult[0].ID_User;

    // Appel de la procédure stockée
    await pool.query('CALL generate_recommendations(?)', [userId]);

    // Sélection enrichie avec les données des jeux
    const [recommendations] = await pool.query(`
      SELECT g.ID_Game, g.Name_Game, g.Description_Game, g.Thumbnail_Game
      FROM gamerecommendations gr
      JOIN games g ON gr.ID_Game = g.ID_Game
      WHERE gr.ID_User = ?
      ORDER BY gr.Score DESC
      LIMIT 10
    `, [userId]);

    res.json(recommendations);
  } catch (err) {
    console.error('Erreur lors de la récupération des recommandations :', err);
    res.status(500).json({ error: 'Erreur serveur' });
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

//Fetch Games clicked by user
async function fetchGamesbyId(userId) { //  Added userId parameter
  try {
    // API endpoint to fetch clicked games for a specific user
    const response = await axios.get(`http://localhost:3001/api/user/${userId}/games/clicked`);
    console.log("Fetched clicked games:", response.data);

    this.allGames = response.data.map((game) => ({
      id: game.ID_Game || null,  
      title: game.title || "No Title",
      poster: game.poster || "https://placehold.co/200x300?text=No+Image",
      description: game.description || "No Description Available",
    }));
    console.log("Processed clicked games:", this.allGames);
    this.filteredGames = this.allGames;
  } catch (error) {
    console.error("Error fetching clicked games:", error);
  }
}



app.post('/api/games/clicked', (req, res) => {
  const { userId, gameId } = req.body;

  if (!userId || !gameId) {
    return res.status(400).json({ error: 'Les champs userId et gameId sont requis.' });
  }

  const query = 'INSERT INTO click_on (ID_User, ID_Game, Date_click) VALUES (?, ?, NOW())';
  pool.query(query, [userId, gameId], (error, results) => {
    if (error) {
      console.error('Erreur lors de l\'enregistrement du clic :', error);
      return res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement du clic.' });
    }
    res.status(201).json({ message: 'Clic enregistré avec succès.' });
  });
});



// Get Games Endpoint
app.get('/api/user/:userId/games/clicked', async (req, res) => {
  const {userId} = req.body;
  try {
const [games_clicked] = await pool.query('SELECT * FROM click_on c JOIN Games g ON (c.ID_Game=g.ID_Game an g.ID_User=?) WHERE c.ID_User = ?, [userId]');
  res.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Error fetching games" });
  }
});

// Like / Unlike a game

// Ajouter un like
app.post('/api/games/:gameId/like', async (req, res) => {
  const userId = req.body.userId; // fourni dans le corps de la requête
  const gameId = parseInt(req.params.gameId, 10);

  try {
    await pool.query(
      'INSERT INTO like_a (ID_User, ID_Game, Date_like) VALUES (?, ?, NOW())',
      [userId, gameId]
    );
    res.json({ liked: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).send('Déjà liké');
    }
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Récupérer les jeux likés d’un utilisateur
app.get('/api/users/:userId/likes', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const [rows] = await pool.query(
      'SELECT ID_Game FROM like_a WHERE ID_User = ?',
      [userId]
    );

    const likedGameIds = rows.map(row => row.ID_Game);
    res.json({ likedGameIds });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Supprimer un like
app.delete('/api/games/:gameId/like', async (req, res) => {
  const userId = req.body.userId; // fourni dans le corps de la requête
  const gameId = parseInt(req.params.gameId, 10);

  try {
    await pool.query(
      'DELETE FROM like_a WHERE ID_User = ? AND ID_Game = ?',
      [userId, gameId]
    );
    res.json({ liked: false });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});


// Get User Likes
app.get('/api/users/me/likes', verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `SELECT g.ID_Game, g.Name_Game, g.Thumbnail_Game
       FROM like_a l
       JOIN Games g ON l.ID_Game = g.ID_Game
       WHERE l.ID_User = ?`,
      [userId]
    );
    // On renvoie un tableau d’IDs, ou d’objets selon ton front
    const likedGameIds = rows.map(r => r.ID_Game);
    res.json({ likedGameIds, details: rows });
  } catch (err) {
    console.error('Error fetching likes:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// Launch the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});