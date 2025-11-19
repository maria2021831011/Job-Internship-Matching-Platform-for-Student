
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const profilesDir = path.join(__dirname, '../../uploads/profiles');
const resumesDir = path.join(__dirname, '../../uploads/resumes');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

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
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});


router.get('/student', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT 
        s.id, s.name, s.email, s.institution, s.department,
        sp.phone, sp.graduation_date, sp.location, sp.bio, 
        sp.skills, sp.resume_path, sp.profile_picture
      FROM students s
      LEFT JOIN student_profiles sp ON s.id = sp.student_id
      WHERE s.id = ?
    `;

    const [students] = await db.promise().execute(query, [req.session.userId]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const profile = students[0];
    
    
    let formattedGraduation = '';
    if (profile.graduation_date) {
      const date = new Date(profile.graduation_date);
      formattedGraduation = date.toISOString().substring(0, 7); 
    }
    
    const formattedProfile = {
      id: profile.id,
      name: profile.name || '',
      email: profile.email || '',
      institution: profile.institution || '',
      department: profile.department || '',
      phone: profile.phone || '',
      graduation_date: formattedGraduation,
      location: profile.location || '',
      bio: profile.bio || '',
      skills: profile.skills || '',
      resume_path: profile.resume_path || '',
      profile_picture: profile.profile_picture || ''
    };

    res.json({ success: true, profile: formattedProfile });

  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
});

router.put('/student', upload.single('profile_picture'), async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { name, email, phone, graduation_date, location, bio, skills } = req.body;
    const studentId = req.session.userId;

    console.log('Updating profile for student:', studentId);

   
    let formattedGraduationDate = null;
    if (graduation_date) {
      if (/^\d{4}-\d{2}$/.test(graduation_date)) {
        formattedGraduationDate = graduation_date + '-01'; 
      } else {
        formattedGraduationDate = graduation_date;
      }
    }

    const updateStudentQuery = 'UPDATE students SET name = ?, email = ? WHERE id = ?';
    await db.promise().execute(updateStudentQuery, [name, email, studentId]);
    console.log(' Students table updated');

    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    }

    
    const checkProfileQuery = 'SELECT * FROM student_profiles WHERE student_id = ?';
    const [existingProfiles] = await db.promise().execute(checkProfileQuery, [studentId]);

    if (existingProfiles.length > 0) {
      
      const updateProfileQuery = `
        UPDATE student_profiles 
        SET phone = ?, graduation_date = ?, location = ?, bio = ?, skills = ?, 
            profile_picture = COALESCE(?, profile_picture),
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `;
      await db.promise().execute(updateProfileQuery, [
        phone, formattedGraduationDate, location, bio, skills, profilePicturePath, studentId
      ]);
      console.log('Existing profile updated');
    } else {
      
      const insertProfileQuery = `
        INSERT INTO student_profiles 
        (student_id, phone, graduation_date, location, bio, skills, profile_picture)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await db.promise().execute(insertProfileQuery, [
        studentId, phone, formattedGraduationDate, location, bio, skills, profilePicturePath
      ]);
      console.log('New profile created');
    }
    req.session.userName = name;

    res.json({ 
      success: true, 
      message: 'Profile updated successfully!',
      profile_picture: profilePicturePath 
    });

  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile: ' + error.message 
    });
  }
});

router.get('/student/:studentId/public', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const studentId = req.params.studentId;
    
    const query = `
      SELECT 
        s.id, s.name, s.email, s.institution, s.department,
        sp.phone, sp.graduation_date, sp.location, sp.bio, 
        sp.skills, sp.resume_path, sp.profile_picture
      FROM students s
      LEFT JOIN student_profiles sp ON s.id = sp.student_id
      WHERE s.id = ?
    `;

    const [students] = await db.promise().execute(query, [studentId]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const profile = students[0];
  
    let formattedGraduation = '';
    if (profile.graduation_date) {
      const date = new Date(profile.graduation_date);
      formattedGraduation = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    
    const publicProfile = {
      id: profile.id,
      name: profile.name || '',
      institution: profile.institution || '',
      department: profile.department || '',
      graduation_date: formattedGraduation,
      location: profile.location || '',
      bio: profile.bio || '',
      skills: profile.skills || '',
      resume_path: profile.resume_path || '',
      profile_picture: profile.profile_picture || ''
    };

    res.json({ success: true, profile: publicProfile });

  } catch (error) {
    console.error('Error fetching student public profile:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching student profile' });
  }
});

router.get('/student/:studentId/resume', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const studentId = req.params.studentId;
    
    const query = 'SELECT resume_path FROM student_profiles WHERE student_id = ?';
    const [profiles] = await db.promise().execute(query, [studentId]);
    
    if (profiles.length === 0 || !profiles[0].resume_path) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const resumePath = path.join(resumesDir, path.basename(profiles[0].resume_path));
    
    if (fs.existsSync(resumePath)) {
      res.sendFile(resumePath);
    } else {
      res.status(404).json({ success: false, message: 'Resume file not found' });
    }

  } catch (error) {
    console.error('Error fetching student resume:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching resume' });
  }
});
router.get('/company', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT c.*, cp.phone, cp.website, cp.description, cp.logo_path, cp.size, cp.founded_year
      FROM companies c
      LEFT JOIN company_profiles cp ON c.id = cp.company_id
      WHERE c.id = ?
    `;

    const [companies] = await db.promise().execute(query, [req.session.userId]);
    
    if (companies.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, profile: companies[0] });

  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching company profile' });
  }
});
router.put('/company', upload.single('logo'), async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { companyName, email, industry, phone, website, description, size, founded_year } = req.body;
    const companyId = req.session.userId;

    console.log('Updating profile for company:', companyId);
    console.log('Received data:', { companyName, email, industry, phone, website, description, size, founded_year });

    
    const updateCompanyQuery = 'UPDATE companies SET companyName = ?, email = ?, industry = ? WHERE id = ?';
    await db.promise().execute(updateCompanyQuery, [companyName, email, industry, companyId]);
    console.log('Companies table updated');
    let logoPath = null;
    if (req.file) {
      logoPath = `/uploads/profiles/${req.file.filename}`;
      console.log('Logo path:', logoPath);
    }

   
    const checkProfileQuery = 'SELECT * FROM company_profiles WHERE company_id = ?';
    const [existingProfiles] = await db.promise().execute(checkProfileQuery, [companyId]);

    if (existingProfiles.length > 0) {
     
      const updateProfileQuery = `
        UPDATE company_profiles 
        SET phone = ?, website = ?, description = ?, size = ?, founded_year = ?,
            logo_path = COALESCE(?, logo_path),
            updated_at = CURRENT_TIMESTAMP
        WHERE company_id = ?
      `;
      await db.promise().execute(updateProfileQuery, [
        phone, website, description, size, founded_year, logoPath, companyId
      ]);
      console.log('Existing company profile updated');
    } else {
    
      const insertProfileQuery = `
        INSERT INTO company_profiles 
        (company_id, phone, website, description, size, founded_year, logo_path)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await db.promise().execute(insertProfileQuery, [
        companyId, phone, website, description, size, founded_year, logoPath
      ]);
      console.log(' New company profile created');
    }

   
    req.session.userName = companyName;

    res.json({ 
      success: true, 
      message: 'Company profile updated successfully!',
      logo_path: logoPath 
    });

  } catch (error) {
    console.error(' Error updating company profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating company profile: ' + error.message 
    });
  }
});

router.get('/profile-picture/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(profilesDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: 'Profile picture not found' });
  }
});


router.get('/resume/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(resumesDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: 'Resume not found' });
  }
});

module.exports = router;