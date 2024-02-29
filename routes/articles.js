const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { Article, Perspective } = require('../models');
const router = express.Router();

router.get('/get_latest', async (req, res) => {
    try {
        const index = parseInt(req.query.index) || 0;
        const article = await Article.findAll({
            attributes: ['id', 'url', 'title', 'submitDate', 'scope', 'content', 'perspectiveId'], // Specify fields to return
            order: [['submitDate', 'DESC']],
            offset: index,
            limit: 27,
            include: [{ model: Perspective }] // Include Perspective details if needed
        });
        res.json(article[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/submit_article', async (req, res) => {
    try {
        const { url, scope, content, perspectiveId, title: providedTitle } = req.body;
        const submitDate = new Date();

        // Validate perspectiveID
        if (perspectiveId) {
            const perspectiveExists = await Perspective.findByPk(perspectiveId);
            if (!perspectiveExists) {
                return res.status(400).json({ message: 'Invalid perspectiveID' });
            }
        }

        let title = providedTitle;
        if (url) {
            // Fetch the title if URL is provided and no title is provided
            if (!title) {
                const { data } = await axios.get(url);
                const $ = cheerio.load(data);
                title = $('title').text();
            }
        } else if (!title) {
            // If no URL and no title provided, return an error
            return res.status(400).json({ message: 'A title is required if no URL is provided' });
        }

        // Additional validations for other fields can be added here

        const newArticle = await Article.create({ url, title, submitDate, scope, content, perspectiveId });
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