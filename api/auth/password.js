const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../../config/database');
const router = express.Router();

// Store reset tokens temporarily (in production use Redis or Database)
const resetTokens = new Map();

// Forgot Password - Send reset link
router.post('/forgot-password', (req, res) => {
  const { email, userType } = req.body;

  console.log('Forgot password request:', { email, userType });

  if (!email || !userType) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and user type are required' 
    });
  }

  const table = userType === 'student' ? 'students' : 'companies';

  // Check if user exists
  db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    if (results.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No account found with this email' 
      });
    }

    const user = results[0];
    
    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour from now

    // Store token in memory
    resetTokens.set(token, { 
      email, 
      userType, 
      expires,
      userId: user.id
    });

    console.log(`Reset token generated for ${email}: ${token}`);
    console.log(`Token expires at: ${new Date(expires).toLocaleString()}`);

    // For demo purposes, return the token and reset link
    const resetLink = `http://localhost:3000/reset-password.html?token=${token}&userType=${userType}`;

    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email',
      token: token, // For demo only
      resetLink: resetLink // For demo only
    });
  });
});

// Verify reset token
router.get('/verify-reset-token/:token', (req, res) => {
  const { token } = req.params;

  console.log('Verifying token:', token);

  const tokenData = resetTokens.get(token);
  
  if (!tokenData) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired reset token' 
    });
  }

  if (Date.now() > tokenData.expires) {
    resetTokens.delete(token);
    return res.status(400).json({ 
      success: false, 
      message: 'Reset token has expired' 
    });
  }

  res.json({
    success: true,
    message: 'Token is valid',
    email: tokenData.email,
    userType: tokenData.userType
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, password, userType } = req.body;

  console.log('Reset password request:', { token, userType });

  if (!token || !password || !userType) {
    return res.status(400).json({ 
      success: false, 
      message: 'Token, password and user type are required' 
    });
  }

  // Validate token
  const tokenData = resetTokens.get(token);
  if (!tokenData) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired reset token' 
    });
  }

  if (Date.now() > tokenData.expires) {
    resetTokens.delete(token);
    return res.status(400).json({ 
      success: false, 
      message: 'Reset token has expired' 
    });
  }

  // Check if token userType matches request userType
  if (tokenData.userType !== userType) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user type for this reset token' 
    });
  }

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    const table = userType === 'student' ? 'students' : 'companies';

    // Update password in database
    db.query(
      `UPDATE ${table} SET password = ? WHERE email = ?`,
      [hashedPassword, tokenData.email],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error resetting password' 
          });
        }

        if (results.affectedRows === 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        console.log(`Password reset successfully for: ${tokenData.email}`);

        // Remove used token
        resetTokens.delete(token);

        res.json({
          success: true,
          message: 'Password reset successfully! You can now login with your new password.'
        });
      }
    );
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during password reset' 
    });
  }
});

// Clean up expired tokens (runs every hour)
setInterval(() => {
  const now = Date.now();
  let expiredCount = 0;
  
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expires) {
      resetTokens.delete(token);
      expiredCount++;
    }
  }
  
  if (expiredCount > 0) {
    console.log(`Cleaned up ${expiredCount} expired reset tokens`);
  }
}, 3600000);

module.exports = router;