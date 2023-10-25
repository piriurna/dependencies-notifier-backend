const express = require('express');
const User = require('../models/user');
const Dependency = require('../models/dependency');
const router = express.Router();

// Register or update a user's dependencies and FCM token
router.post('/register', async (req, res) => {
  const { fcmToken, dependencies, userId } = req.body;

  // Let's process each dependency
  const processedDeps = [];
  for (let dep of dependencies) {
      // Find if this dependency already exists
      let dependency = await Dependency.findOne({ group: dep.group, name: dep.name });

      if (!dependency) {
          // If it doesn't exist, create a new one
          dependency = new Dependency({ 
              group: dep.group,
              name: dep.name,
              latestVersion: dep.version // or whatever default you want 
          });
          await dependency.save();
      }

      // Add this dependency to the processed list
      processedDeps.push({
          dependency: dependency._id, 
          currentVersion: dep.version
      });
  }

  // Store or update the user's data in the database
  let user = await User.findOne({ userId });
  if (user) {
      user.dependencies = processedDeps;
      await user.save();
  } else {
      user = new User({ userId, fcmToken, dependencies: processedDeps });
      await user.save();
  }

  res.status(200).json({ message: 'User registered/updated successfully.' });
});

// Get all projects for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
      const user = await User.findOne({ userId: req.params.userId }).populate('projects.dependency');
      
      if (user) {
          // Get the IDs of all projects associated with this user
          const projectIds = user.projects.map(proj => proj.dependency);

          // Fetch the actual project details
          const projects = await Project.find({ '_id': { $in: projectIds } });
          
          res.status(200).json(projects);
      } else {
          res.status(404).send({ error: 'User not found.' });
      }
  } catch (error) {
      console.error('Error fetching projects for user:', error);
      res.status(500).send({ error: 'Failed to fetch projects for user.', details: error.message });
  }
});

module.exports = router;
