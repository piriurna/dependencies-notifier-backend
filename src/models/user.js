const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: String, 
    fcmToken: String,
    projects: [{
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        }
    }]
});

const User = model('User', userSchema);

module.exports = User;