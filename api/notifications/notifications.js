const express = require('express');
const router = express.Router();
const db = require('../../config/database'); // FIXED PATH

// Get notifications for user
router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = ? AND user_type = ?
      ORDER BY created_at DESC 
      LIMIT 50
    `;

    const [notifications] = await db.promise().execute(query, [
      req.session.userId, req.session.userType
    ]);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await db.promise().execute(
      'UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ? AND user_type = ?',
      [req.params.id, req.session.userId, req.session.userType]
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await db.promise().execute(
      'UPDATE notifications SET read_status = TRUE WHERE user_id = ? AND user_type = ? AND read_status = FALSE',
      [req.session.userId, req.session.userType]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create notification (internal use)
async function createNotification(userId, userType, title, message, type = 'system') {
  try {
    await db.promise().execute(
      'INSERT INTO notifications (user_id, user_type, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [userId, userType, title, message, type]
    );
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

module.exports = router;