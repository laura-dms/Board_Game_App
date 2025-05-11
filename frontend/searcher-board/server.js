import express from 'express';  
import cors from 'cors';
import db from './db/db.js';

const app = express(); // create express app, used for accessing the database
const port = 3000;

// using cors to allow request from vue app
app.use(cors());

// parse request as JSON
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ message: 'Username and Password are required' });
  }

  pool.query('SELECT * FROM Users WHERE Username = ?', [Username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.ID_User }, secretKey, { expiresIn: '1h' });
    res.json({ success: true, username: user.Username, token });
  });
});

