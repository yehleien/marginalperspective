const express = require('express');
const router = express.Router();
const { Comment, User, Perspective } = require('../models');

// GET route to fetch comments for an article
router.get('/get_comments/:articleId', async (req, res) => {
    try {
        const articleId = req.params.articleId;
        if (!articleId) {
            return res.status(400).json({ message: 'Article ID is required' });
        }
        const comments = await Comment.findAll({
            where: { articleId: articleId },
            include: [
                { model: User, as: 'user' },
                { model: Perspective, as: 'perspective' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
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
