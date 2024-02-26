const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { Article } = require('../models');
const router = express.Router();

router.get('/get_latest', async (req, res) => {
    try {
        const index = req.query.index || 0;
        const article = await Article.findAll({
            order: [['submitDate', 'DESC']],
            offset: index,
            limit: 1
        });
        res.json(article[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Article.findAndCountAll({
            offset: offset,
            limit: limit,
            order: [['submitDate', 'DESC']] // Assuming you have a 'submitDate' field to sort by
        });

        res.json({
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            articles: rows
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Error fetching articles' });
    }
});

async function scrapeAndSubmitArticles() {
    try {
        const { data } = await axios.get('https://text.npr.org/');
        const $ = cheerio.load(data);
        const excludedTitles = ['Culture', 'Music', 'Contact Us', 'Privacy Policy', 'News','Permissions','Terms of Use','Go To Full Site'];

        $('a').each(async (index, element) => {
            const title = $(element).text();
            const url = $(element).attr('href');

            if (excludedTitles.includes(title) || !url) {
                return;
            }

            const fullUrl = 'https://text.npr.org' + url;
            const submitDate = new Date();

            try {
                await Article.findOrCreate({
                    where: { url: fullUrl },
                    defaults: { submitDate, title }
                });
            } catch (error) {
                console.error('Error submitting article:', error);
            }
        });
    } catch (error) {
        console.error('Error scraping articles:', error);
    }
}

router.get('/scrape_and_submit_articles', async (req, res) => {
    try {
        await scrapeAndSubmitArticles();
        res.status(200).json({ message: 'Articles scraped and submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;