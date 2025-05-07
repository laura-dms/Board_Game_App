import express from 'express';  
import cors from 'cors';
import db from './db/db.js';

const app = express(); // create express app, used for accessing the database
const port = 3000;

// using cors to allow request from vue app
app.use(cors());

// parse request as JSON
app.use(express.json());

