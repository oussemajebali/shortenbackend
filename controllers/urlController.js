const Url = require('../models/urlModel');
const validator = require('validator');
const crypto = require('crypto');

const shortenUrl = async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl || !validator.isURL(originalUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        const shortUrl = crypto.randomBytes(4).toString('hex');
        const url = new Url({ originalUrl, shortUrl });
        await url.save();
        return res.status(200).json({ shortUrl });
    } catch (err) {
        console.error('Error in shortenUrl:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const redirectUrl = async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const url = await Url.findOne({ shortUrl });

        if (!url) {
            console.log(`URL not found: ${shortUrl}`); // Debug log
            return res.status(404).json({ error: 'URL not found' });
        }

        console.log(`Redirecting to: ${url.originalUrl}`); // Debug log
        return res.redirect(url.originalUrl);
    } catch (err) {
        console.error('Error in redirectUrl:', err); // Debug log
        return res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { shortenUrl, redirectUrl };