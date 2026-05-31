const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation error', data: errors.array() });
  }
  next();
};

const usernameValidation = [
  param('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isAlphanumeric('en-US', { ignore: '-' }).withMessage('Username can only contain alphanumeric characters and hyphens'),
  validate
];

// Routes
router.post('/analyze/:username', usernameValidation, profileController.analyzeProfile);

router.get('/profiles', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate
], profileController.getProfiles);

router.get('/profiles/:username', usernameValidation, profileController.getProfile);

router.delete('/profiles/:username', usernameValidation, profileController.deleteProfile);

router.get('/profiles/:username/repos', [
  ...usernameValidation,
  query('language').optional().trim().escape()
], profileController.getProfileRepos);

router.get('/stats', profileController.getStats);

router.get('/compare', [
  query('users').notEmpty().withMessage('Users query parameter is required'),
  validate
], profileController.compareProfiles);

module.exports = router;
