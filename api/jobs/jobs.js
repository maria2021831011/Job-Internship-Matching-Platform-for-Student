const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Create new job
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
      status
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

// Get company's jobs
router.get('/company', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT j.*, c.companyName 
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      WHERE j.company_id = ?
      ORDER BY j.created_at DESC
    `;

    const [jobs] = await db.promise().execute(query, [req.session.userId]);
    res.json({ success: true, jobs });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all active jobs for students
router.get('/active', async (req, res) => {
  try {
    const query = `
      SELECT j.*, c.companyName, c.industry 
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
    `;

    const [jobs] = await db.promise().execute(query);
    res.json({ success: true, jobs });

  } catch (error) {
    console.error('Error fetching active jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Apply for job
router.post('/apply', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'student') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { jobId, coverLetter } = req.body;

    // Check if already applied
    const checkQuery = 'SELECT * FROM applications WHERE job_id = ? AND student_id = ?';
    const [existing] = await db.promise().execute(checkQuery, [jobId, req.session.userId]);

    if (existing.length > 0) {
      return res.json({ success: false, message: 'You have already applied for this job' });
    }

    const applyQuery = `
      INSERT INTO applications (job_id, student_id, cover_letter, status)
      VALUES (?, ?, ?, 'applied')
    `;

    await db.promise().execute(applyQuery, [jobId, req.session.userId, coverLetter]);

    res.json({ success: true, message: 'Application submitted successfully!' });

  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get applications for company's jobs
router.get('/applications', async (req, res) => {
  if (!req.session.userId || req.session.userType !== 'company') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT 
        a.*,
        j.title as job_title,
        s.name as student_name,
        s.email as student_email,
        s.institution,
        s.department,
        s.skills as student_skills
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN students s ON a.student_id = s.id
      WHERE j.company_id = ?
      ORDER BY a.applied_at DESC
    `;

    const [applications] = await db.promise().execute(query, [req.session.userId]);
    res.json({ success: true, applications });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update application status
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

module.exports = router;