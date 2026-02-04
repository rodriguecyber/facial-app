import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON
app.use(express.json());

// Simple hello endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server only if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
