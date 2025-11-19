const express = require('express');
const router = express.Router();
const db = require('../../config/database');


router.get('/profile', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'student') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const query = `
            SELECT s.*, sp.phone, sp.graduation_date, sp.location, sp.bio, sp.skills, 
                   sp.resume_path, sp.profile_picture
            FROM students s 
            LEFT JOIN student_profiles sp ON s.id = sp.student_id 
            WHERE s.id = ?
        `;

        const [students] = await db.promise().execute(query, [req.session.userId]);
        
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, profile: students[0] });

    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.put('/profile', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'student') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { name, institution, department, phone, graduation_date, location, bio, skills } = req.body;

        
        await db.promise().execute(
            'UPDATE students SET name = ?, institution = ?, department = ?, skills = ? WHERE id = ?',
            [name, institution, department, skills, req.session.userId]
        );

        
        const [existing] = await db.promise().execute(
            'SELECT * FROM student_profiles WHERE student_id = ?',
            [req.session.userId]
        );

        if (existing.length > 0) {
            
            await db.promise().execute(
                `UPDATE student_profiles 
                 SET phone = ?, graduation_date = ?, location = ?, bio = ?, skills = ?
                 WHERE student_id = ?`,
                [phone, graduation_date, location, bio, skills, req.session.userId]
            );
        } else {
            
            await db.promise().execute(
                `INSERT INTO student_profiles 
                 (student_id, phone, graduation_date, location, bio, skills) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [req.session.userId, phone, graduation_date, location, bio, skills]
            );
        }

        req.session.userName = name;

        res.json({ 
            success: true, 
            message: 'Profile updated successfully!' 
        });

    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;