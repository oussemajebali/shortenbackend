const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: { type: Object, required: true }, // Stores encrypted URL
    shortUrl: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Url', urlSchema);