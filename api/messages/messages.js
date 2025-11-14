const express = require('express');
const router = express.Router();
const db = require('../../config/database'); 

router.get('/conversations', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userType = req.session.userType;
    const userId = req.session.userId;

    let query, params;

    if (userType === 'student') {
      query = `
        SELECT DISTINCT 
          c.id as partner_id, 
          c.companyName as partner_name,
          'company' as partner_type,
          (SELECT message FROM messages 
           WHERE ((sender_id = ? AND sender_type = 'student' AND receiver_id = c.id AND receiver_type = 'company')
                  OR (sender_id = c.id AND sender_type = 'company' AND receiver_id = ? AND receiver_type = 'student'))
           ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages 
           WHERE ((sender_id = ? AND sender_type = 'student' AND receiver_id = c.id AND receiver_type = 'company')
                  OR (sender_id = c.id AND sender_type = 'company' AND receiver_id = ? AND receiver_type = 'student'))
           ORDER BY created_at DESC LIMIT 1) as last_message_time,
          (SELECT COUNT(*) FROM messages 
           WHERE sender_id = c.id AND sender_type = 'company' 
           AND receiver_id = ? AND receiver_type = 'student'
           AND read_status = FALSE) as unread_count
        FROM companies c
        WHERE EXISTS (
          SELECT 1 FROM messages 
          WHERE (sender_id = ? AND sender_type = 'student' AND receiver_id = c.id AND receiver_type = 'company')
             OR (sender_id = c.id AND sender_type = 'company' AND receiver_id = ? AND receiver_type = 'student')
        )
        ORDER BY last_message_time DESC
      `;
      params = [userId, userId, userId, userId, userId, userId, userId];
    } else {
      query = `
        SELECT DISTINCT 
          s.id as partner_id, 
          s.name as partner_name,
          s.institution,
          'student' as partner_type,
          (SELECT message FROM messages 
           WHERE ((sender_id = ? AND sender_type = 'company' AND receiver_id = s.id AND receiver_type = 'student')
                  OR (sender_id = s.id AND sender_type = 'student' AND receiver_id = ? AND receiver_type = 'company'))
           ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages 
           WHERE ((sender_id = ? AND sender_type = 'company' AND receiver_id = s.id AND receiver_type = 'student')
                  OR (sender_id = s.id AND sender_type = 'student' AND receiver_id = ? AND receiver_type = 'company'))
           ORDER BY created_at DESC LIMIT 1) as last_message_time,
          (SELECT COUNT(*) FROM messages 
           WHERE sender_id = s.id AND sender_type = 'student' 
           AND receiver_id = ? AND receiver_type = 'company'
           AND read_status = FALSE) as unread_count
        FROM students s
        WHERE EXISTS (
          SELECT 1 FROM messages 
          WHERE (sender_id = ? AND sender_type = 'company' AND receiver_id = s.id AND receiver_type = 'student')
             OR (sender_id = s.id AND sender_type = 'student' AND receiver_id = ? AND receiver_type = 'company')
        )
        ORDER BY last_message_time DESC
      `;
      params = [userId, userId, userId, userId, userId, userId, userId];
    }

    const [conversations] = await db.promise().execute(query, params);
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
router.get('/:partnerId', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const partnerId = req.params.partnerId;
    const userType = req.session.userType;
    const userId = req.session.userId;

    const query = `
      SELECT * FROM messages 
      WHERE ((sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
             OR (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?))
      ORDER BY created_at ASC
    `;

    const partnerType = userType === 'student' ? 'company' : 'student';

    const [messages] = await db.promise().execute(query, [
      userId, userType, partnerId, partnerType,
      partnerId, partnerType, userId, userType
    ]);

  
    await db.promise().execute(
      `UPDATE messages SET read_status = TRUE 
       WHERE sender_id = ? AND sender_type = ? 
       AND receiver_id = ? AND receiver_type = ?
       AND read_status = FALSE`,
      [partnerId, partnerType, userId, userType]
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/send', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { receiver_id, message, receiver_type } = req.body;
    const sender_type = req.session.userType;
    const sender_id = req.session.userId;

    const query = `
      INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, message)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().execute(query, [
      sender_id, receiver_id, sender_type, receiver_type, message
    ]);

    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;