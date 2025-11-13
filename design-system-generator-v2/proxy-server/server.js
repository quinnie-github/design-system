/**
 * Design System Generator v2.0 - Proxy Server
 *
 * This server acts as a proxy between the web app and Claude Vision API
 * to handle API key security and CORS issues.
 */

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all origins (web app can be opened locally)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON with large payload support (for base64 images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Design System Generator v2.0 Proxy Server',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    ready: true,
    endpoints: {
      health: '/health',
      analyze: '/api/analyze',
      status: '/api/status'
    },
    limits: {
      maxImageSize: '50mb',
      timeout: '60s'
    }
  });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const startTime = Date.now();

  try {
    const { apiKey, imageData, imageUrl, prompt } = req.body;

    // Validation
    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        message: 'Please provide your Claude API key in the request body'
      });
    }

    if (!imageData && !imageUrl) {
      return res.status(400).json({
        error: 'Image data required',
        message: 'Either imageData (base64) or imageUrl must be provided'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        message: 'Please provide an analysis prompt'
      });
    }

    console.log('📸 Processing analysis request:');
    console.log('   - Image source:', imageUrl ? 'URL' : 'base64');
    console.log('   - Prompt length:', prompt.length, 'characters');
    console.log('   - API Key:', apiKey.substring(0, 10) + '...');

    // Prepare image content for Claude API
    let imageContent;
    if (imageUrl) {
      // URL-based image
      imageContent = {
        type: 'image',
        source: {
          type: 'url',
          url: imageUrl
        }
      };
    } else {
      // Base64-encoded image
      // Determine media type from base64 data
      let mediaType = 'image/png'; // default
      if (imageData.startsWith('/9j/')) {
        mediaType = 'image/jpeg';
      } else if (imageData.startsWith('R0lGOD')) {
        mediaType = 'image/gif';
      } else if (imageData.startsWith('UklGR')) {
        mediaType = 'image/webp';
      }

      imageContent = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageData
        }
      };
    }

    // Prepare Claude API request payload
    const payload = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096, // Increased for detailed analysis
      temperature: 0.3, // Lower temperature for more consistent JSON output
      messages: [{
        role: 'user',
        content: [
          imageContent,
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    });

    // Make request to Anthropic API
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 60000 // 60 second timeout
    };

    console.log('🤖 Sending request to Claude Vision API...');

    const anthropicReq = https.request(options, (anthropicRes) => {
      let data = '';

      anthropicRes.on('data', (chunk) => {
        data += chunk;
      });

      anthropicRes.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`✅ Received response from Claude API (${duration}ms)`);

        if (anthropicRes.statusCode === 200) {
          try {
            const response = JSON.parse(data);

            // Add metadata
            response.metadata = {
              duration: duration,
              timestamp: new Date().toISOString(),
              model: 'claude-3-5-sonnet-20241022'
            };

            res.json(response);
          } catch (e) {
            console.error('❌ Failed to parse API response:', e);
            console.error('Raw response:', data.substring(0, 500));

            res.status(500).json({
              error: 'Failed to parse API response',
              message: 'The response from Claude API could not be parsed',
              details: e.message
            });
          }
        } else {
          console.error(`❌ API request failed: ${anthropicRes.statusCode}`);
          console.error('Error details:', data);

          let errorMessage = 'Anthropic API request failed';
          let errorDetails = data;

          try {
            const errorData = JSON.parse(data);
            errorMessage = errorData.error?.message || errorMessage;
            errorDetails = errorData;
          } catch (e) {
            // Keep raw error data
          }

          res.status(anthropicRes.statusCode).json({
            error: errorMessage,
            message: `API returned status ${anthropicRes.statusCode}`,
            details: errorDetails
          });
        }
      });
    });

    anthropicReq.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.error(`❌ Request error (${duration}ms):`, error);

      res.status(500).json({
        error: 'Failed to connect to Anthropic API',
        message: error.message,
        details: {
          code: error.code,
          hostname: 'api.anthropic.com'
        }
      });
    });

    anthropicReq.on('timeout', () => {
      console.error('❌ Request timeout (60s)');
      anthropicReq.destroy();

      res.status(504).json({
        error: 'Request timeout',
        message: 'The request to Claude API took too long (>60s)',
        details: 'Try with a smaller image or simpler prompt'
      });
    });

    anthropicReq.write(payload);
    anthropicReq.end();

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Server error (${duration}ms):`, error);

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      details: {
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: 'GET /health',
      status: 'GET /api/status',
      analyze: 'POST /api/analyze'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Design System Generator v2.0 - Proxy Server              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📡 Available Endpoints:');
  console.log(`   - Health Check:  GET  http://localhost:${PORT}/health`);
  console.log(`   - API Status:    GET  http://localhost:${PORT}/api/status`);
  console.log(`   - Analyze Image: POST http://localhost:${PORT}/api/analyze`);
  console.log('');
  console.log('🔒 Security:');
  console.log('   - CORS enabled for all origins');
  console.log('   - 50MB payload limit for images');
  console.log('   - 60s request timeout');
  console.log('');
  console.log('📝 Ready to proxy requests to Claude Vision API');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('');
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
