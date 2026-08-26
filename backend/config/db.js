const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/samadhan_setu';
  try {
    // Attempt standard connection with 2 second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected successfully to ${uri}`);
  } catch (err) {
    console.log('Local MongoDB connection failed/unavailable. Starting embedded MongoMemoryServer fallback...');
    try {
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`Embedded MongoDB Server running and connected at ${memoryUri}`);
    } catch (memErr) {
      console.error('Failed to start MongoMemoryServer:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
