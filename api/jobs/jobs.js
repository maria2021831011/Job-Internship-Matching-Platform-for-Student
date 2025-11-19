
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});


router.get('/active', async (req, res) => {
  try {
    const query = `
      SELECT j.*, c.companyName, c.industry 
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      WHERE j.status = 'active' 
      AND (j.application_deadline >= CURDATE() OR j.application_deadline IS NULL)
      ORDER BY j.created_at DESC
    `;

    const [jobs] = await db.promise().execute(query);
    res.json({ success: true, jobs });

  } catch (error) {
    console.error('Error fetching active jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/check-application/:jobId', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const jobId = req.params.jobId;
    const studentId = req.session.userId;

    const query = 'SELECT * FROM applications WHERE job_id = ? AND student_id = ?';
    const [applications] = await db.promise().execute(query, [jobId, studentId]);

    res.json({ 
      success: true, 
      applied: applications.length > 0 
    });

  } catch (error) {
    console.error('Error checking application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/apply', upload.single('resume'), async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { jobId, coverLetter } = req.body;
    const studentId = req.session.userId;

    if (!jobId || jobId.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Job ID is required' 
      });
    }

   
    const jobCheckQuery = `
      SELECT j.*, c.companyName, c.id as company_id
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      WHERE j.id = ? AND j.status = "active"
    `;
    
    const [job] = await db.promise().execute(jobCheckQuery, [jobId]);
    
    if (job.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found or closed for applications' 
      });
    }

 
    const checkQuery = 'SELECT * FROM applications WHERE job_id = ? AND student_id = ?';
    const [existing] = await db.promise().execute(checkQuery, [jobId, studentId]);

    if (existing.length > 0) {
      return res.json({ 
        success: false, 
        message: 'You have already applied for this job' 
      });
    }

    const applyQuery = `
      INSERT INTO applications (job_id, student_id, cover_letter, resume_path, status)
      VALUES (?, ?, ?, ?, 'applied')
    `;

    const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    const [result] = await db.promise().execute(applyQuery, [
      jobId, 
      studentId, 
      coverLetter, 
      resumePath
    ]);

    
    const notificationQuery = `
      INSERT INTO notifications (user_id, user_type, title, message, type)
      VALUES (?, 'company', 'New Application', ?, 'application')
    `;
    
    await db.promise().execute(notificationQuery, [
      job[0].company_id,
      `New application from ${req.session.userName} for ${job[0].title}`
    ]);

    res.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      companyName: job[0].companyName
    });

  } catch (error) {
    console.error('Error applying for job:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'File too large. Maximum size is 5MB.' 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during application' 
    });
  }
});


