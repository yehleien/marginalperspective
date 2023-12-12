const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const { sequelize, Sequelize, db } = require('./models/index');
const DataTypes = Sequelize.DataTypes;
const bcrypt = require('bcrypt');
const axios = require('axios'); // Added axios for web scraping
const cheerio = require('cheerio'); // Added cheerio for web scraping

// Model definitions
const { User, Article, Comment, Perspective } = require('./models/index');

// Debugging
console.log("Models defined: User, Article, Comment, Perspective");

// Route modules using dependency injection
const commentRoutes = require('./routes/comments');
const articleRoutes = require('./routes/articles');
const perspectiveRoutes = require('./routes/perspectives');

console.log("Routes defined: commentRoutes, articleRoutes, perspectiveRoutes");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('perspective-platform'));
app.use(session({
    secret: '69', // replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if you're using https
}));

console.log("Express app setup complete");

app.use('/comments', commentRoutes);
app.use('/articles', articleRoutes);
app.use('/perspectives', perspectiveRoutes);

// Added new route for fetching article content
app.get('/articles/content/:url', async (req, res) => {
    try {
        const url = decodeURIComponent(req.params.url);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let content = $('body').text();

        // Remove the junk at the beginning of the article
        const articleStart = content.indexOf('See More Videos');
        if (articleStart !== -1) {
            content = content.substring(articleStart + 'See More Videos'.length);
        }

        res.json({ content });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/account/login', (req, res) => {
    const { username, password } = req.body;

    User.findOne({ where: { username } })
        .then(user => {
            if (!user) {
                res.json({ success: false, error: 'User not found' });
            } else {
                // Check if the entered password matches the stored password
                bcrypt.compare(password, user.password, function(err, result) {
                    if (result == true) {
                        req.session.userId = user.id;
                        res.json({ success: true });
                    } else {
                        res.json({ success: false, error: 'Incorrect password' });
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            res.json({ success: false, error: 'Server error' });
        });
});

app.post('/account/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password before saving it to the database
    bcrypt.hash(password, 10, function(err, hashedPassword) {
        if (err) {
            console.error('Error during password hashing:', err);
            res.json({ success: false, error: 'Server error' });
        } else {
            User.create({ username, email, password: hashedPassword })
                .then(user => {
                    req.session.userId = user.id;
                    res.json({ success: true });
                })
                .catch(error => {
                    console.error('Error during signup:', error);
                    res.json({ success: false, error: 'Server error' });
                });
        }
    });
});

app.get('/account/current', (req, res) => {
    const userId = req.session.userId;
    User.findOne({ where: { id: userId } })
        .then(user => {
            res.json({ username: user.username, email: user.email, id: user.id });
        })
        .catch(error => {
            console.error('Error:', error);
            res.json({ success: false, error: 'Server error' });
        });
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        return sequelize.sync();
    })
    .then(() => console.log('Database synchronized'))
    .catch(err => console.error('Unable to connect to the database:', err));

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'perspective-platform', 'index.html')));
app.get('/home', (_req, res) => res.sendFile(path.join(__dirname, 'perspective-platform', 'home.html')));
app.get('/account', (_req, res) => res.sendFile(path.join(__dirname, 'perspective-platform', 'account.html')));

app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
