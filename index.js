require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const connectDB = require('./db.js');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const shouldVerifySmtp =
  process.env.VERIFY_SMTP_ON_STARTUP === 'true' || require.main === module;

if (shouldVerifySmtp) {
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP Error:', error.message);
    } else {
      console.log('SMTP connected successfully');
    }
  });
}

app.get('/', (req, res) => {
  res.send('Server is ready');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
  });
});

const requireDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
};

app.get('/send-test-mail', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.SMTP_USER,
      subject: 'Topmate Test Email',
      html: `
        <h2>Email Working Successfully</h2>
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

app.use('/api/bookings', requireDatabase, bookingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.message || err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 9000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
