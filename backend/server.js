require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const patientRoutes = require('./routes/patientRoutes');
const automationRoutes = require('./routes/automationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { getActivityLogs, getSettings } = require('./controllers/dashboardController');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'EPIA Patient Follow-Up Automation API',
    timestamp: new Date().toISOString()
  });
});

// Mount Feature Routers
app.use('/api/patients', patientRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/activity-logs', getActivityLogs);
app.get('/api/settings', getSettings);

// 404 and Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server if directly executed
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  EPIA Patient Follow-Up Automation Backend Running    `);
    console.log(`  Port: http://localhost:${PORT}                      `);
    console.log(`  Health Check: http://localhost:${PORT}/api/health    `);
    console.log(`  Dashboard Stats: http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`=======================================================`);
  });

  const handleShutdown = () => {
    console.log('\nShutting down EPIA API server gracefully...');
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

module.exports = app;

