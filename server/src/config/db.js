const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri);

    if (nodeEnv === 'development') {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  if (nodeEnv === 'development') {
    console.log('MongoDB disconnected');
  }
});

module.exports = connectDB;
