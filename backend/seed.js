const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Comment = require('./models/Comment');
const Vote = require('./models/Vote');

const seedData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Seed: Database already populated. Skipping initial seed.');
      return;
    }

    console.log('Seed: Populating initial demo data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Demo Users
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@samadhan.org',
      password: hashedPassword,
      role: 'admin',
      organization: 'Samadhan Setu Core Administration',
    });

    const citizen = await User.create({
      name: 'Ramesh Kumar',
      email: 'citizen@samadhan.org',
      password: hashedPassword,
      role: 'citizen',
    });

    const institution = await User.create({
      name: 'Prof. A. K. Sharma',
      email: 'inst@nitdumka.edu.in',
      password: hashedPassword,
      role: 'institution',
      organization: 'NIT Dumka Innovation & Rural Tech Cell',
    });

    console.log('Seed: Created 3 demo accounts (admin, citizen, institution).');

    // 2. Create Pilot Challenge
    const pilotChallenge = await Challenge.create({
      title: 'Handpump not working near Government Middle School',
      description: 'Students and nearby households lack a dependable water source due to a deep borehole pump failure at the main school compound.',
      location: 'Dumka, Jharkhand',
      category: 'Water & Sanitation',
      status: 'Open',
      createdBy: citizen._id,
      votesCount: 4,
      statusHistory: [
        {
          status: 'Pending',
          changedBy: citizen._id,
          changedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
          note: 'Challenge submitted by citizen',
        },
        {
          status: 'Open',
          changedBy: admin._id,
          changedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          note: 'Verified and published for community voting & institutional proposals',
        },
      ],
    });

    // 3. Seed votes and initial comments
    await Vote.create({ challenge: pilotChallenge._id, user: citizen._id });
    await Comment.create({
      challenge: pilotChallenge._id,
      user: citizen._id,
      text: 'Over 200 children are affected daily. Urgent restoration or new solar handpump unit needed!',
    });

    console.log(`Seed: Successfully seeded Pilot Challenge (ID: ${pilotChallenge._id})`);
  } catch (error) {
    console.error('Seed Error:', error);
  }
};

module.exports = seedData;
