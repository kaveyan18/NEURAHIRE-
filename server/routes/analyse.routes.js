const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const { analyzeResumeController } = require('../controllers/analyse.controller');

// POST /api/analyse
router.post('/', verifyToken, uploadMiddleware.single('resume'), analyzeResumeController);

module.exports = router;
