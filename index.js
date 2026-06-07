const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('The server is ready to connect');
});

app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server is ready at http://localhost:${PORT}`);
});
