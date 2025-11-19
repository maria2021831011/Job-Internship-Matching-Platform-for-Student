
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./config/database');
const multer = require('multer'); 
const app = express();
const PORT = 3000;


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

app.get('/forgot-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

app.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset-password.html'));
});


app.get('/student-dashboard.html', (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'stu.html'));
});

app.get('/company-dashboard.html', (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'com.html'));
});


app.use('/api/auth', require('./api/auth/register'));
app.use('/api/auth', require('./api/auth/login'));
app.use('/api/profile', require('./api/profile/profile'));
app.use('/api/settings', require('./api/settings/settings')); 
app.use('/api/jobs', require('./api/jobs/jobs'));


app.use('/uploads', express.static('uploads'));


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


app.get('/api/company/dashboard', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'company') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const companyId = req.session.userId;

    const [jobs] = await db.promise().execute(
      'SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND status = "active"',
      [companyId]
    );

 
    const [applicants] = await db.promise().execute(
      `SELECT COUNT(DISTINCT a.student_id) as count 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE j.company_id = ?`,
      [companyId]
    );

    const [interviews] = await db.promise().execute(
      'SELECT COUNT(*) as count FROM interviews WHERE company_id = ? AND status = "scheduled"',
      [companyId]
    );


    const [hires] = await db.promise().execute(
      `SELECT COUNT(*) as count FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE j.company_id = ? AND a.status = "hired"`,
      [companyId]
    );

    const [recentJobs] = await db.promise().execute(
      `SELECT j.*, COUNT(a.id) as application_count 
       FROM jobs j 
       LEFT JOIN applications a ON j.id = a.job_id 
       WHERE j.company_id = ? AND j.status = "active" 
       GROUP BY j.id 
       ORDER BY j.created_at DESC 
       LIMIT 3`,
      [companyId]
    );

  
    const [recentApplicants] = await db.promise().execute(
      `SELECT a.*, s.name as student_name, s.email as student_email, 
              s.institution, j.title as job_title, sp.skills as student_skills
       FROM applications a 
       JOIN students s ON a.student_id = s.id 
       JOIN jobs j ON a.job_id = j.id 
       LEFT JOIN student_profiles sp ON s.id = sp.student_id 
       WHERE j.company_id = ? 
       ORDER BY a.applied_at DESC 
       LIMIT 5`,
      [companyId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          activeJobs: jobs[0].count,
          totalApplicants: applicants[0].count,
          interviewsScheduled: interviews[0].count,
          successfulHires: hires[0].count
        },
        recentJobs: recentJobs,
        recentApplicants: recentApplicants
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ success: false, message: 'Error loading dashboard data' });
  }
});


app.post('/api/interviews/quick-schedule', async (req, res) => {
    try {
        if (!req.session.userId || req.session.userType !== 'company') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { studentId, studentName, studentEmail, interviewDateTime, interviewMethod, meetingLink } = req.body;

      
        if (!studentEmail || !interviewDateTime || !interviewMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'Required fields missing' 
            });
        }

      
        const query = `
            INSERT INTO interviews (company_id, student_id, student_email, interview_date, meeting_platform, meeting_link, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
        `;
        
        await db.promise().execute(query, [
            req.session.userId,
            studentId,
            studentEmail,
            interviewDateTime,
            interviewMethod,
            meetingLink || null
        ]);

        console.log('Quick interview scheduled:', {
            companyId: req.session.userId,
            studentId,
            studentEmail,
            interviewDateTime,
            interviewMethod
        });

        
        await updateApplicationStatus(studentId, req.session.userId, interviewMethod);

        res.json({
            success: true,
            message: 'Interview scheduled successfully!',
            data: {
                studentName,
                interviewDateTime,
                interviewMethod
            }
        });

    } catch (error) {
        console.error('Quick schedule error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error scheduling interview' 
        });
    }
});

async function updateApplicationStatus(studentId, companyId, interviewMethod) {
    try {
        const updateQuery = `
            UPDATE applications a 
            JOIN jobs j ON a.job_id = j.id 
            SET a.status = 'interview', a.interview_date = NOW(), a.interview_notes = ?
            WHERE a.student_id = ? AND j.company_id = ?
            ORDER BY a.applied_at DESC 
            LIMIT 1
        `;
        
        await db.promise().execute(updateQuery, [
            `Interview scheduled via ${interviewMethod}`,
            studentId,
            companyId
        ]);

        console.log('Application status updated to interview for student:', studentId);
    } catch (error) {
        console.error('Error updating application status:', error);
    }
}

app.post('/api/interviews/schedule', async (req, res) => {
    try {
        if (!req.session.userId || req.session.userType !== 'company') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { candidateEmail, interviewDateTime, interviewMethod, companyName } = req.body;

   
        if (!candidateEmail || !interviewDateTime || !interviewMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

      
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(candidateEmail)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }

        const query = `
            INSERT INTO interviews (company_id, student_email, interview_date, meeting_platform, status, created_at)
            VALUES (?, ?, ?, ?, 'scheduled', NOW())
        `;
        
        await db.promise().execute(query, [
            req.session.userId,
            candidateEmail,
            interviewDateTime,
            interviewMethod
        ]);

        console.log('Interview scheduled:', {
            companyId: req.session.userId,
            candidateEmail,
            interviewDateTime, 
            interviewMethod
        });

        res.json({
            success: true,
            message: 'Interview invitation sent successfully!',
            data: {
                candidateEmail,
                interviewDateTime,
                interviewMethod
            }
        });

    } catch (error) {
        console.error('Interview scheduling error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error scheduling interview' 
        });
    }
});


