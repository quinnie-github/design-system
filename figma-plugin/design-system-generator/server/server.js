const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3002;

// Enable CORS for Figma plugin
app.use(cors({
  origin: '*', // Allow all origins (Figma uses various origins)
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' })); // Support large base64 images

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Claude Vision API Proxy Server running' });
});

// Proxy endpoint for Claude Vision API
app.post('/api/analyze', async (req, res) => {
  try {
    const { apiKey, imageData, imageUrl, prompt } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!imageData && !imageUrl) {
      return res.status(400).json({ error: 'Either imageData or imageUrl is required' });
    }

    console.log('🤖 Proxying request to Claude Vision API...');
    console.log('   - Image source:', imageUrl ? 'URL' : 'base64');
    console.log('   - Prompt length:', prompt ? prompt.length : 0);

    // Prepare image content
    let imageContent;
    if (imageUrl) {
      imageContent = {
        type: 'image',
        source: {
          type: 'url',
          url: imageUrl
        }
      };
    } else {
      imageContent = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: imageData
        }
      };
    }

    // Prepare request payload
    const payload = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          imageContent,
          {
            type: 'text',
            text: prompt || 'Analyze this design screenshot for design system generation.'
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
      }
    };

    const anthropicReq = https.request(options, (anthropicRes) => {
      let data = '';

      anthropicRes.on('data', (chunk) => {
        data += chunk;
      });

      anthropicRes.on('end', () => {
        console.log('✅ Received response from Claude Vision API');

        if (anthropicRes.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            res.json(response);
          } catch (e) {
            console.error('❌ Failed to parse API response:', e);
            res.status(500).json({ error: 'Failed to parse API response' });
          }
        } else {
          console.error('❌ API request failed:', anthropicRes.statusCode, data);
          res.status(anthropicRes.statusCode).json({
            error: 'Anthropic API request failed',
            details: data
          });
        }
      });
    });

    anthropicReq.on('error', (error) => {
      console.error('❌ Request error:', error);
      res.status(500).json({ error: 'Failed to connect to Anthropic API', details: error.message });
    });

    anthropicReq.write(payload);
    anthropicReq.end();

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Claude Vision API Proxy Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Analyze endpoint: POST http://localhost:${PORT}/api/analyze`);
  console.log('');
  console.log('📝 Ready to proxy requests from Figma plugin to Claude Vision API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
