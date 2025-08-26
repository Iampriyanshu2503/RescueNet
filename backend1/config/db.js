const mongoose = require("mongoose");
require("dotenv").config();

let isConnecting = false;
let attempt = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("❌ MONGO_URI not found in environment variables!");
  }

  while (true) {
    try {
      console.log(`🔌 Trying MongoDB connection (attempt ${attempt + 1})...`);
      const conn = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      isConnecting = false;
      attempt = 0;
      return;
    } catch (error) {
      attempt += 1;
      const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(attempt, 5))); // 1s → 32s cap
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}): ${error.message}`);
      console.log(`⏳ Retrying in ${Math.round(delay / 1000)}s...`);
      isConnecting = false;
      await wait(delay);
      isConnecting = true;
    }
  }
};

module.exports = connectDB;
