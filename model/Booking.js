const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    selectedService: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: String,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    googleMeetCreated: {
      type: Boolean,
      default: false,
    },
    googleMeetLink: {
      type: String,
      trim: true,
      default: null,
    },
    googleCalendarEventId: {
      type: String,
      trim: true,
      default: null,
    },
    googleMeetError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
