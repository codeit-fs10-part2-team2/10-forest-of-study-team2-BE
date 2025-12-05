const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const corsOptions = require('./config/cors');
const mime = require('mime-types');

require('./config/database');

mime.types['js'] = 'text/javascript';
mime.types['mjs'] = 'text/javascript';

try {
  const send = require('send');
  send.mime.define({
    'text/javascript': ['js', 'mjs'],
  });
} catch (e) {
  console.warn('send module not available for MIME type override');
}

const app = express();

app.use((req, res, next) => {
  const originalSend = res.send;
  const originalSendFile = res.sendFile;
  const originalSetHeader = res.setHeader;
  
  res.setHeader = function(name, value) {
    if (name.toLowerCase() === 'content-type') {
      if (req.url.match(/\.(js|mjs)$/i) && value === 'application/octet-stream') {
        value = 'text/javascript; charset=utf-8';
      }
    }
    return originalSetHeader.call(this, name, value);
  };
  
  res.send = function(body) {
    if (req.url.match(/\.(js|mjs)$/i)) {
      this.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    }
    return originalSend.call(this, body);
  };
  
  res.sendFile = function(path, options, callback) {
    if (typeof path === 'string' && path.match(/\.(js|mjs)$/i)) {
      if (!options) options = {};
      options.headers = options.headers || {};
      options.headers['Content-Type'] = 'text/javascript; charset=utf-8';
    }
    return originalSendFile.call(this, path, options, callback);
  };
  
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const studyRouter = require('./routes/studyRouter');
const pointRouter = require('./routes/pointRouter');
const habitRouter = require('./routes/habitRouter');
const emojiRouter = require('./routes/emojiRouter');

app.use('/api/studies', studyRouter);
app.use('/api/points', pointRouter);
app.use('/api/habits', habitRouter);
app.use('/api/emojis', emojiRouter);

app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS 정책에 의해 요청이 차단되었습니다.',
      error: err.message,
    });
  }
  
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 3000;

const prisma = require('./lib/prisma');

const startKeepAlive = () => {
  const http = require('http');
  const https = require('https');
  const keepAliveInterval = 14 * 60 * 1000;
  
  const keepAlive = () => {
    const apiUrl = process.env.API_URL;
    
    if (apiUrl) {
      const healthUrl = `${apiUrl}/health`;
      const isHttps = healthUrl.startsWith('https://');
      const client = isHttps ? https : http;
      
      client.get(healthUrl, (res) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Keep-alive ping: ${healthUrl} - Status: ${res.statusCode}`);
        }
      }).on('error', () => {});
    } else {
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/health',
        method: 'GET',
      };
      
      const req = http.request(options, (res) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Keep-alive ping: localhost:${PORT}/health - Status: ${res.statusCode}`);
        }
      });
      
      req.on('error', () => {});
      req.end();
    }
  };

  setTimeout(keepAlive, 60000);
  setInterval(keepAlive, keepAliveInterval);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Keep-alive started: pinging every ${keepAliveInterval / 1000 / 60} minutes`);
  }
};

const startServer = async () => {
  try {
    await prisma.$connect();
    try {
      await prisma.$executeRawUnsafe('SET time_zone = "+09:00"');
      if (process.env.NODE_ENV === 'development') {
        console.log('Database timezone set to Asia/Seoul (+09:00)');
      }
    } catch (tzError) {
      console.warn('Timezone setting warning:', tzError.message);
    }
  } catch (error) {
    console.error('Database connection warning:', error.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startKeepAlive();
  });

  return server;
};

startServer();

module.exports = app;
