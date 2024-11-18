// models/Season.js
const mongoose = require('mongoose');

const seasonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    season: String,
    description: String,
    lipColors: [{
        name: String,
        color: String,
        ingredients: {
            purple: Number,
            red: Number,
            oros: Number
        }
    }]
}, { collection: 'Lipstick_ingredients' });  

module.exports = mongoose.model("Lipstick_ingredients", seasonSchema);  