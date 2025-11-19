const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

router.get('/student', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'student') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const query = `
            SELECT * FROM student_settings WHERE student_id = ?
            UNION ALL
            SELECT ? as student_id, TRUE as email_notifications, 'public' as profile_visibility, 
                   'light' as theme, TRUE as job_alerts, 'public' as resume_visibility, 'en' as language,
                   NOW() as created_at, NOW() as updated_at
            FROM DUAL
            WHERE NOT EXISTS (SELECT 1 FROM student_settings WHERE student_id = ?)
            LIMIT 1
        `;

        const [settings] = await db.promise().execute(query, [req.session.userId, req.session.userId, req.session.userId]);
        
        res.json({ success: true, settings: settings[0] });
    } catch (error) {
        console.error('Error fetching student settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.put('/student', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'student') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { email_notifications, profile_visibility, theme, job_alerts, resume_visibility, language } = req.body;
        const studentId = req.session.userId;

        const checkQuery = 'SELECT * FROM student_settings WHERE student_id = ?';
        const [existingSettings] = await db.promise().execute(checkQuery, [studentId]);

        if (existingSettings.length > 0) {
           
            const updateQuery = `
                UPDATE student_settings 
                SET email_notifications = ?, profile_visibility = ?, theme = ?, 
                    job_alerts = ?, resume_visibility = ?, language = ?, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = ?
            `;
            await db.promise().execute(updateQuery, [
                email_notifications, profile_visibility, theme, job_alerts, resume_visibility, language, studentId
            ]);
        } else {
            
            const insertQuery = `
                INSERT INTO student_settings 
                (student_id, email_notifications, profile_visibility, theme, job_alerts, resume_visibility, language)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await db.promise().execute(insertQuery, [
                studentId, email_notifications, profile_visibility, theme, job_alerts, resume_visibility, language
            ]);
        }

        res.json({ success: true, message: 'Settings updated successfully!' });
    } catch (error) {
        console.error('Error updating student settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/company', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const query = `
            SELECT * FROM company_settings WHERE company_id = ?
            UNION ALL
            SELECT ? as company_id, TRUE as email_notifications, 'public' as profile_visibility, 
                   'light' as theme, TRUE as application_alerts, FALSE as job_auto_archive, 'en' as language,
                   NOW() as created_at, NOW() as updated_at
            FROM DUAL
            WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE company_id = ?)
            LIMIT 1
        `;

        const [settings] = await db.promise().execute(query, [req.session.userId, req.session.userId, req.session.userId]);
        
        res.json({ success: true, settings: settings[0] });
    } catch (error) {
        console.error('Error fetching company settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.put('/company', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'company') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { email_notifications, profile_visibility, theme, application_alerts, job_auto_archive, language } = req.body;
        const companyId = req.session.userId;

        const checkQuery = 'SELECT * FROM company_settings WHERE company_id = ?';
        const [existingSettings] = await db.promise().execute(checkQuery, [companyId]);

        if (existingSettings.length > 0) {
            
            const updateQuery = `
                UPDATE company_settings 
                SET email_notifications = ?, profile_visibility = ?, theme = ?, 
                    application_alerts = ?, job_auto_archive = ?, language = ?, updated_at = CURRENT_TIMESTAMP
                WHERE company_id = ?
            `;
            await db.promise().execute(updateQuery, [
                email_notifications, profile_visibility, theme, application_alerts, job_auto_archive, language, companyId
            ]);
        } else {
            
            const insertQuery = `
                INSERT INTO company_settings 
                (company_id, email_notifications, profile_visibility, theme, application_alerts, job_auto_archive, language)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await db.promise().execute(insertQuery, [
                companyId, email_notifications, profile_visibility, theme, application_alerts, job_auto_archive, language
            ]);
        }

        res.json({ success: true, message: 'Settings updated successfully!' });
    } catch (error) {
        console.error('Error updating company settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.put('/change-password', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.userId;
        const userType = req.session.userType;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const tableName = userType === 'student' ? 'students' : 'companies';
        const query = `SELECT password FROM ${tableName} WHERE id = ?`;
        const [users] = await db.promise().execute(query, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

       
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

     
        const updateQuery = `UPDATE ${tableName} SET password = ? WHERE id = ?`;
        await db.promise().execute(updateQuery, [hashedPassword, userId]);

        res.json({ success: true, message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;