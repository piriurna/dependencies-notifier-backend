const { Schema, model } = require('mongoose');

const projectDependencySchema = new Schema({
    dependency: {
        type: Schema.Types.ObjectId,
        ref: 'Dependency'
    },
    currentVersion: String
});

const projectSchema = new Schema({
    projectName: String,
    owners: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
  }], 
    dependencies: [projectDependencySchema]
});

const Project = model('Project', projectSchema);

module.exports = Project;