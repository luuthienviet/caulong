const express = require('express');
const cors = require('cors');

const app = express();

/* ===== Middlewares ===== */
app.use(cors());
app.use(express.json());

/* ===== Routes ===== */
const bookingRoutes = require('./routes/bookingRoutes');
const courtRoutes = require('./routes/courtRoutes');

app.use('/api/bookings', bookingRoutes);
app.use('/api/courts', courtRoutes);

/* ===== Error middleware ===== */
const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

module.exports = app;
