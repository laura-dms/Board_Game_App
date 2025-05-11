import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const app = express();
const port = 3001; // Backend server port
const secretKey = crypto.randomBytes(64).toString('hex');

// MySQL Database Connection
const pool = mysql.createPool({
  host: '127.0.0.1',      // Or your DB host
  user: 'root',           // Your DB user
  password: ',Eissero32!!?', // Your DB password
  database: 'board_games',  // Your DB name
  port: 3306,             // Your DB port
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