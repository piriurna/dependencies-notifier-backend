const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const { updateProjectDependencies } = require('../services/dependencies');  // Make sure to export the function and adjust the path
const User = require('../models/user');

// Create a New Project
router.post('/create', async (req, res) => {
    try {
        const { projectName, userId } = req.body;
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }
        const newProject = new Project({ projectName, owners: [user] });
        await newProject.save();
        
        // Add the new project reference to the user's projects list
        user.projects.push({ dependency: newProject._id });
        await user.save();
        
        res.status(201).json({ message: 'Project created successfully.', projectId: newProject._id });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).send({ error: 'Failed to create project.', details: error.message });
    }
});


// Get Project by ID
router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate('dependencies.dependency');
        if (project) {
            res.status(200).json(project);
        } else {
            res.status(404).send({ error: 'Project not found.' });
        }
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).send({ error: 'Failed to fetch project.', details: error.message });
    }
});

// Update Project Dependencies
router.post('/update-dependencies/:projectId', async (req, res) => {
    try {
        const { dependencies } = req.body;
        await updateProjectDependencies(req.params.projectId, dependencies);
        res.status(200).send({ message: 'Project dependencies updated successfully.' });
    } catch (error) {
        console.error('Error updating project dependencies:', error);
        res.status(500).send({ error: 'Failed to update project dependencies.', details: error.message });
    }
});

// Delete a Project
router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.projectId);
        res.status(200).send({ message: 'Project deleted successfully.' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).send({ error: 'Failed to delete project.', details: error.message });
    }
});

// Get all dependencies of a specific project
router.get('/:projectId/dependencies', async (req, res) => {
  try {
      const project = await Project.findById(req.params.projectId).populate('dependencies.dependency');
      if (project) {
          res.status(200).json(project.dependencies);
      } else {
          res.status(404).send({ error: 'Project not found.' });
      }
  } catch (error) {
      console.error('Error fetching project dependencies:', error);
      res.status(500).send({ error: 'Failed to fetch project dependencies.', details: error.message });
  }
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
            
            res.status(200).json({projects});
        } else {
            res.status(404).send({ error: 'User not found.' });
        }
    } catch (error) {
        console.error('Error fetching projects for user:', error);
        res.status(500).send({ error: 'Failed to fetch projects for user.', details: error.message });
    }
  });


module.exports = router;
