const express = require('express');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Get user notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();

    const unreadCount = await Notification.countDocuments({ owner: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
});

// Mark all as read
router.post('/mark-all-read', async (req, res, next) => {
  try {
    await Notification.updateOne({ owner: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
