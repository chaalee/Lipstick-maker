// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Season = require('./models/Season'); // Import the model

const app = express();
app.use(cors());
app.use(express.json());

const dbUrl = "mongodb+srv://Kirana:Lipstick@cluster0.jru2h.mongodb.net/SkintoneAnalyzer";

mongoose
    .connect(dbUrl)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// API Routes
app.get("/api/seasons", async (req, res) => {
    try {
        console.log("Fetching data from seasonalData collection...");
        const seasonalData = await Season.find();
        console.log("Data retrieved:", seasonalData);
        res.json(seasonalData);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/seasons/:season", async (req, res) => {
    try {
        const seasonData = await Season.findOne({ season: req.params.season });
        if (!seasonData) {
            return res.status(404).json({ message: "Season not found" });
        }
        res.json(seasonData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const startServer = async (port) => {
    try {
        await app.listen(port);
        console.log(`Server is running on port ${port}`);
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Error starting server:', error);
        }
    }
};

startServer(5001);