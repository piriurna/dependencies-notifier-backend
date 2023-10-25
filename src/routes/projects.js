const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const { updateProjectDependencies } = require('../services/dependencies');  // Make sure to export the function and adjust the path

// Create a New Project
router.post('/create', async (req, res) => {
    try {
        const { projectName, userId } = req.body;
        const newProject = new Project({ projectName, owners: [{ user: userId }] });
        await newProject.save();
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


module.exports = router;