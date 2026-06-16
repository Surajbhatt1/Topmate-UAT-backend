// const mongoose = require('mongoose');

// // const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/topmate';
// const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://parkchan1616_db_user:parkchan1616@topmate.sdtkfla.mongodb.net/?appName=topmate';

// mongoose.connect(mongoUri);

// mongoose.connection.on('connected', () => {
//   console.log('The server is connected with database');
// });

// mongoose.connection.on('error', (err) => {
//   console.log('Database connection error:', err.message);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Disconnected with database');
// });

// ----------Updated Committe------


// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     const mongoUri = process.env.MONGODB_URI;

//     if (!mongoUri) {
//       throw new Error('MONGODB_URI is not defined');
//     }

//     await mongoose.connect(mongoUri);

//     console.log('✅ MongoDB Connected Successfully');
//   } catch (error) {
//     console.error('❌ MongoDB Connection Failed');
//     console.error(error.message);
//     process.exit(1);
//   }
// };

// mongoose.connection.on('connected', () => {
//   console.log('📦 Database connection established');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('❌ Database Error:', err.message);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('⚠️ Database disconnected');
// });

// module.exports = connectDB;





const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed');
    console.error('Reason:', error.message);

    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('connected', () => {
  console.log('📦 Database connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Database Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Database disconnected');
});

module.exports = connectDB;