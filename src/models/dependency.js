const { Schema, model } = require('mongoose');

const dependencySchema = new Schema({
    group: String,
    name: String,
    latestVersion: String,
    projectsInterested: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }]
});

const Dependency = model('Dependency', dependencySchema);

module.exports = Dependency;