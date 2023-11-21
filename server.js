// server.js

const express = require('express');
const mongoose = require('mongoose');
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
    perspectives: [String],
});

const User = mongoose.model('User', userSchema);

// Routes

// Route to add a new perspective
app.post('/add_perspective', async (req, res) => {
    try {
        const { email, perspective } = req.body;
        const user = await User.findOneAndUpdate(
            { email },
            { $push: { perspectives: perspective } },
            { new: true }
        );
        res.status(200).json({ perspectives: user.perspectives });
    } catch (error) {
        console.error(error);
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


// Route for signup
app.post('/signup', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Add your logic to check if the email is already registered
      // If not, create a new user and save to the database
      // For simplicity, let's assume the email is unique for each user

      const user = new User({
          email,
          password,
          perspectives:[],
      });

      await user.save();

      res.status(200).json({ success: true });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and if the password matches (in plaintext)
    if (user && user.password === password) {
      // Assuming 'email' is the email of the logged-in user
      res.cookie('user_email', email, { httpOnly: true }); // 'httpOnly' ensures that the cookie is not accessible via client-side scripts
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
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
