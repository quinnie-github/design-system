# Claude Vision API Proxy Server

This proxy server allows the Figma plugin to call the Claude Vision API without exposing API keys in the browser or dealing with CORS issues.

## Why a Proxy Server?

- **CORS**: Anthropic's API doesn't allow direct browser calls (CORS blocked)
- **Security**: API keys should never be exposed in browser code
- **Architecture**: Browser → Proxy Server → Claude API → Proxy → Browser

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET http://localhost:3001/health
```

Returns server status.

### Analyze Image
```
POST http://localhost:3001/api/analyze
```

**Request Body:**
```json
{
  "apiKey": "sk-ant-...",
  "imageData": "base64_encoded_image_data",
  "imageUrl": "https://example.com/image.png",
  "prompt": "Analyze this design..."
}
```

**Note**: Provide either `imageData` OR `imageUrl`, not both.

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "AI analysis response..."
    }
  ]
}
```

## How It Works

1. Figma plugin UI sends request to proxy server at `http://localhost:3001/api/analyze`
2. Proxy server forwards request to Anthropic API with proper headers
3. Anthropic API responds with analysis
4. Proxy server returns response to Figma plugin
5. Plugin displays visual features based on AI response

## Deployment

For production use, deploy this server to:
- Vercel
- Netlify Functions
- AWS Lambda
- Heroku
- Railway

Update the `PROXY_URL` in `ui.html` to point to your deployed server.

## Security Notes

- API keys are sent from the client and not stored on the server
- For production, consider storing API keys server-side and authenticating users
- Add rate limiting for production use
- Use environment variables for configuration
