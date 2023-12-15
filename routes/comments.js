const express = require('express');
const router = express.Router();
const { Comment, User, Perspective, Article } = require('../models');

// GET route to fetch comments for an article
router.get('/comments/:articleId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { articleId: req.params.articleId },
            include: {
                model: Perspective,
                attributes: ['perspectiveName']
            }
        });

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST route to create a new comment
router.post('/submit_comment', async (req, res) => {
    const { articleId, commentText, userId, perspectiveId } = req.body;

    try {
        // Validate input data
        if (!articleId || !commentText || !userId) {
            return res.status(400).send('Missing required fields');
        }

        const newComment = await Comment.create({
            text: commentText,
            articleId: articleId,
            userId: userId,
            perspectiveId: perspectiveId || null // If perspectiveId is not provided, set it to null
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
