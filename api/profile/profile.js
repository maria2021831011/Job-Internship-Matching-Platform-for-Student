const express = require('express');
const router = express.Router();
const db = require('../../config/database'); // FIXED PATH
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure profiles directory exists
const profilesDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Configure multer for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get student profile
router.get('/student', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const [students] = await db.promise().execute(
      `SELECT s.*, 
              sp.phone, 
              sp.graduation_date, 
              sp.location, 
              sp.bio, 
              sp.skills, 
              sp.resume_path,
              sp.profile_picture
       FROM students s 
       LEFT JOIN student_profiles sp ON s.id = sp.student_id 
       WHERE s.id = ?`,
      [req.session.userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, profile: students[0] });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update student profile
router.put('/student', upload.single('profile_picture'), async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { name, email, phone, graduation_date, location, bio, skills } = req.body;

    // Update students table
    await db.promise().execute(
      'UPDATE students SET name = ?, email = ? WHERE id = ?',
      [name, email, req.session.userId]
    );

    // Update or insert student profile
    const [existing] = await db.promise().execute(
      'SELECT * FROM student_profiles WHERE student_id = ?',
      [req.session.userId]
    );

    const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    if (existing.length > 0) {
      await db.promise().execute(
        `UPDATE student_profiles 
         SET phone = ?, graduation_date = ?, location = ?, bio = ?, skills = ?,
             profile_picture = COALESCE(?, profile_picture)
         WHERE student_id = ?`,
        [phone, graduation_date, location, bio, skills, profilePicture, req.session.userId]
      );
    } else {
      await db.promise().execute(
        `INSERT INTO student_profiles (student_id, phone, graduation_date, location, bio, skills, profile_picture)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.session.userId, phone, graduation_date, location, bio, skills, profilePicture]
      );
    }

    // Update session
    req.session.userName = name;

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get company profile
router.get('/company', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const [companies] = await db.promise().execute(
      `SELECT c.*, 
              cp.phone, 
              cp.website, 
              cp.description, 
              cp.logo_path,
              cp.size,
              cp.founded_year
       FROM companies c 
       LEFT JOIN company_profiles cp ON c.id = cp.company_id 
       WHERE c.id = ?`,
      [req.session.userId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, profile: companies[0] });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update company profile
router.put('/company', upload.single('logo'), async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { companyName, email, phone, website, description, size, founded_year } = req.body;

    // Update companies table
    await db.promise().execute(
      'UPDATE companies SET companyName = ?, email = ? WHERE id = ?',
      [companyName, email, req.session.userId]
    );

    // Update or insert company profile
    const [existing] = await db.promise().execute(
      'SELECT * FROM company_profiles WHERE company_id = ?',
      [req.session.userId]
    );

    const logoPath = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    if (existing.length > 0) {
      await db.promise().execute(
        `UPDATE company_profiles 
         SET phone = ?, website = ?, description = ?, size = ?, founded_year = ?,
             logo_path = COALESCE(?, logo_path)
         WHERE company_id = ?`,
        [phone, website, description, size, founded_year, logoPath, req.session.userId]
      );
    } else {
      await db.promise().execute(
        `INSERT INTO company_profiles (company_id, phone, website, description, size, founded_year, logo_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.session.userId, phone, website, description, size, founded_year, logoPath]
      );
    }

    // Update session
    req.session.userName = companyName;

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;