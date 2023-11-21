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
        age: {
            type: String,
            default: "default value for age"
        },
        sex: {
            type: String,
            default: "default value for sex"
        },
        nationality: {
            type: String,
            default: "default value for nationality"
        }
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















// Route to add a new perspective
app.post('/add_perspective', async (req, res) => {
    try {
        // Log request for debugging
        console.log('Request body:', req.body);
        console.log('Cookies:', req.cookies);

        // Extract email from cookies or request body
        const email = req.cookies.user_email || req.body.email;
        console.log('Extracted email:', email);

        if (!email) {
            return res.status(400).json({ error: 'Email not provided' });
        }

        const { perspectiveKey, perspectiveValue } = req.body;

        // Log perspective data for debugging
        console.log('Perspective Key:', perspectiveKey);
        console.log('Perspective Value:', perspectiveValue);

        // Find the user by email
        const user = await User.findOne({ email: email });
        console.log('User found:', user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add or update the perspective in the user's perspectives object
        user.perspectives = user.perspectives || {}; // Initialize if it doesn't exist
        user.perspectives[perspectiveKey] = perspectiveValue;

        // Save the updated user
        await user.save();
        console.log('User updated:', user);

        // Return the updated user with perspectives
        res.status(200).json({ user: user });
    } catch (error) {
        console.error('Error in /add_perspective:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
















app.delete('/delete_perspective/:rowNum', async (req, res) => {
try {
  const { rowNum } = req.params;
  const email = req.cookies['user_email'];

  if (!email) {
    return res.status(400).json({ error: 'Invalid request. User not authenticated.' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: 'Invalid request. User not found.' });
  }

  // Ensure user.perspectives is an array before attempting to access it
  user.perspectives = user.perspectives || [];

  if (user.perspectives.length > 0) {
    user.perspectives.splice(rowNum - 1, 1);
    await user.save();
  }

  res.status(200).json({ perspectives: user.perspectives });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});

// Route to fetch perspectives
app.get('/fetch_perspectives', async (req, res) => {
try {
    const email = req.cookies['user_email'];

    if (!email) {
        return res.status(400).json({ error: 'Invalid request. User not authenticated.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ error: 'Invalid request. User not found.' });
    }

    res.status(200).json({ perspectives: user.perspectives });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});

// ... (other routes remain the same)


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

// Endpoint to get perspectives for a user
app.get('/api/get_perspectives', async (req, res) => {
    try {
        const email = req.cookies.user_email || req.query.email;
        if (!email) {
            return res.status(400).json({ error: 'Email not provided' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user.perspectives);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/update_perspective', async (req, res) => {
    try {
        const email = req.cookies.user_email || req.body.email; // Assuming you get the user's email this way
        const { key, value } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.perspectives = user.perspectives || {};
        user.perspectives[key] = value;

        await user.save();

        res.status(200).json({ message: 'Perspective updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/api/add_perspective', async (req, res) => {
    try {
        // Extract the necessary information from the request body
        const { email, age, nationality, sex } = req.body;

        // Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize the perspectives object if it doesn't exist
        user.perspectives = user.perspectives || {};

        // Update the user's perspectives
        user.perspectives.age = age;
        user.perspectives.nationality = nationality;
        user.perspectives.sex = sex;

        // Save the updated user
        await user.save();

        // Respond with the updated user information
        res.status(200).json({ user: user });
    } catch (error) {
        // Log and respond with an error message
        console.error('Error in /api/add_perspective:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

  app.post('/add_comment', async (req, res) => {
    try {
        const { text } = req.body; // Assuming the comment text is sent in the 'text' field

        if (!text) {
            return res.status(400).json({ error: 'No comment text provided' });
        }

        const newComment = new Comment({ text });
        await newComment.save(); // Save the comment to the database

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  