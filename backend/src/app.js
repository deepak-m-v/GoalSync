const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Serialize BigInt in JSON responses (notifications, audit logs)
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();

if (config.env === 'production') {
  app.set('trust proxy', 1);
}

app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
