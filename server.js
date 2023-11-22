//server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'perspective-platform')));

// MongoDB setup
mongoose.connect('mongodb+srv://nyehle973:cKuMloMhNBnyTHbH@cluster0.f5kabhi.mongodb.net/liminal', {
    dbName: 'liminal',
});

// Define your schemas and models
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    perspectives: {
        age: String,
        sex: String,
        nationality: String
    }
});
const User = mongoose.model('User', userSchema);

const articleSchema = new mongoose.Schema({
    link: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});
const Article = mongoose.model('Article', articleSchema);

const commentSchema = new mongoose.Schema({
    text: String,
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
});
const Comment = mongoose.model('Comment', commentSchema);

async function findUserVote(commentId, userId) {
    try {
        const comment = await Comment.findById(commentId);
        if (comment) {
            if (comment.upvotes.includes(userId)) {
                return 'upvote';
            } else if (comment.downvotes.includes(userId)) {
                return 'downvote';
            }
        }
        return null; // No vote found
    } catch (error) {
        console.error('Error in findUserVote:', error);
        throw error; // Rethrow the error to handle it in the calling function
    }
}

// Routes

// server.js

// ... [other code and routes]

// Example of a modified /toggle_vote endpoint
app.post('/toggle_vote', async (req, res) => {
    const { commentId, voteType, userId } = req.body;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Convert userId to ObjectId
        const userIdObj = new mongoose.Types.ObjectId(userId);

        if (voteType === 'upvote') {
            // Check if the user has already upvoted
            if (comment.upvotes.includes(userIdObj)) {
                // User is retracting their upvote
                comment.upvotes.pull(userIdObj);
            } else {
                // Add upvote and remove downvote if it exists
                comment.upvotes.addToSet(userIdObj);
                comment.downvotes.pull(userIdObj);
            }
        } else if (voteType === 'downvote') {
            // Check if the user has already downvoted
            if (comment.downvotes.includes(userIdObj)) {
                // User is retracting their downvote
                comment.downvotes.pull(userIdObj);
            } else {
                // Add downvote and remove upvote if it exists
                comment.downvotes.addToSet(userIdObj);
                comment.upvotes.pull(userIdObj);
            }
        }

        await comment.save();
        res.json({ success: true, comment });
    } catch (error) {
        console.error('Error in toggle_vote:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





app.post('/signup', async (req, res) => {
  try {
      console.log('Signup request received with body:', req.body);
      const { email, password } = req.body;

      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          console.log('Email already registered:', email);
          return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash the password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with the hashed password
      const user = new User({
          email,
          password: hashedPassword,
          perspectives: [],
      });

      // Save the new user
      await user.save();
      console.log('New user created:', user);

      // Respond with success
      res.status(200).json({ success: true });
  } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      console.log(`Login attempt for email: ${email}`);

      // Find the user by email
      const user = await User.findOne({ email });

      if (!user) {
          console.log(`No user found for email: ${email}`);
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
          // Set a cookie with the user's email (or another form of session management)
          res.cookie('user_email', email, { httpOnly: true });
          console.log(`User logged in: ${email}`);
          res.status(200).json({ success: true });
      } else {
          console.log(`Password mismatch for user: ${email}`);
          res.status(401).json({ error: 'Invalid credentials' });
      }
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get_user_perspectives', async (req, res) => {
    try {
        const email = req.cookies['user_email'];
        if (!email) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ perspectives: user.perspectives });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to update a user perspective
app.post('/update_perspective', async (req, res) => {
    try {
        const email = req.cookies['user_email'];
        const { perspectiveKey, perspectiveValue } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.perspectives[perspectiveKey] = perspectiveValue;
        await user.save();

        res.status(200).json({ message: 'Perspective updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'index.html'));
});

// Serve the HTML files for /home and /news
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'home.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'news.html'));
});

// Serve the account page
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'account.html'));
});

// Article submission and retrieval routes
app.post('/submit_link', async (req, res) => {
    // Your existing code for submitting a link
});

app.get('/get_links', async (req, res) => {
    // Your existing code for getting links
});

// Comment submission and retrieval routes
app.post('/add_comment', async (req, res) => {
    // Your existing code for adding a comment
});

app.get('/get_comments/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;

        const comments = await Comment.aggregate([
            { $match: { article: new mongoose.Types.ObjectId(articleId) } },
            { $addFields: { totalVotes: { $sum: [{ $size: "$upvotes" }, { $size: "$downvotes" }] } } },
            { $sort: { totalVotes: -1 } } // Sort by totalVotes in descending order
        ]);

        res.status(200).json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Pagination route for news
app.get('/get_news', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    try {
        const articles = await Article.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const count = await Article.countDocuments();

        res.json({
            articles,
            totalArticles: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve static pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'home.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'news.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'perspective-platform', 'account.html'));
});

app.post('/post_comment', async (req, res) => {
    const { articleId, commentText } = req.body;

    if (!articleId || !commentText) {
        return res.status(400).json({ error: 'Article ID and comment text are required.' });
    }

    try {
        // Find the article by its ID
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Create a new comment
        const newComment = new Comment({
            text: commentText,
            article: articleId
            // You can add more fields here if needed, like user info, timestamps, etc.
        });

        // Save the new comment
        await newComment.save();

        // Add the comment's ID to the article's comments array
        article.comments.push(newComment._id);
        await article.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});