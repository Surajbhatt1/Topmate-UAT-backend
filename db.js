const mongoose = require('mongoose');

// const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/topmate';
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://parkchan1616_db_user:parkchan1616@topmate.sdtkfla.mongodb.net/?appName=topmate';

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
