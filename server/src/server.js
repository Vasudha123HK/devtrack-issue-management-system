const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start Express server
const startServer = async () => {
  try {
    // Attempt database connection
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 DevTrack API Server running on port ${PORT}`);
      console.log(`🌐 API Root: http://localhost:${PORT}/api/health`);
      console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=============================================`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`💥 Unhandled Rejection: ${err.message}`);
      // Close server & exit in critical errors
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error(`💥 Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
  }
};

startServer();
