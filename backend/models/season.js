// models/Season.js
const mongoose = require('mongoose');

const seasonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    season: String,
    description: String,
    lipColors: [{
        name: String,
        color: String
    }]
}, { collection: 'seasonalData' });

module.exports = mongoose.model("seasonalData", seasonSchema);