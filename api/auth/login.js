
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    let user, table, nameField;

    if (userType === 'student') {
      table = 'students';
      nameField = 'name';
    } else if (userType === 'company') {
      table = 'companies';
      nameField = 'companyName';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    const query = `SELECT * FROM ${table} WHERE email = ?`;
    const [users] = await db.promise().execute(query, [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userData = users[0];
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    req.session.userId = userData.id;
    req.session.userType = userType;
    req.session.userName = userData[nameField];

    res.json({ 
      success: true, 
      message: 'Login successful!',
      redirectUrl: userType === 'student' ? '/student-dashboard.html' : '/company-dashboard.html'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

module.exports = router; 
