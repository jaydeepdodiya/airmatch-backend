const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json());

const corsOptions =
  env.corsOrigins.length > 0
    ? { origin: env.corsOrigins, credentials: true }
    : {};
app.use(cors(corsOptions));

app.use('/api', apiLimiter, apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
