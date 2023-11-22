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

// User model
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

// Routes

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// MongoDB setup
mongoose.connect('mongodb+srv://nyehle973:cKuMloMhNBnyTHbH@cluster0.f5kabhi.mongodb.net/liminal', {
    dbName: 'liminal',
});

const commentSchema = new mongoose.Schema({
    text: String,
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  });
  
  // Create a Comment model
  const Comment = mongoose.model('Comment', commentSchema);

  // Route to get all comments
app.get('/get_comments', async (req, res) => {
    try {
      // Fetch all comments from the database
      const comments = await Comment.find();
  
      res.status(200).json({ comments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/get_comments/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;

        // Find the article by its ID to ensure it exists
        const article = await Article.findById(articleId).exec();
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Fetch all comments for the specified article, including nested comments
        const comments = await Comment.find({ article: articleId })
            .populate('parent')
            .exec();

        res.status(200).json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/add_comment', async (req, res) => {
    try {
        const { text, articleId, parentCommentId } = req.body; // Assuming the comment text, articleId, and parentCommentId are sent in the request body

        if (!text || !articleId) {
            return res.status(400).json({ error: 'Invalid request. Comment text and article ID are required.' });
        }

        // Find the article by its ID to ensure it exists
        const article = await Article.findById(articleId).exec();
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Create a new comment with the provided data
        const newComment = new Comment({
            text,
            article: articleId,
            parent: parentCommentId || null, // Set the parent comment if provided
        });

        await newComment.save(); // Save the comment to the database

        // Add the comment's ID to the article's comments array
        article.comments.push(newComment._id);
        await article.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const articleSchema = new mongoose.Schema({
    link: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

const Article = mongoose.model('Article', articleSchema);

// Route to submit an article link
app.post('/submit_link', async (req, res) => {
    try {
        const { link } = req.body;

        // Create a new article
        const article = new Article({ link });

        // Save the article to the database
        await article.save();

        res.status(201).json({ message: 'Article link submitted successfully', article });
    } catch (error) {
        console.error('Error submitting article link:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to fetch article links
app.get('/get_links', async (req, res) => {
    try {
        // Fetch all article links from the database
        const articles = await Article.find().exec();

        res.status(200).json({ articles });
    } catch (error) {
        console.error('Error fetching article links:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to submit a comment for an article
app.post('/submit_comment/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;
        const { text, upvotes, downvotes } = req.body;

        // Find the article by its ID
        const article = await Article.findById(articleId).exec();

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Create a new comment
        const comment = new Comment({ text, upvotes, downvotes });

        // Add the comment to the article's comments array
        article.comments.push(comment);

        // Save the article with the new comment
        await article.save();

        res.status(201).json({ message: 'Comment submitted successfully', comment });
    } catch (error) {
        console.error('Error submitting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to fetch comments for an article
app.get('/get_comments/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;

        // Find the article by its ID and populate the comments
        const article = await Article.findById(articleId)
            .populate('comments')
            .exec();

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.status(200).json({ comments: article.comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to fetch articles with pagination
app.get('/get_articles', async (req, res) => {
    try {
        const { page, size } = req.query;

        const skip = (page - 1) * size;
        const articles = await Article.find()
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skip)
            .limit(parseInt(size))
            .populate('comments')
            .exec();

        const totalCount = await Article.countDocuments();

        res.status(200).json({ articles, totalCount });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/get_article/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;

        // Find the article by its ID and populate the comments
        const article = await Article.findById(articleId)
            .populate('comments')
            .exec();

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.status(200).json({ article });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});