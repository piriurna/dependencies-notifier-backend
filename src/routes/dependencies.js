const express = require('express');
const router = express.Router();
const { updateProjectDependencies, checkAndUpdateLatestVersions, addOrUpdateDependency } = require('../services/dependencies');
const Project = require('../models/project');


router.post('/update-project-dependencies', async (req, res) => {
  try {
      const projectId = req.body.projectId;
      const dependenciesGradle = req.body.dependenciesGradle;

      // Optional: Validate and parse dependenciesGradle if needed.

      // Find the user with the given FCM token
      const project = await Project.findOne({ projectId });

      if (!project) {
          return res.status(404).send({ error: 'Project not found for the given project id.' });
      }

      await updateProjectDependencies(project._id, dependenciesGradle);
      res.status(200).send({ message: 'Successfully updated project dependencies.' });
  } catch (error) {
      // Log the actual error for debugging
      console.error('Error updating project dependencies:', error);
      res.status(500).send({ error: 'Failed to update project dependencies.', details: error.message });
  }
});

router.get('/check-latest-versions', async (req, res) => {
    try {
        await checkAndUpdateLatestVersions();
        res.status(200).send({ message: 'Successfully checked and updated dependencies.' });
    } catch (error) {
        // Log the actual error for debugging
        console.error('Error checking and updating latest versions:', error);
        res.status(500).send({ error: 'Failed to check for latest versions.', details: error.message });
    }
});

router.post('/get-users', async (req, res) => {
  try {
      const { group, name } = req.body;
      const dependency = await Dependency.findOne({ group, name });
      
      if (dependency) {
          const projects = await Project.find({ '_id': { $in: dependency.projectsInterested } });
          const userIds = projects.flatMap(proj => proj.owners.map(owner => owner.user));
          const users = await User.find({ '_id': { $in: userIds } });
          
          res.status(200).json(users);
      } else {
          res.status(404).send({ error: 'Dependency not found.' });
      }
  } catch (error) {
      console.error('Error fetching users for dependency:', error);
      res.status(500).send({ error: 'Failed to fetch users for dependency.', details: error.message });
  }
});

router.post('/add-dependency-to-project', async (req, res) => {
    try {
        const { projectId, group, name, currentVersion } = req.body;

        // Validate the input
        if (!projectId || !group || !name || !currentVersion) {
            return res.status(400).send({ error: 'Missing required fields.' });
        }

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send({ error: 'Project not found.' });
        }

        // Add or update the dependency
        const dependency = await addOrUpdateDependency(projectId, group, name, currentVersion);

        res.status(200).json(dependency);
    } catch (error) {
        console.error('Error adding dependency to project:', error);
        res.status(500).send({ error: 'Failed to add dependency to project.', details: error.message });
    }
});

module.exports = router;