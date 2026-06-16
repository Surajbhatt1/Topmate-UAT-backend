const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    if (!connectionPromise) {
      connectionPromise = mongoose.connect(mongoUri);
    }

    await connectionPromise;

    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.error('MongoDB connection failed');
    console.error('Reason:', error.message);

    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }

    throw error;
  }
};

mongoose.connection.on('connected', () => {
  console.log('Database connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('Database Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Database disconnected');
});

module.exports = connectDB;
