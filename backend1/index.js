const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/food-donations', require('./routes/foodDonationRoutes'));
app.use('/api/waste-pickups', require('./routes/wastePickupRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});