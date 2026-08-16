const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devtrack_db';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryError) {
    console.warn(`⚠️  Local MongoDB not detected on (${mongoURI}): ${primaryError.message}`);

    // In development mode, fallback to in-memory MongoDB so the developer can run immediately
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Launching embedded in-memory MongoDB instance for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        
        const conn = await mongoose.connect(memUri);
        console.log(`✅ Embedded In-Memory MongoDB Connected at: ${memUri}`);

        // Seed initial demo data automatically
        const seedData = require('../utils/seeder');
        // Run seeder in background
        setTimeout(async () => {
          try {
            const User = require('../models/User');
            const userCount = await User.countDocuments();
            if (userCount === 0) {
              console.log('🌱 Populating initial demo data into embedded database...');
              const seedUsers = [
                {
                  name: 'Sarah Connor (Admin)',
                  email: 'admin@devtrack.io',
                  password: 'Password123!',
                  role: 'Admin',
                },
                {
                  name: 'Alex Rivera (Dev)',
                  email: 'alex@devtrack.io',
                  password: 'Password123!',
                  role: 'Developer',
                },
                {
                  name: 'Elena Rostova (Dev)',
                  email: 'elena@devtrack.io',
                  password: 'Password123!',
                  role: 'Developer',
                },
              ];
              const createdUsers = await User.create(seedUsers);
              
              const Issue = require('../models/Issue');
              const sampleIssues = [
                {
                  title: 'JWT authentication token expires prematurely on mobile Safari',
                  description: 'Users on iOS WebKit browsers report session timeouts after 5 minutes despite 7-day token expiration. Need to inspect cookie and header transmission handling.',
                  priority: 'High',
                  status: 'In Progress',
                  assignedTo: createdUsers[1]._id,
                  createdBy: createdUsers[0]._id,
                },
                {
                  title: 'Database connection pool exhaustion under load testing',
                  description: 'Under simulated 500 concurrent requests, Mongoose throws serverSelectionTimeoutMS error. Implement connection pooling parameters and retry logic.',
                  priority: 'High',
                  status: 'Open',
                  assignedTo: createdUsers[2]._id,
                  createdBy: createdUsers[0]._id,
                },
                {
                  title: 'Implement search debounce on Issue list filter component',
                  description: 'Every keystroke in the search bar triggers an immediate API request. Add 300ms debounce hook to optimize server load and UI responsiveness.',
                  priority: 'Medium',
                  status: 'Resolved',
                  assignedTo: createdUsers[1]._id,
                  createdBy: createdUsers[2]._id,
                },
                {
                  title: 'Dark mode contrast issues on priority badge pills',
                  description: 'Low priority badges with slate-500 text lack sufficient WCAG contrast on dark background containers. Update badge colors to high contrast palette.',
                  priority: 'Low',
                  status: 'Resolved',
                  assignedTo: createdUsers[1]._id,
                  createdBy: createdUsers[2]._id,
                },
                {
                  title: 'Add CSV export functionality for monthly issue audit reports',
                  description: 'Admins need to export resolved and open issues to CSV for quarterly sprint reviews and KPI tracking.',
                  priority: 'Medium',
                  status: 'Open',
                  assignedTo: createdUsers[2]._id,
                  createdBy: createdUsers[0]._id,
                },
              ];
              const createdIssues = await Issue.create(sampleIssues);

              const Comment = require('../models/Comment');
              await Comment.create([
                {
                  issue: createdIssues[0]._id,
                  author: createdUsers[1]._id,
                  content: 'I reproduced this issue on iOS 17.4. It appears Safari is dropping Authorization headers on 302 redirects. Testing fix now.',
                },
                {
                  issue: createdIssues[0]._id,
                  author: createdUsers[0]._id,
                  content: 'Great find Alex. Let me know when you have a PR ready so we can test across staging.',
                },
              ]);
              console.log('✨ Demo accounts and sample issues ready!');
              console.log('👉 Admin Demo: admin@devtrack.io / Password123!');
              console.log('👉 Dev Demo:   alex@devtrack.io  / Password123!');
            }
          } catch (seedErr) {
            console.error('Seeder error in fallback:', seedErr.message);
          }
        }, 100);

        return conn;
      } catch (memError) {
        console.error(`❌ Failed to start embedded MongoDB: ${memError.message}`);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      console.error('❌ FATAL: Cannot connect to MongoDB in production environment.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
