import serverless from 'serverless-http';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../src/routes.js';  // Ensure the path is correct
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Use the imported router
// app.use('/api', routes);  // This should use the router instance
app.use('/api',app.router);
routes.initialize(app);
module.exports.handler = serverless(app);
