const express = require('express');
const nodemailer = require('nodemailer');
const Booking = require('../model/Booking');

const router = express.Router();

const requiredFields = [
  'candidateName',
  'emailAddress',
  'mobileNumber',
  'selectedService',
  'preferredDate',
  'preferredTime',
];

const services = [
  'English Spoken',
  'Technical Interview Guidance',
  'Personal Interview Guidance',
  'Career Coaching',
  'Startup Consulting',
  'Resume Review',
  'Communication Skills',
  'Mock Interviews',
];

function createTransporter() {
  const missingConfig = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].filter((key) => !process.env[key]);

  if (missingConfig.length) {
    return {
      transporter: null,
      missingConfig,
    };
  }

  return {
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
    missingConfig: [],
  };
}

function formatSessionDate(date, time) {
  return `${date} at ${time}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendBookingEmail(booking) {
  const { transporter, missingConfig } = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: `Email is not configured. Missing: ${missingConfig.join(', ')}`,
    };
  }

  const sessionTime = formatSessionDate(booking.preferredDate, booking.preferredTime);
  const safeName = escapeHtml(booking.candidateName);
  const safeService = escapeHtml(booking.selectedService);
  const safeSessionTime = escapeHtml(sessionTime);

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: booking.emailAddress,
      subject: `Booking confirmed: ${booking.selectedService}`,
      text: `Hi ${booking.candidateName},

Your session booking request has been received.

Session Name: ${booking.selectedService}
Session Time: ${sessionTime}

Thank you,
Topmate Sessions`,
      html: `
      <p>Hi ${safeName},</p>
      <p>Your session booking request has been received.</p>
      <p><strong>Session Name:</strong> ${safeService}</p>
      <p><strong>Session Time:</strong> ${safeSessionTime}</p>
      <p>Thank you,<br>Topmate Sessions</p>
    `,
    });

    return { sent: true, reason: null };
  } catch (error) {
    console.error('Booking email error:', error);
    return {
      sent: false,
      reason: error.message || 'Unable to send booking confirmation email',
    };
  }
}

router.post('/', async (req, res) => {
  try {
    const missingField = requiredFields.find((field) => !req.body[field]);

    if (missingField) {
      return res.status(400).json({ message: `${missingField} is required` });
    }

    const booking = await Booking.create({
      candidateName: req.body.candidateName,
      emailAddress: req.body.emailAddress,
      mobileNumber: req.body.mobileNumber,
      selectedService: req.body.selectedService,
      preferredDate: req.body.preferredDate,
      preferredTime: req.body.preferredTime,
    });

    const emailResult = await sendBookingEmail(booking);

    if (emailResult.sent) {
      booking.emailSent = true;
      await booking.save();
    }

    return res.status(201).json({
      message: emailResult.sent
        ? 'Booking saved and confirmation email sent'
        : `Booking saved. ${emailResult.reason}`,
      booking,
      emailSent: emailResult.sent,
      emailError: emailResult.sent ? null : emailResult.reason,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ message: 'Unable to book session right now' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.date) {
      filter.preferredDate = req.query.date;
    }

    if (req.query.service) {
      filter.selectedService = req.query.service;
    }

    const bookings = await Booking.find(filter).sort({ preferredDate: -1, preferredTime: -1, createdAt: -1 });

    const totalBookings = await Booking.countDocuments();
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = await Booking.countDocuments({ preferredDate: today });
    const emailPending = await Booking.countDocuments({ emailSent: false });

    return res.json({
      bookings,
      services,
      stats: {
        totalBookings,
        todayBookings,
        emailPending,
        filteredBookings: bookings.length,
      },
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return res.status(500).json({ message: 'Unable to fetch bookings right now' });
  }
});

module.exports = router;
