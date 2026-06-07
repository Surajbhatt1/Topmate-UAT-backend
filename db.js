const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/topmate';

mongoose.connect(mongoUri);

mongoose.connection.on('connected', () => {
  console.log('The server is connected with database');
});

mongoose.connection.on('error', (err) => {
  console.log('Database connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected with database');
});