router.get('/company', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT j.*, 
             (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
      FROM jobs j 
      WHERE j.company_id = ?
      ORDER BY j.created_at DESC
    `;

    const [jobs] = await db.promise().execute(query, [req.session.userId]);
    res.json({ success: true, jobs });

  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/applications', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { jobId, status } = req.query;
    const companyId = req.session.userId;

    let query = `
      SELECT 
        a.*,
        j.title as job_title,
        s.name as student_name,
        s.email as student_email,
        s.institution,
        s.department,
        s.skills as student_skills,
        sp.phone,
        sp.location,
        sp.resume_path,
        i.interview_date,  -- CHANGED: Use existing column instead of scheduled_date
        i.meeting_link
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN students s ON a.student_id = s.id
      LEFT JOIN student_profiles sp ON s.id = sp.student_id
      LEFT JOIN interviews i ON a.id = i.application_id AND i.status = 'scheduled'
      WHERE j.company_id = ?
    `;

    const params = [companyId];

    if (jobId && jobId !== 'all') {
      query += ' AND j.id = ?';
      params.push(jobId);
    }

    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.applied_at DESC';

    const [applications] = await db.promise().execute(query, params);
    
    res.json({ 
      success: true, 
      applications,
      filters: {
        jobId: jobId || 'all',
        status: status || 'all'
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/applications/:id/status', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { id } = req.params;
        const { status } = req.body;

        const query = `
            UPDATE applications a
            JOIN jobs j ON a.job_id = j.id
            SET a.status = ?
            WHERE a.id = ? AND j.company_id = ?
        `;

        const [result] = await db.promise().execute(query, [status, id, req.session.userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ success: true, message: 'Application status updated' });

    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

    const appQuery = `
      SELECT a.*, s.name as student_name, j.title as job_title, s.id as student_id
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `;
    
    const [applications] = await db.promise().execute(appQuery, [id]);
    
    if (applications.length > 0) {
      const app = applications[0];
      
      const notificationQuery = `
        INSERT INTO notifications (user_id, user_type, title, message, type)
        VALUES (?, 'student', 'Application Status Updated', ?, 'application')
      `;
      
      let message = '';
      switch(status) {
        case 'shortlisted':
          message = `Your application for ${app.job_title} has been shortlisted!`;
          break;
        case 'interview':
          message = `Congratulations! You've been selected for an interview for ${app.job_title}`;
          break;
        case 'hired':
          message = ` Congratulations! You've been hired for ${app.job_title}`;
          break;
        case 'rejected':
          message = `Update on your application for ${app.job_title}`;
          break;
        default:
          message = `Your application status for ${app.job_title} has been updated to ${status}`;
      }
      
      await db.promise().execute(notificationQuery, [
        app.student_id,
        message
      ]);
    }

    res.json({ success: true, message: 'Application status updated' });

router.post('/create', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const {
            title,
            description,
            requirements,
            location,
            job_type,
            salary_range,
            application_deadline,
            skills_required,
            status
        } = req.body;

        console.log('Creating job:', title);

        const query = `
            INSERT INTO jobs (company_id, title, description, requirements, location, job_type, salary_range, application_deadline, skills_required, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.promise().execute(query, [
            req.session.userId,
            title,
            description,
            requirements,
            location,
            job_type,
            salary_range,
            application_deadline,
            skills_required,
            status || 'active'
        ]);

        res.json({
            success: true,
            message: 'Job posted successfully!',
            jobId: result.insertId
        });

    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.post('/create', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const {
      title,
      description,
      requirements,
      location,
      job_type,
      salary_range,
      application_deadline,
      skills_required,
      status
    } = req.body;

    const query = `
      INSERT INTO jobs (company_id, title, description, requirements, location, job_type, salary_range, application_deadline, skills_required, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().execute(query, [
      req.session.userId,
      title,
      description,
      requirements,
      location,
      job_type,
      salary_range,
      application_deadline,
      skills_required,
      status || 'active'
    ]);

    res.json({
      success: true,
      message: 'Job posted successfully!',
      jobId: result.insertId
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/student/applications', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT 
        a.*,
        j.title as job_title,
        j.location,
        j.job_type,
        c.companyName,
        i.interview_date,  -- CHANGED: Use existing column
        i.meeting_link,
        i.status as interview_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN interviews i ON a.id = i.application_id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC
    `;

    const [applications] = await db.promise().execute(query, [req.session.userId]);
    
    res.json({ success: true, applications });

  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const jobId = req.params.id;
    const {
      title,
      description,
      requirements,
      location,
      job_type,
      salary_range,
      application_deadline,
      skills_required,
      status
    } = req.body;

    const query = `
      UPDATE jobs 
      SET title = ?, description = ?, requirements = ?, location = ?, job_type = ?, 
          salary_range = ?, application_deadline = ?, skills_required = ?, status = ?
      WHERE id = ? AND company_id = ?
    `;

    const [result] = await db.promise().execute(query, [
      title,
      description,
      requirements,
      location,
      job_type,
      salary_range,
      application_deadline,
      skills_required,
      status,
      jobId,
      req.session.userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job updated successfully!' });

  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.delete('/:id', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const jobId = req.params.id;

    const query = 'DELETE FROM jobs WHERE id = ? AND company_id = ?';
    const [result] = await db.promise().execute(query, [jobId, req.session.userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted successfully!' });

  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;