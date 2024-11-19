const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const WebSocket = require('ws');
const serial = require('serialport');
const Ingredients = require('./models/ingredients');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://Kirana:Lipstick@cluster0.jru2h.mongodb.net/SkintoneAnalyzer")
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Serial connection to Pico
const pico = new serial.SerialPort({
    path: '/dev/tty.usbserial-A104VDBO',
    baudRate: 115200
});

// WebSocket server
const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', async (ws) => {
    console.log('WebSocket connected');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received from frontend:', data);

            if (data.action === 'move_conveyor' && data.lipstick) {
                console.log('Looking up lipstick:', data.lipstick);
                
                // Find lipstick in nested structure
                const season = await Ingredients.findOne({
                    'lipColors.name': data.lipstick
                });

                if (!season) {
                    console.log('Lipstick not found:', data.lipstick);
                    ws.send(JSON.stringify({ error: 'Lipstick not found' }));
                    return;
                }

                // Find the specific lipstick in the season's lipColors array
                const lipstick = season.lipColors.find(l => l.name === data.lipstick);
                console.log('Found lipstick data:', lipstick);

                const command = {
                    action: 'move',
                    lipstick: lipstick.name,
                    valveTimings: {
                        valve1: lipstick.ingredients.purple || 0,
                        valve2: lipstick.ingredients.oros || 0,
                        valve3: lipstick.ingredients.red || 0
                    }
                };
                
                console.log('Sending to Pico:', command);
                pico.write(JSON.stringify(command) + '\n');
            }
            else if (data.action === 'home') {
                console.log('Sending home command to Pico');
                // Send proper JSON command for home
                const command = {
                    action: 'home'
                };
                pico.write(JSON.stringify(command) + '\n');
            }
        } catch (error) {
            console.error('Error:', error);
            ws.send(JSON.stringify({ error: error.message }));
        }
    });
});

// REST endpoints
app.get("/api/ingredients", async (req, res) => {
    try {
        const ingredientsData = await Ingredients.find();
        res.json(ingredientsData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update the lipsticks endpoint to show all lipsticks
app.get("/api/lipsticks", async (req, res) => {
    try {
        const seasons = await Ingredients.find();
        const allLipsticks = seasons.reduce((acc, season) => {
            return [...acc, ...season.lipColors.map(lipstick => ({
                name: lipstick.name,
                season: season.season,
                // description: season.description,
                ingredients: lipstick.ingredients,
                color: lipstick.color
            }))];
        }, []);
        res.json(allLipsticks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
app.listen(5001, () => console.log('REST Server running on port 5001'));