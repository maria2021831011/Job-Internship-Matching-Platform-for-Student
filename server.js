const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./config/database');
const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(__dirname, 'uploads/resumes');
const profilesDir = path.join(__dirname, 'uploads/profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('.'));

// Session configuration
app.use(session({
  secret: 'careerlaunch-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Basic routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'registration.html'));
});

app.get('/registration.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'registration.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/stu.html', (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'stu.html'));
});

app.get('/com.html', (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'com.html'));
});

// API routes - FIXED PATHS
app.use('/api/auth', require('./api/auth/register'));
app.use('/api/auth', require('./api/auth/login'));

// Add these routes with correct paths
app.use('/api/profile', require('./api/profile/profile'));
app.use('/api/messages', require('./api/messages/messages'));
app.use('/api/notifications', require('./api/notifications/notifications'));

// Enhanced logout endpoint
app.post('/api/auth/logout', (req, res) => {
  const userId = req.session.userId;
  const userType = req.session.userType;
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: false 
    });
    
    console.log(`User ${userId} (${userType}) logged out successfully`);
    res.json({ 
      success: true, 
      message: 'Logout successful',
      redirectUrl: '/login.html'
    });
  });
});

// Enhanced auth status endpoint
app.get('/api/auth/status', async (req, res) => {
  if (req.session.userId && req.session.userType) {
    try {
      let userData = {};
      
      if (req.session.userType === 'student') {
        const [students] = await db.promise().execute(
          'SELECT id, name, email, institution, department FROM students WHERE id = ?',
          [req.session.userId]
        );
        if (students.length > 0) {
          userData = students[0];
        }
      } else if (req.session.userType === 'company') {
        const [companies] = await db.promise().execute(
          'SELECT id, companyName as name, email, industry FROM companies WHERE id = ?',
          [req.session.userId]
        );
        if (companies.length > 0) {
          userData = companies[0];
        }
      }
      
      res.json({
        loggedIn: true,
        userType: req.session.userType,
        userName: req.session.userName,
        userId: req.session.userId,
        userData: userData
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.json({
        loggedIn: true,
        userType: req.session.userType,
        userName: req.session.userName,
        userId: req.session.userId
      });
    }
  } else {
    res.json({ loggedIn: false });
  }
});

// File uploads static serving
app.use('/uploads', express.static('uploads'));

// Jobs API routes
app.use('/api/jobs', require('./api/jobs/jobs'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CareerLaunch server running on http://localhost:${PORT}`);
  console.log('Make sure MySQL server is running on localhost:3306');
});

module.exports = app;

