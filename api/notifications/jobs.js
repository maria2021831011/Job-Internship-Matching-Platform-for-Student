const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
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

// Get all active jobs for students - FIXED
router.get('/active', async (req, res) => {
    try {
        console.log('Fetching active jobs...');
        const query = `
            SELECT j.*, c.companyName, c.industry 
            FROM jobs j 
            JOIN companies c ON j.company_id = c.id 
            WHERE j.status = 'active' 
            AND (j.application_deadline >= CURDATE() OR j.application_deadline IS NULL)
            ORDER BY j.created_at DESC
        `;

        const [jobs] = await db.promise().execute(query);
        console.log(`Found ${jobs.length} active jobs`);
        
        res.json({ success: true, jobs });

    } catch (error) {
        console.error('Error fetching active jobs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



// Check if student already applied - ADD THIS
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
/*

// Apply for job - FIXED
router.post('/apply', upload.single('resume'), async (req, res) => {
    console.log('=== JOB APPLICATION STARTED ===');
    
    if (!req.session.userId || req.session.userType !== 'student') {
        console.log('Unauthorized: Not a student');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { jobId, coverLetter } = req.body;
        const studentId = req.session.userId;
        
        console.log('Application details:', { jobId, studentId, coverLetter: coverLetter ? 'Yes' : 'No' });

        if (!jobId) {
            return res.json({ success: false, message: 'Job ID is required' });
        }

        // Check if job exists and is active
        const jobCheckQuery = `
            SELECT j.*, c.companyName 
            FROM jobs j 
            JOIN companies c ON j.company_id = c.id 
            WHERE j.id = ? AND j.status = "active"
        `;
        
        console.log('Checking job existence...');
        const [job] = await db.promise().execute(jobCheckQuery, [jobId]);
        
        if (job.length === 0) {
            console.log('Job not found or inactive:', jobId);
            return res.json({ success: false, message: 'Job not found or closed' });
        }

        console.log('Job found:', job[0].title, 'Company:', job[0].companyName);

        // Check if already applied
        console.log('Checking existing application...');
        const checkQuery = 'SELECT * FROM applications WHERE job_id = ? AND student_id = ?';
        const [existing] = await db.promise().execute(checkQuery, [jobId, studentId]);

        if (existing.length > 0) {
            console.log('Already applied to this job');
            return res.json({ success: false, message: 'You have already applied for this job' });
        }

        // Save application
        console.log('Saving application...');
        const applyQuery = `
            INSERT INTO applications (job_id, student_id, cover_letter, resume_path, status)
            VALUES (?, ?, ?, ?, 'applied')
        `;

        const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;
        console.log('Resume path:', resumePath);

        const [result] = await db.promise().execute(applyQuery, [
            jobId, 
            studentId, 
            coverLetter, 
            resumePath
        ]);

        console.log('Application saved with ID:', result.insertId);

        res.json({ 
            success: true, 
            message: 'Application submitted successfully!',
            companyName: job[0].companyName
        });

    } catch (error) {
        console.error('Error applying for job:', error);
        
        // Handle multer errors
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
            }
        }
        
        res.status(500).json({ success: false, message: 'Server error during application' });
    }
});*/
// Apply for job - ENHANCED VALIDATION
router.post('/apply', upload.single('resume'), async (req, res) => {
    console.log('=== JOB APPLICATION STARTED ===');
    
    if (!req.session.userId || req.session.userType !== 'student') {
        console.log('Unauthorized: Not a student');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { jobId, coverLetter } = req.body;
        const studentId = req.session.userId;
        
        console.log('Application details:', { 
            jobId: jobId || 'MISSING', 
            studentId, 
            coverLetter: coverLetter ? 'Yes' : 'No',
            body: req.body 
        });

        // Enhanced validation
        if (!jobId || jobId.trim() === '') {
            console.log('❌ Job ID is missing or empty');
            return res.status(400).json({ 
                success: false, 
                message: 'Job ID is required. Please refresh and try again.' 
            });
        }

        // Check if job exists and is active
        const jobCheckQuery = `
            SELECT j.*, c.companyName 
            FROM jobs j 
            JOIN companies c ON j.company_id = c.id 
            WHERE j.id = ? AND j.status = "active"
        `;
        
        console.log('Checking job existence for ID:', jobId);
        const [job] = await db.promise().execute(jobCheckQuery, [jobId]);
        
        if (job.length === 0) {
            console.log('Job not found or inactive:', jobId);
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found or closed for applications' 
            });
        }

        console.log('Job found:', job[0].title, 'Company:', job[0].companyName);

        // Check if already applied
        console.log('Checking existing application...');
        const checkQuery = 'SELECT * FROM applications WHERE job_id = ? AND student_id = ?';
        const [existing] = await db.promise().execute(checkQuery, [jobId, studentId]);

        if (existing.length > 0) {
            console.log('Already applied to this job');
            return res.json({ 
                success: false, 
                message: 'You have already applied for this job' 
            });
        }

        // Save application
        console.log('Saving application...');
        const applyQuery = `
            INSERT INTO applications (job_id, student_id, cover_letter, resume_path, status)
            VALUES (?, ?, ?, ?, 'applied')
        `;

        const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;
        console.log('Resume path:', resumePath);

        const [result] = await db.promise().execute(applyQuery, [
            jobId, 
            studentId, 
            coverLetter, 
            resumePath
        ]);

        console.log('Application saved with ID:', result.insertId);

        res.json({ 
            success: true, 
            message: 'Application submitted successfully!',
            companyName: job[0].companyName
        });

    } catch (error) {
        console.error('Error applying for job:', error);
        
        // Handle multer errors
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

// Get company's jobs - FIXED
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

// Get applications for company's jobs - FIXED
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
        
        console.log(`Company ${req.session.userId} viewing ${applications.length} applications`);
        
        res.json({ success: true, applications });

    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update application status - FIXED
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

// Create new job - FIXED
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

module.exports = router;