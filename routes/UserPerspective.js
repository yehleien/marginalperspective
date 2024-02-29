const express = require('express');
const router = express.Router();
const { Perspective, UserPerspective } = require('../models');


router.post('/add_user_perspective', (req, res) => {
    const { userId, perspectiveId } = req.body;
    UserPerspective.create({ userId, perspectiveId })
      .then(() => {
        res.json({ success: true });
      })
      .catch(error => {
        console.error('Error:', error);
        res.json({ success: false, error: 'Server error' });
      });
  });

  // Route to get user perspectives with perspective names
router.get('/get_user_perspectives/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const userPerspectives = await UserPerspective.findAll({
          where: { userId: userId },
          include: [{
              model: Perspective,
              as: 'Perspective',
              required: true,
              attributes: ['perspectiveName', 'updatedAt', 'type'] // Assuming these are the fields you want
          }]
      });

      // Transform the data structure if necessary to fit your frontend needs
      const transformedData = userPerspectives.map(up => ({
          perspectiveName: up.Perspective.perspectiveName,
          updatedAt: up.Perspective.updatedAt,
          type: up.Perspective.type,
          perspectiveId: up.perspectiveId // Assuming you have a perspectiveId field in UserPerspective
      }));

      res.json(transformedData);
  } catch (error) {
      console.error('Error fetching user perspectives:', error);
      res.status(500).send('Server error');
  }
});


module.exports = router;