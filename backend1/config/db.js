const mongoose = require("mongoose");
require("dotenv").config();

const MAX_RETRIES = 5;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let attempt = 0;
let isConnecting = false;

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("❌ MONGO_URI not found in environment variables!");
    process.exit(1);
  }

  while (attempt < MAX_RETRIES) {
    attempt++;
    console.log(`🔌 Trying MongoDB connection (attempt ${attempt}/${MAX_RETRIES})...`);

    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // ← force IPv4, fixes most Windows DNS/SRV issues
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      attempt = 0;
      isConnecting = false;
      return;

    } catch (error) {
      const msg = error.message || "";
      const isDNS    = msg.includes("querySrv") || msg.includes("ENOTFOUND");
      const isAuth   = msg.includes("Authentication failed") || msg.includes("bad auth");
      const isTimeout = msg.includes("ETIMEDOUT") || msg.includes("timed out");

      console.error(`❌ MongoDB Connection Error (attempt ${attempt}): ${msg}`);

      // Auth errors — retrying won't help, exit immediately
      if (isAuth) {
        console.error("\n🔑 Fix: Check your MONGO_URI username/password in .env");
        console.error("   Also verify the DB user exists in Atlas → Database Access\n");
        process.exit(1);
      }

      // DNS errors — print actionable steps
      if (isDNS) {
        console.error("\n🔍 DNS Resolution Failed — try these fixes IN ORDER:");
        console.error("   1. Atlas → Network Access → Add IP (or set 0.0.0.0/0 for dev)");
        console.error("   2. Run in terminal: ipconfig /flushdns");
        console.error("   3. Change DNS to 8.8.8.8 (Google) in Windows network settings");
        console.error("   4. In Atlas → Connect → Drivers → disable SRV → use direct URL\n");
      }

      if (isTimeout) {
        console.error("\n⏱️  Timeout — Atlas cluster may be paused. Check cloud.mongodb.com\n");
      }

      if (attempt >= MAX_RETRIES) {
        console.error(`\n🛑 Giving up after ${MAX_RETRIES} attempts.`);
        console.error("   Fix the issue above and restart the server.\n");
        process.exit(1);
      }

      const delay = Math.min(30000, 1000 * Math.pow(2, attempt)); // 2s → 4s → 8s → 16s → 30s
      console.log(`⏳ Retrying in ${Math.round(delay / 1000)}s...\n`);
      isConnecting = false;
      await wait(delay);
      isConnecting = true;
    }
  }
};

// Auto-reconnect if connection drops after initial connect
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Reconnecting...");
  attempt = 0;
  isConnecting = false;
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err.message);
});

module.exports = connectDB;