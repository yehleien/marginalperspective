const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { Article } = require('../models');
const router = express.Router();

router.post('/submit_article', async (req, res) => {
    try {
        const { url } = req.body;
        const submitDate = new Date();

        // Fetch the title
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title = $('title').text();

        const newArticle = await Article.create({ url, submitDate, title });
        res.json(newArticle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/get_news', async (req, res) => {
    try {
        const articles = await Article.findAll({
            order: [['submitDate', 'DESC']]
        });
        res.json(articles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
