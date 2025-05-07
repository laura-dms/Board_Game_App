import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const app = express();
const port = 3000;
const secretKey = crypto.randomBytes(64).toString('hex');

app.use(cors());
app.use(bodyParser.json());

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

// launch the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Get all users (admin only)
app.get('/users', verifyToken, (req, res) => {
  pool.query('SELECT ID_User, Username FROM Users', (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(results);
  });
});

// Get user by ID
app.get('/users/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  pool.query('SELECT ID_User, Username FROM Users WHERE ID_User = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Register
app.post('/register', async (req, res) => {
  const { Username, Password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    pool.query(
      'INSERT INTO users (Username, Password, Role_User) VALUES (?, ?, "User")',
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

// Login
app.post('/login', (req, res) => {
  const { Username, Password } = req.body;

  pool.query('SELECT * FROM Users WHERE Username = ?', [Username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.user_id }, secretKey, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  });
});