const { Pool } = require('pg');
const mongoose = require('mongoose');

// PostgreSQL Connection Pool - Using Neon
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test PostgreSQL connection
pgPool.on('connect', () => {
  console.log('✅ PostgreSQL (Neon) connected successfully');
});

pgPool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err.message);
});

// Test the pool
pgPool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL query test failed:', err.message);
  } else {
    console.log('✅ PostgreSQL (Neon) query test successful');
  }
});

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ciphersqlstudio'
    );
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Make sure MongoDB is running or check your MONGODB_URI');
    // Don't exit, allow server to run for development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

connectMongoDB();

module.exports = { pgPool, mongoose };
