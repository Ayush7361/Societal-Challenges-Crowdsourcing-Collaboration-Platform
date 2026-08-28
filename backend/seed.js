const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Comment = require('./models/Comment');
const Vote = require('./models/Vote');

const hashedPasswordFor = async () => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash('password123', salt);
};

const seedData = async () => {
  try {
    const hashedPassword = await hashedPasswordFor();

    let admin = await User.findOne({ email: 'admin@samadhan.org' });
    let citizen = await User.findOne({ email: 'citizen@samadhan.org' });
    let institution = await User.findOne({ email: 'inst@nitdumka.edu.in' });
    let industry = await User.findOne({ email: 'industry@aarohan.org' });

    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@samadhan.org',
        password: hashedPassword,
        role: 'admin',
        organization: 'Samadhan Setu Core Administration',
      });
    }

    if (!citizen) {
      citizen = await User.create({
        name: 'Ramesh Kumar',
        email: 'citizen@samadhan.org',
        password: hashedPassword,
        role: 'citizen',
      });
    }

    if (!institution) {
      institution = await User.create({
        name: 'Prof. A. K. Sharma',
        email: 'inst@nitdumka.edu.in',
        password: hashedPassword,
        role: 'institution',
        organization: 'NIT Dumka Innovation & Rural Tech Cell',
        partnerType: 'academic',
        participationInterests: ['Innovation', 'Talent Discovery', 'Research Access'],
      });
    } else if (!institution.partnerType) {
      institution.partnerType = 'academic';
      institution.participationInterests = institution.participationInterests?.length
        ? institution.participationInterests
        : ['Innovation', 'Talent Discovery', 'Research Access'];
      await institution.save();
    }

    if (!industry) {
      industry = await User.create({
        name: 'Meera Joshi',
        email: 'industry@aarohan.org',
        password: hashedPassword,
        role: 'institution',
        organization: 'Aarohan Industries CSR & Innovation Cell',
        partnerType: 'industry',
        participationInterests: ['CSR', 'Visibility', 'Innovation'],
      });
    }

    const existingPilot = await Challenge.findOne({
      title: 'Handpump not working near Government Middle School',
    });

    if (!existingPilot) {
      const ruralChallenge = await Challenge.create({
        title: 'Handpump not working near Government Middle School',
        description:
          'Students and nearby households lack a dependable water source due to a deep borehole pump failure at the main school compound.',
        location: 'GMS Kathikund campus, Kathikund, Dumka, Jharkhand, 814103',
        state: 'Jharkhand',
        district: 'Dumka',
        locality: 'Kathikund',
        landmark: 'GMS Kathikund campus, opposite weekly haat',
        pincode: '814103',
        regionType: 'Rural',
        affectedWho: 'About 220 school children and 40 neighbouring Adivasi households who depend on this single handpump.',
        localContext:
          'No piped scheme in this panchayat. Women walk 1.5 km to a seasonal stream in summer. A tanker-based urban fix would not work here.',
        baselineMetric: '0 working public water points in 1 km; school closed water period 3 days/week in peak summer',
        category: 'Water & Sanitation',
        severity: 'Critical',
        affectedCount: 260,
        status: 'Open',
        createdBy: citizen._id,
        votesCount: 4,
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizen._id,
            changedAt: new Date(Date.now() - 86400000 * 3),
            note: 'Challenge submitted by citizen',
          },
          {
            status: 'Open',
            changedBy: admin._id,
            changedAt: new Date(Date.now() - 86400000 * 2),
            note: 'Verified and published for community voting & institutional proposals',
          },
        ],
      });

      await Vote.create({ challenge: ruralChallenge._id, user: citizen._id });
      await Comment.create({
        challenge: ruralChallenge._id,
        user: citizen._id,
        text: 'Over 200 children are affected daily. Urgent restoration or new solar handpump unit needed!',
      });
      console.log(`Seed: Rural pilot challenge created (${ruralChallenge._id})`);
    } else if (!existingPilot.locality) {
      existingPilot.state = 'Jharkhand';
      existingPilot.district = 'Dumka';
      existingPilot.locality = 'Kathikund';
      existingPilot.landmark = 'GMS Kathikund campus, opposite weekly haat';
      existingPilot.pincode = '814103';
      existingPilot.regionType = 'Rural';
      existingPilot.affectedWho =
        'About 220 school children and 40 neighbouring Adivasi households who depend on this single handpump.';
      existingPilot.localContext =
        'No piped scheme in this panchayat. Women walk 1.5 km to a seasonal stream in summer.';
      existingPilot.baselineMetric = '0 working public water points in 1 km';
      existingPilot.severity = existingPilot.severity || 'Critical';
      existingPilot.affectedCount = existingPilot.affectedCount || 260;
      existingPilot.location = 'GMS Kathikund campus, Kathikund, Dumka, Jharkhand, 814103';
      await existingPilot.save();
    }

    const urbanTitle = 'Ward 12 overhead tank supplies only 20 minutes a day';
    const existingUrban = await Challenge.findOne({ title: urbanTitle });
    if (!existingUrban) {
      const urbanChallenge = await Challenge.create({
        title: urbanTitle,
        description:
          'Municipal pipeline pressure collapses after 7:30 AM. Same category as rural handpump failure, but the fix is network pressure management — not a new borehole.',
        location: 'Lane 4, Ward 12, Ranchi Municipal Corporation, Ranchi, Jharkhand, 834001',
        state: 'Jharkhand',
        district: 'Ranchi',
        locality: 'Ward 12, Doranda',
        landmark: 'Lane 4, behind Government Girls High School',
        pincode: '834001',
        regionType: 'Urban',
        affectedWho: 'About 180 apartments and 12 street-vending families on Lane 4 who buy tanker water daily.',
        localContext:
          'Piped network exists but is leaky and over-extracted by booster pumps. A rural handpump solution would be the wrong intervention here.',
        baselineMetric: '20 minutes supply / day; 8 tankers purchased weekly on this lane',
        category: 'Water & Sanitation',
        severity: 'High',
        affectedCount: 720,
        status: 'Open',
        createdBy: citizen._id,
        votesCount: 2,
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizen._id,
            changedAt: new Date(Date.now() - 86400000 * 2),
            note: 'Challenge submitted by citizen',
          },
          {
            status: 'Open',
            changedBy: admin._id,
            changedAt: new Date(Date.now() - 86400000),
            note: 'Published — urban water-pressure case distinct from rural borehole failure',
          },
        ],
      });
      console.log(`Seed: Urban contrast challenge created (${urbanChallenge._id})`);
    }

    console.log('Seed: Demo accounts ready (admin, citizen, academic institution, industry CSR).');
  } catch (error) {
    console.error('Seed Error:', error);
  }
};

module.exports = seedData;
