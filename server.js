const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const cookieParser = require('cookie-parser');
const { sequelize, Sequelize, db } = require('./models/index');
const DataTypes = Sequelize.DataTypes;
const bcrypt = require('bcrypt');
const axios = require('axios'); // Added axios for web scraping
const cheerio = require('cheerio'); // Added cheerio for web scraping

// Model definitions
const { User, Article, Comment, Perspective, Vote } = require('./models/index');

// Debugging
console.log("Models defined: User, Article, Comment, Perspective");

// Route modules using dependency injection
const commentRoutes = require('./routes/comments');
const articleRoutes = require('./routes/articles');
const perspectiveRoutes = require('./routes/perspectives');

console.log("Routes defined: commentRoutes, articleRoutes, perspectiveRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('perspective-platform'));
app.use(session({
    secret: '69', // replace with your own secret key
    store: new SequelizeStore({
        db: sequelize
    }),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // set to true if you're using https, 1 week max age
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
        const articleStart = content.indexOf('>');
        if (articleStart !== -1) {
            content = content.substring(articleStart + 'Topics'.length);
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

                    // After creating the user, create the default perspectives
                    const defaultPerspectives = [
                        { userId: user.id, perspectiveName: 'Default 1', /* other fields */ },
                        { userId: user.id, perspectiveName: 'Default 2', /* other fields */ },
                        // Add more default perspectives as needed
                    ];
                    Perspective.bulkCreate(defaultPerspectives)
                        .then(() => {
                            res.json({ success: true });
                        })
                        .catch(error => {
                            console.error('Error during perspective creation:', error);
                            res.json({ success: false, error: 'Server error' });
                        });
                })
                .catch(error => {
                    console.error('Error during signup:', error);
                    res.json({ success: false, error: 'Server error' });
                });
        }
    });
});

async function scrapeAndSubmitArticles() {
    try {
        const { data } = await axios.get('https://text.npr.org/');
        const $ = cheerio.load(data);
        const articles = [];

        $('li').each((index, element) => {
            const title = $(element).text();
            articles.push(title);
        });

        for (let article of articles) {
            try {
                await submitArticle(article);
            } catch (error) {
                console.error('Error submitting article:', error);
            }
        }
    } catch (error) {
        console.error('Error scraping articles:', error);
    }
}

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

async function retrieveVotesFromDatabase(userId) {
    try {
        const votes = await Vote.findAll({
            where: { userId: userId },
            attributes: ['comment_id', 'is_upvote'] // Select only the necessary fields
        });
        return votes.map(vote => ({
            commentId: vote.comment_id,
            isUpvote: vote.is_upvote
        }));
    } catch (error) {
        console.error('Error retrieving votes:', error);
        throw error; // Rethrow the error to handle it in the route
    }
}

app.get('/votes/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.session.userId, 10); // Ensure the userId is an integer
        if (isNaN(userId)) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }
        const votes = await retrieveVotesFromDatabase(userId);
        res.json(votes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while retrieving votes' });
    }
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
app.get('/signup', (_req, res) => res.sendFile(path.join(__dirname, 'perspective-platform', 'signup.html')));
app.get('/focus', (_req, res) => res.sendFile(path.join(__dirname, 'perspective-platform', 'focus.html')));


app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
