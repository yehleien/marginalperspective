const express = require('express');
const router = express.Router();
const { Perspective } = require('../models');

router.get('/get_perspectives/:userId', (req, res) => {
    const userId = req.params.userId;
    Perspective.findAll({ where: { userId }, 
    attributes: ['perspectiveId', 'userId', 'perspectiveName', 'type', 'options', 'createdAt', 'updatedAt']
    })
        .then(perspectives => {
            res.json(perspectives);
        })
        .catch(error => {
            console.error('Error:', error);
            res.json({ success: false, error: 'Server error' });
        });
});

router.post('/add_perspective', (req, res) => {
    const { perspectiveName, userId } = req.body;

    Perspective.create({ perspectiveName, userId })
        .then(perspective => {
            res.json({ success: true, perspective });
        })
        .catch(error => {
            console.error('Error during perspective creation:', error);
            res.json({ success: false, error: 'Server error' });
        });
});

router.put('/update_perspective/:perspectiveId', (req, res) => {
    const { perspectiveName, perspectiveType } = req.body;
    const perspectiveId = req.params.perspectiveId;

    Perspective.update({ perspectiveName, type: perspectiveType }, { where: { perspectiveId } })
        .then(() => {
            res.json({ success: true });
        })
        .catch(error => {
            console.error('Error during perspective update:', error);
            res.json({ success: false, error: 'Server error' });
        });
});

router.delete('/delete_perspective/:id', (req, res) => {
    const id = req.params.id;

    Perspective.destroy({ where: { id } })
        .then(() => {
            res.json({ success: true });
        })
        .catch(error => {
            console.error('Error during perspective deletion:', error);
            res.json({ success: false, error: 'Server error' });
        });
});



  // Route to get all perspectives
router.get('/get_all_perspectives', (req, res) => {
    Perspective.findAll({
        attributes: ['perspectiveId', 'perspectiveName', 'type', 'options'] // Adjust attributes as needed
    })
    .then(perspectives => {
        res.json(perspectives);
    })
    .catch(error => {
        console.error('Error fetching perspectives:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    });
});


module.exports = router;