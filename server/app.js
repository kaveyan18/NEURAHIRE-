const express = require('express');
const cors = require('cors');
const analyseRoutes = require('./routes/analyse.routes');

const app = express();

// Enable CORS for all origins
app.use(cors());

// Built-in middleware for json
app.use(express.json());

// Main sub-router
app.use('/api/analyse', analyseRoutes);

module.exports = app;
