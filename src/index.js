require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = 3000;

const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
    try {
        // Connect to MongoDB using Mongoose
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB successfully!");

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Exit the process with an error code
    }
}

startServer();
