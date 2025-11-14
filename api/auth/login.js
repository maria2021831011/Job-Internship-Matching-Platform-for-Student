const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const router = express.Router();

router.post('/login', (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Request Body:', req.body);
  
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    console.log('❌ Missing fields:', { 
      email: !!email, 
      password: !!password, 
      userType: userType 
    });
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  console.log(`🔍 Searching in table: ${userType === 'student' ? 'students' : 'companies'}`);
  console.log(`📧 Email: ${email}`);
  console.log(`👤 User Type: ${userType}`);

  const table = userType === 'student' ? 'students' : 'companies';
  const nameField = userType === 'student' ? 'name' : 'companyName';

  db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }

    console.log(`📊 Found ${results.length} records`);

    if (results.length === 0) {
      console.log('❌ No user found with email:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = results[0];
    console.log(' User found:', {
      id: user.id,
      name: user[nameField],
      email: user.email,
      hasPassword: !!user.password
    });

    try {
      console.log(' Comparing password...');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(' Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

    
      req.session.userId = user.id;
      req.session.userType = userType;
      req.session.userName = user[nameField];
      req.session.userEmail = user.email;
      
      console.log('Login successful for:', user[nameField]);
      console.log(' Session set:', { 
        userId: user.id, 
        userType: userType, 
        userName: user[nameField] 
      });
      
      res.json({ 
        success: true, 
        message: 'Login successful!',
        userType: userType,
        redirectUrl: userType === 'student' ? '/stu.html' : '/com.html'
      });
    } catch (hashError) {
      console.error(' Password comparison error:', hashError);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }
  });
});

module.exports = router; 
