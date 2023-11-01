const express = require('express');
const User = require('../models/user');
const Dependency = require('../models/dependency');
const router = express.Router();

// Register or update a user's dependencies and FCM token
router.post('/register', async (req, res) => {
  const { fcmToken, userId } = req.body;

  // Store or update the user's data in the database
  let user = await User.findOne({ userId });
  if (user) {
      await user.save();
  } else {
      user = new User({ userId, fcmToken });
      await user.save();
  }

  res.status(200).json({ message: 'User registered/updated successfully.' });
});

module.exports = router;
