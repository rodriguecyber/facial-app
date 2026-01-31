import express from 'express';
import request from 'supertest';

// Create a minimal app for testing endpoints without actual face-api models
function createTestApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  let modelsLoaded = false;

  // Simulate model loading
  const loadModels = async () => {
    modelsLoaded = true;
  };

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: modelsLoaded ? 'ready' : 'loading',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  });

  // Compare endpoint mock
  app.post('/compare', async (req, res) => {
    try {
      if (!modelsLoaded) {
        return res.status(503).json({
          success: false,
          error: 'Models still loading',
          message: 'Models still loading'
        });
      }

      const { imageUrl, base64Image } = req.body;

      if (!imageUrl || !base64Image) {
        return res.status(400).json({
          success: false,
          error: 'Missing imageUrl or base64Image',
          message: 'Missing imageUrl or base64Image'
        });
      }

      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid image URL format',
          message: 'Invalid URL format'
        });
      }

      // Mock response
      res.json({
        success: true,
        match: false,
        distance: 0.6234,
        similarity: 37.77, 
        threshold: 0.5,
        confidence: 'low',
        processingTimeMs: 1234
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: error.message
      });
    }
  });

  // Detect endpoint mock
  app.post('/detect', async (req, res) => {
    try {
      if (!modelsLoaded) {
        return res.status(503).json({
          success: false,
          error: 'Models still loading'
        });
      }

      const { base64Image } = req.body;

      if (!base64Image) {
        return res.status(400).json({
          success: false,
          error: 'Missing base64Image image',
          message: 'Missing base64Image image'
        });
      }

      res.json({
        faceFound: true,
        processingTimeMs: 456
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: error.message
      });
    }
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      message: 'url not found',
      error: 'Not Found',
      path: req.url
    });
  });

  // Set models loaded for tests
  loadModels();

  return app;
}

describe('Express API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    test('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/health');
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('should return positive uptime', async () => {
      const response = await request(app).get('/health');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /compare', () => {
    test('should return 400 when imageUrl is missing', async () => {
      const response = await request(app)
        .post('/compare')
        .send({ base64Image: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing');
    });

    test('should return 400 when base64Image is missing', async () => {
      const response = await request(app)
        .post('/compare')
        .send({ imageUrl: 'https://example.com/image.jpg' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid URL format', async () => {
      const response = await request(app)
        .post('/compare')
        .send({
          imageUrl: 'ftp://example.com/image.jpg',
          base64Image: 'test'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid');
    });

    test('should accept valid https URL', async () => {
      const response = await request(app)
        .post('/compare')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          base64Image: 'dGVzdA=='
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should accept valid http URL', async () => {
      const response = await request(app)
        .post('/compare')
        .send({
          imageUrl: 'http://example.com/image.jpg',
          base64Image: 'dGVzdA=='
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return comparison results with all required fields', async () => {
      const response = await request(app)
        .post('/compare')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          base64Image: 'dGVzdA=='
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('match');
      expect(response.body).toHaveProperty('distance');
      expect(response.body).toHaveProperty('similarity');
      expect(response.body).toHaveProperty('threshold');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('processingTimeMs');
    });

    test('should return valid confidence levels', async () => {
      const response = await request(app)
        .post('/compare')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          base64Image: 'dGVzdA=='
        });

      const validConfidence = ['high', 'medium', 'low'];
      expect(validConfidence).toContain(response.body.confidence);
    });

    test('should return distance as number', async () => {
      const response = await request(app)
        .post('/compare')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          base64Image: 'dGVzdA=='
        });

      expect(typeof response.body.distance).toBe('number');
    });

    test('should return similarity between 0 and 100', async () => {
      const response = await request(app)
        .post('/compare')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          base64Image: 'dGVzdA=='
        });

      expect(response.body.similarity).toBeGreaterThanOrEqual(0);
      expect(response.body.similarity).toBeLessThanOrEqual(100);
    });
  });

  describe('POST /detect', () => {
    test('should return 400 when base64Image is missing', async () => {
      const response = await request(app).post('/detect').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing');
    });

    test('should return detection results with required fields', async () => {
      const response = await request(app)
        .post('/detect')
        .send({ base64Image: 'dGVzdA==' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('faceFound');
      expect(response.body).toHaveProperty('processingTimeMs');
    });

    test('should return boolean faceFound', async () => {
      const response = await request(app)
        .post('/detect')
        .send({ base64Image: 'dGVzdA==' });

      expect(typeof response.body.faceFound).toBe('boolean');
    });

    test('should return positive processingTimeMs', async () => {
      const response = await request(app)
        .post('/detect')
        .send({ base64Image: 'dGVzdA==' });

      expect(response.body.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('404 handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
      expect(response.body.path).toBe('/unknown');
    });

    test('should return proper error message for non-existent POST route', async () => {
      const response = await request(app)
        .post('/nonexistent')
        .send({ test: 'data' });

      expect(response.status).toBe(404);
    });
  });

  describe('Request/Response validation', () => {
    test('should handle JSON payloads', async () => {
      const response = await request(app)
        .post('/detect')
        .set('Content-Type', 'application/json')
        .send({ base64Image: 'dGVzdA==' });

      expect(response.status).toBe(200);
    });

    test('should validate empty payload', async () => {
      const response = await request(app)
        .post('/compare')
        .send({});

      expect(response.status).toBe(400);
    });

    test('should handle large base64 strings', async () => {
      const largeBase64 = 'a'.repeat(1000);
      const response = await request(app)
        .post('/detect')
        .send({ base64Image: largeBase64 });

      expect(response.status).toBe(200);
    });
  });
});
