const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

let dbConnection;

async function connectDB() {
  if (dbConnection) return dbConnection;
  try {
    dbConnection = await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    return dbConnection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

module.exports = { connectDB, mongoose };
