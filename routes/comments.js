const express = require('express');
const router = express.Router();
const { Comment, User, Perspective, Article, Vote } = require('../models');

router.get('/comments/:articleId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { articleId: req.params.articleId },
            attributes: ['id', 'text', 'userId', 'articleId', 'perspectiveId', 'upvotes', 'downvotes', 'parentID', 'replyCount', 'createdAt', 'updatedAt'], // Include 'replyCount' here
            include: [
                {
                    model: Perspective,
                    as: 'Perspective', 
                    attributes: ['perspectiveName']
                },
                {
                    model: Vote,
                    as: 'votes',
                    attributes: ['userId', 'is_upvote']
                }
            ]
        });

        // Fetch the current user's votes
        const userVotes = await Vote.findAll({
            where: { userId: req.session.userId } // replace with how you get the user's ID
        });

        comments.forEach(comment => {
            comment.upvotes = comment.votes.filter(vote => vote.is_upvote).length;
            comment.downvotes = comment.votes.filter(vote => !vote.is_upvote).length;

            // Add information about the current user's vote
            const userVote = userVotes.find(vote => vote.commentId === comment.id);
            if (userVote) {
                comment.userVote = userVote.is_upvote ? 'upvote' : 'downvote';
            } else {
                comment.userVote = null;
            }

            // Remove the votes array to not send all votes to the client
            delete comment.votes;
        });

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/comment/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findOne({
            where: { id: req.params.commentId },
            include: [
                {
                    model: Perspective,
                    as: 'Perspective', 
                    attributes: ['perspectiveName']
                },
                {
                    model: Vote,
                    as: 'votes',
                    attributes: ['userId', 'is_upvote']
                }
            ]
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.upvotes = comment.votes.filter(vote => vote.is_upvote).length;
        comment.downvotes = comment.votes.filter(vote => !vote.is_upvote).length;

        res.json(comment);
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST route to create a new comment
router.post('/submit_comment', async (req, res) => {
    const { articleId, commentText, userId, perspectiveId, parentID } = req.body;

    try {
        // Validate input data
        if (!articleId || !commentText || !userId) {
            return res.status(400).send('Missing required fields');
        }

        // Create the comment with parentID (if provided)
        const newComment = await Comment.create({
            text: commentText,
            articleId: articleId,
            userId: userId,
            perspectiveId: perspectiveId || null, // If perspectiveId is not provided, set it to null
            parentID: parentID || null // Handle parentID, setting it to null if not provided
        });

        newComment.upvotes = 0;
        newComment.downvotes = 0;

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to upvote a comment
router.post('/upvote/:commentId', async (req, res) => {
    try {
        const userId = req.session.userId; // replace with how you get the user's ID
        const { commentId } = req.params;

        const comment = await Comment.findByPk(commentId);
        const existingVote = await Vote.findOne({ where: { userId, commentId } });

        if (existingVote) {
            if (existingVote.is_upvote) {
                // User has already upvoted this comment, so we remove their upvote
                await existingVote.destroy();
                await comment.decrement('upvotes');
            } else {
                // User has downvoted this comment, so we'll change their vote to an upvote
                existingVote.is_upvote = true;
                await existingVote.save();
                await comment.decrement('downvotes');
                await comment.increment('upvotes');
            }
        } else {
            // User has not voted on this comment, so we'll create a new upvote
            await Vote.create({ userId, commentId, is_upvote: true });
            await comment.increment('upvotes');
        }

        // Reload the comment instance from the database to get the updated vote count
        await comment.reload();
        res.json({ success: true, upvotes: comment.upvotes, downvotes: comment.downvotes });
    } catch (error) {
        console.error('Error upvoting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST route to downvote a comment
router.post('/downvote/:commentId', async (req, res) => {
    try {
        const userId = req.session.userId; // replace with how you get the user's ID
        const { commentId } = req.params;

        const comment = await Comment.findByPk(commentId);
        const existingVote = await Vote.findOne({ where: { userId, commentId } });

        if (existingVote) {
            if (!existingVote.is_upvote) {
                // User has already downvoted this comment, so we remove their downvote
                await existingVote.destroy();
                await comment.decrement('downvotes');
            } else {
                // User has upvoted this comment, so we'll change their vote to a downvote
                existingVote.is_upvote = false;
                await existingVote.save();
                await comment.decrement('upvotes');
                await comment.increment('downvotes');
            }
        } else {
            // User has not voted on this comment, so we'll create a new downvote
            await Vote.create({ userId, commentId, is_upvote: false });
            await comment.increment('downvotes');
        }

        // Reload the comment instance from the database to get the updated vote count
        await comment.reload();
        res.json({ success: true, upvotes: comment.upvotes, downvotes: comment.downvotes });
    } catch (error) {
        console.error('Error downvoting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/replies/:id', async (req, res) => {
    const parentID = req.params.id;

    // Fetch the replies from the database
    const replies = await Comment.findAll({
        where: { parentID },
        order: [['createdAt', 'DESC']] // Order the replies by creation date
    });

    res.json(replies);
});

module.exports = router;