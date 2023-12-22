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
                as: 'Perspective', // replace 'perspective' with the alias you used when defining the association
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

// POST route to upvote a comment
router.post('/upvote/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findOne({ where: { id: req.params.commentId } });
        if (comment) {
            comment.upvotes += 1;
            await comment.save();
            res.json({ success: true, upvotes: comment.upvotes });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error upvoting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST route to downvote a comment
router.post('/downvote/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findOne({ where: { id: req.params.commentId } });
        if (comment) {
            comment.downvotes += 1;
            await comment.save();
            res.json({ success: true, downvotes: comment.downvotes });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error downvoting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
