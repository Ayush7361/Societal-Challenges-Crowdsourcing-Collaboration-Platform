const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const seedData = require('./seed');

const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const scopeRevisionRoutes = require('./routes/scopeRevisionRoutes');

const upload = require('./middleware/upload');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploads from disk, then MongoDB if the file is missing
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/uploads/:filename', upload.serveUploadedImage);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scope-revisions', scopeRevisionRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Samadhan Setu API is operational' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`Samadhan Setu Backend Server running on port ${PORT}`);
  });
});
