const express = require('express');
const nodemailer = require('nodemailer');
const Booking = require('../model/Booking');

const router = express.Router();

const hasSmtpConfig = Boolean(
  process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

// Create Booking
router.post('/', async (req, res) => {
  try {
    const {
      candidateName,
      emailAddress,
      mobileNumber,
      selectedService,
      preferredDate,
      preferredTime,
    } = req.body;

    if (
      !candidateName ||
      !emailAddress ||
      !mobileNumber ||
      !selectedService ||
      !preferredDate ||
      !preferredTime
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const booking = await Booking.create({
      candidateName,
      emailAddress,
      mobileNumber,
      selectedService,
      preferredDate,
      preferredTime,
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: emailAddress,
          subject: 'Booking Confirmation',
          html: `
            <h2>Booking Confirmed</h2>
            <p>Hello ${candidateName},</p>
            <p>Your session has been booked successfully.</p>
            <table border="1" cellpadding="8">
              <tr>
                <td><strong>Service</strong></td>
                <td>${selectedService}</td>
              </tr>
              <tr>
                <td><strong>Date</strong></td>
                <td>${preferredDate}</td>
              </tr>
              <tr>
                <td><strong>Time</strong></td>
                <td>${preferredTime}</td>
              </tr>
            </table>
            <br/>
            <p>We will contact you shortly.</p>
            <p>Regards,<br/>Topmate Team</p>
          `,
        });

        booking.emailSent = true;
        await booking.save();
      } catch (emailError) {
        console.error('Email Error:', emailError.message);
      }
    } else {
      console.warn('Booking email skipped: SMTP configuration is incomplete');
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

// Get All Bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch bookings',
    });
  }
});

// Get Booking By ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
});

module.exports = router;
