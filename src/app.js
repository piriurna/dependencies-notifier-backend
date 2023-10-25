const express = require('express');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/users');
const dependenciesRoutes = require('./routes/dependencies');

const app = express();

// Middleware
app.use(bodyParser.json()); // Parses incoming requests with JSON payloads

// Routes
app.use('/users', userRoutes);
app.use('/dependencies', dependenciesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
