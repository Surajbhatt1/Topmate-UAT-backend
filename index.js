// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const db = require('./db');
// const bookingRoutes = require('./routes/bookingRoutes');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('The server is ready to connect');
// });

// app.use('/api/bookings', bookingRoutes);

// const PORT = process.env.PORT || 9000;

// app.listen(PORT, () => {
//   console.log(`Server is ready at http://localhost:${PORT}`);
// });



// const express = require('express');
// const cors = require('cors');
// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const db = require('./db');
// const bookingRoutes = require('./routes/bookingRoutes');

// const app = express();

// app.use(cors());
// app.use(express.json());

// // ==============================
// // SMTP Configuration
// // ==============================

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: process.env.SMTP_SECURE === 'true',
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // Verify SMTP Connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('❌ SMTP Error:', error);
//   } else {
//     console.log('✅ SMTP Connected Successfully');
//   }
// });

// // ==============================
// // Routes
// // ==============================

// app.get('/', (req, res) => {
//   res.send('The server is ready to connect');
// });

// // Test Email Route
// app.get('/send-test-mail', async (req, res) => {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.MAIL_FROM,
//       to: process.env.SMTP_USER,
//       subject: 'Topmate Test Email',
//       html: `
//         <h2>Email Working Successfully 🚀</h2>
//         <p>Your Gmail SMTP configuration is working.</p>
//       `,
//     });

//     console.log('Message Sent:', info.messageId);

//     res.status(200).json({
//       success: true,
//       message: 'Email sent successfully',
//       messageId: info.messageId,
//     });
//   } catch (error) {
//     console.error('❌ Mail Error:', error);

//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// app.use('/api/bookings', bookingRoutes);

// // ==============================
// // Server
// // ==============================

// const PORT = process.env.PORT || 9000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server is ready at http://localhost:${PORT}`);
// });


require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const connectDB = require('./db.js');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Error:', error.message);
  } else {
    console.log('✅ SMTP Connected Successfully');
  }
});

// Home Route
app.get('/', (req, res) => {
  res.send('🚀 Server is ready');
});

// Test Mail Route
app.get('/send-test-mail', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.SMTP_USER,
      subject: 'Topmate Test Email',
      html: `
        <h2>Email Working Successfully 🚀</h2>
        <p>Your SMTP configuration is working.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Email Sent Successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Booking Routes
app.use('/api/bookings', bookingRoutes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
  });
});

// Start Server
// const PORT = process.env.PORT || 9000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server is ready at http://localhost:${PORT}`);
// });
const PORT = process.env.PORT || 9000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
