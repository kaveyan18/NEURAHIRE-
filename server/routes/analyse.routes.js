const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload');
const { analyzeResumeController } = require('../controllers/analyse.controller');

// POST /api/analyse
router.post('/', uploadMiddleware.single('resume'), analyzeResumeController);

module.exports = router;
