const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./config/database');
const app = express();
const PORT = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('.'));

app.use(session({
  secret: 'careerlaunch-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000
  }
}));

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

app.use('/api/auth', require('./api/auth/register'));
app.use('/api/auth', require('./api/auth/login'));

app.post('/api/auth/logout', (req, res) => {
 
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
    
    console.log('User logged out successfully');
    res.json({ 
      success: true, 
      message: 'Logout successful',
      redirectUrl: '/login.html'
    });
  });
});


app.get('/api/auth/status', (req, res) => {
  if (req.session.userId && req.session.userType) {
    res.json({
      loggedIn: true,
      userType: req.session.userType,
      userName: req.session.userName,
      userId: req.session.userId
    });
  } else {
 
    req.session.destroy(() => {
      res.json({ loggedIn: false });
    });
  }
});


app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});