const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies (e.g. { "airport": "SFO" })
app.use(express.json());

// Allow Flutter app to call this API during development
app.use(cors());

// All API endpoints live under /api
app.use('/api', apiRoutes);

// 404 + global error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
