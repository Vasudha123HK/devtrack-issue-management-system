const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

dotenv.config({ path: path.join(__dirname, '../../.env') });

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
  {
    name: 'Marcus Chen (Dev)',
    email: 'marcus@devtrack.io',
    password: 'Password123!',
    role: 'Developer',
  },
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devtrack_db';
    await mongoose.connect(mongoURI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Issue.deleteMany();
    await Comment.deleteMany();
    console.log('🧹 Cleaned existing database collections');

    // Create Users
    const createdUsers = await User.create(seedUsers);
    console.log(`👤 Created ${createdUsers.length} seed users`);

    const admin = createdUsers[0];
    const dev1 = createdUsers[1];
    const dev2 = createdUsers[2];
    const dev3 = createdUsers[3];

    // Create Realistic Sample Issues
    const sampleIssues = [
      {
        title: 'JWT authentication token expires prematurely on mobile Safari',
        description: 'Users on iOS WebKit browsers report session timeouts after 5 minutes despite 7-day token expiration. Need to inspect cookie and header transmission handling.',
        priority: 'High',
        status: 'In Progress',
        assignedTo: dev1._id,
        createdBy: admin._id,
      },
      {
        title: 'Database connection pool exhaustion under load testing',
        description: 'Under simulated 500 concurrent requests, Mongoose throws serverSelectionTimeoutMS error. Implement connection pooling parameters and retry logic.',
        priority: 'High',
        status: 'Open',
        assignedTo: dev2._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement search debounce on Issue list filter component',
        description: 'Every keystroke in the search bar triggers an immediate API request. Add 300ms debounce hook to optimize server load and UI responsiveness.',
        priority: 'Medium',
        status: 'Resolved',
        assignedTo: dev3._id,
        createdBy: dev1._id,
      },
      {
        title: 'Dark mode contrast issues on priority badge pills',
        description: 'Low priority badges with slate-500 text lack sufficient WCAG contrast on dark background containers. Update badge colors to high contrast palette.',
        priority: 'Low',
        status: 'Resolved',
        assignedTo: dev1._id,
        createdBy: dev2._id,
      },
      {
        title: 'Add CSV export functionality for monthly issue audit reports',
        description: 'Admins need to export resolved and open issues to CSV for quarterly sprint reviews and KPI tracking.',
        priority: 'Medium',
        status: 'Open',
        assignedTo: dev2._id,
        createdBy: admin._id,
      },
      {
        title: 'Security vulnerability: Rate limit login attempts per IP',
        description: 'Add express-rate-limit middleware to /api/auth/login endpoint to prevent brute-force attacks.',
        priority: 'High',
        status: 'In Progress',
        assignedTo: dev3._id,
        createdBy: admin._id,
      },
      {
        title: 'Fix issue detail markdown rendering for multi-line code snippets',
        description: 'Fenced code blocks inside issue descriptions occasionally overflow container margins on mobile viewport.',
        priority: 'Low',
        status: 'Open',
        assignedTo: null,
        createdBy: dev3._id,
      },
    ];

    const createdIssues = await Issue.create(sampleIssues);
    console.log(`📋 Created ${createdIssues.length} sample issues`);

    // Add comments to issues
    const sampleComments = [
      {
        issue: createdIssues[0]._id,
        author: dev1._id,
        content: 'I reproduced this issue on iOS 17.4. It appears Safari is dropping Authorization headers on 302 redirects. Testing fix now.',
      },
      {
        issue: createdIssues[0]._id,
        author: admin._id,
        content: 'Great find Alex. Let me know when you have a PR ready so we can test across staging.',
      },
      {
        issue: createdIssues[1]._id,
        author: dev2._id,
        content: 'Configured maxPoolSize: 50 and socketTimeoutMS: 45000 in db connection options. Running k6 stress tests.',
      },
      {
        issue: createdIssues[2]._id,
        author: dev3._id,
        content: 'Created custom useDebounce hook and wrapped search query state. Tested with Network tab throttling, works cleanly!',
      },
    ];

    await Comment.create(sampleComments);
    console.log(`💬 Created ${sampleComments.length} sample comments`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('------------------------------------------------');
    console.log('Admin Account:    admin@devtrack.io  / Password123!');
    console.log('Developer 1:      alex@devtrack.io   / Password123!');
    console.log('Developer 2:      elena@devtrack.io  / Password123!');
    console.log('Developer 3:      marcus@devtrack.io / Password123!');
    console.log('------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
