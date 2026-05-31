require('dotenv').config({ override: true });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const gatewayRoutes = require('./routes/gatewayRoutes');
const { initDatabase } = require('./config/db');
const { connectRedis } = require('./config/redisClient');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sanitizeRequest } = require('./middleware/validateRequest');

const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

app.use(express.json({ limit: process.env.MAX_PAYLOAD_SIZE || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_PAYLOAD_SIZE || '1mb' }));

app.use(sanitizeRequest);
app.use('/auth', authRoutes);
app.use('/', gatewayRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  await initDatabase();
  connectRedis().catch((error) => {
    // eslint-disable-next-line no-console
    console.warn('Redis unavailable at startup:', error.message);
  });

  if (require.main === module) {
    app.listen(port, host, () => {
      // eslint-disable-next-line no-console
      console.log(`API Gateway + Auth Service running on ${host}:${port}`);
    });
  }

  return app;
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});

module.exports = app;