app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    console.log('Password reset requested for email:', email);

   
    const [students] = await db.promise().execute(
      'SELECT id, name FROM students WHERE email = ?',
      [email]
    );

   
    const [companies] = await db.promise().execute(
      'SELECT id, companyName as name FROM companies WHERE email = ?',
      [email]
    );

    const user = students.length > 0 ? students[0] : companies.length > 0 ? companies[0] : null;
    const userType = students.length > 0 ? 'student' : companies.length > 0 ? 'company' : null;


    if (!user) {
      console.log('Email not found in database:', email);
      return res.json({ 
        success: true, 
        message: 'If your email is registered, you will receive a password reset link shortly.' 
      });
    }

    console.log('User found for password reset:', {
      userId: user.id,
      userName: user.name,
      userType: userType,
      email: email
    });

   
    const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    console.log('Reset token generated:', resetToken);

    
    console.log(`[EMAIL SIMULATION] Password reset email sent to: ${email}`);
    console.log(`[EMAIL SIMULATION] Reset link: http://localhost:${PORT}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`);

    res.json({ 
      success: true, 
      message: 'Password reset link has been sent to your email!' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing your request. Please try again.' 
    });
  }
});

app.post('/api/auth/resend-reset-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    console.log('Resend reset link requested for:', email);

    const [students] = await db.promise().execute(
      'SELECT id, name FROM students WHERE email = ?',
      [email]
    );

    const [companies] = await db.promise().execute(
      'SELECT id, companyName as name FROM companies WHERE email = ?',
      [email]
    );

    const userExists = students.length > 0 || companies.length > 0;

    if (!userExists) {
      console.log('Email not found for resend:', email);
      return res.json({ 
        success: true, 
        message: 'If your email is registered, you will receive a new reset link shortly.' 
      });
    }

    
    const newResetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    console.log('New reset token generated:', newResetToken);
    console.log(`[EMAIL SIMULATION] New reset link sent to: ${email}`);
    console.log(`[EMAIL SIMULATION] New reset link: http://localhost:${PORT}/reset-password.html?token=${newResetToken}&email=${encodeURIComponent(email)}`);

    res.json({ 
      success: true, 
      message: 'New password reset link has been sent to your email!' 
    });

  } catch (error) {
    console.error('Resend reset link error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending reset link. Please try again.' 
    });
  }
});


app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    console.log('Password reset attempt:', { email, token, newPasswordLength: newPassword.length });

  
    if (!token.startsWith('reset_')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    
    const [studentUpdate] = await db.promise().execute(
      'UPDATE students SET password = ? WHERE email = ?',
      [newPassword, email]
    );

    let userType = 'student';
    let affectedRows = studentUpdate.affectedRows;

    if (affectedRows === 0) {
      const [companyUpdate] = await db.promise().execute(
        'UPDATE companies SET password = ? WHERE email = ?',
        [newPassword, email]
      );
      
      affectedRows = companyUpdate.affectedRows;
      userType = 'company';
    }

    if (affectedRows === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset link or user not found' 
      });
    }

    console.log(`Password updated successfully for ${userType}: ${email}`);

    res.json({ 
      success: true, 
      message: 'Password reset successfully! You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password. Please try again.' 
    });
  }
});


const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX files allowed'), false);
    }
  }
});


app.post('/api/profile/resume', resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'student') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select resume file' });
    }

    const studentId = req.session.userId;
    
    const updateQuery = `
      INSERT INTO student_profiles (student_id, resume_path, updated_at) 
      VALUES (?, ?, NOW()) 
      ON DUPLICATE KEY UPDATE resume_path = ?, updated_at = NOW()
    `;
    
    await db.promise().execute(updateQuery, [studentId, req.file.filename, req.file.filename]);

    res.json({
      success: true,
      message: 'Resume uploaded successfully!',
      resume_path: req.file.filename
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading resume' });
  }
});


app.delete('/api/profile/resume', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'student') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const studentId = req.session.userId;
    
    const updateQuery = `UPDATE student_profiles SET resume_path = NULL WHERE student_id = ?`;
    await db.promise().execute(updateQuery, [studentId]);

    res.json({ success: true, message: 'Resume deleted successfully!' });

  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ success: false, message: 'Error deleting resume' });
  }
});


app.get('/api/profile/resume/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(resumesDir, filename);
    
 
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }
    
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    
    
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Resume view error:', error);
    res.status(500).json({ success: false, message: 'Error viewing resume' });
  }
});


app.get('/api/profile/resume/:filename/download', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(resumesDir, filename);
    
   
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }
    
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ success: false, message: 'Error downloading resume' });
  }
});

app.get('/api/profile/student/:studentId/resume', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'company') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const studentId = req.params.studentId;
    
    const [profiles] = await db.promise().execute(
      'SELECT resume_path FROM student_profiles WHERE student_id = ?',
      [studentId]
    );
    
    if (profiles.length === 0 || !profiles[0].resume_path) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    
    const resumePath = profiles[0].resume_path;
    const filePath = path.join(resumesDir, resumePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found' });
    }
    
    
    const ext = path.extname(resumePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${resumePath}"`);
    
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Student resume view error:', error);
    res.status(500).json({ success: false, message: 'Error viewing student resume' });
  }
});


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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error'
  });
});


app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});


app.listen(PORT, () => {
  console.log(`CareerLaunch server running on http://localhost:${PORT}`);
  console.log('Make sure MySQL server is running on localhost:3306');
  console.log('Forgot password available at: http://localhost:3000/forgot-password.html');
});

module.exports = app;