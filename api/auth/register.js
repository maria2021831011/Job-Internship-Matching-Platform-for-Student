const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/database');
const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});


const noUpload = multer();


router.post('/register_student', upload.single('resume'), async (req, res) => {
  console.log('=== STUDENT REGISTRATION STARTED ===');
  console.log('Body:', req.body);

  try {
    const { name, email, password, institution, department, skills, availability } = req.body;

    if (!name || !email || !password || !institution || !department) {
      console.log('Missing required fields');
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled' 
      });
    }

    const checkStudentQuery = 'SELECT * FROM students WHERE email = ?';
    db.query(checkStudentQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (results.length > 0) {
        console.log('Student already exists');
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          success: false, 
          message: 'Student already exists with this email' 
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const resumeFilename = req.file ? req.file.filename : null;

        const insertQuery = `
          INSERT INTO students (name, email, password, institution, department, skills, availability, resume) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [
          name, email, hashedPassword, institution, department, skills, availability, resumeFilename
        ], (err, results) => {
          if (err) {
            console.error('Insert error:', err);
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ 
              success: false, 
              message: 'Registration failed' 
            });
          }
          
          console.log('Student registered successfully');
          res.json({ 
            success: true, 
            message: 'Student registration successful!' 
          });
        });
      } catch (hashError) {
        console.error('Password hash error:', hashError);
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Password processing error' 
        });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});


router.post('/register_company', noUpload.none(), async (req, res) => {
  console.log('=== COMPANY REGISTRATION STARTED ===');
  console.log('Body:', req.body);
  
  try {
    const { companyName, email, password, industry, website, description } = req.body;

    if (!companyName || !email || !password || !industry) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled' 
      });
    }

    const checkCompanyQuery = 'SELECT * FROM companies WHERE email = ?';
    db.query(checkCompanyQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (results.length > 0) {
        console.log('Company already exists');
        return res.status(400).json({ 
          success: false, 
          message: 'Company already exists with this email' 
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = `
          INSERT INTO companies (companyName, email, password, industry, website, description) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [
          companyName, email, hashedPassword, industry, website, description
        ], (err, results) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ 
              success: false, 
              message: 'Registration failed' 
            });
          }
          
          console.log('Company registered successfully');
          res.json({ 
            success: true, 
            message: 'Company registration successful!' 
          });
        });
      } catch (hashError) {
        console.error('Password hash error:', hashError);
        return res.status(500).json({ 
          success: false, 
          message: 'Password processing error' 
        });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;