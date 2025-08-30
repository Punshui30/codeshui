const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow your Netlify domain
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://exquisite-rolypoly-d18630.netlify.app',
    'https://frolicking-ganache-d7b381.netlify.app', // Your current Netlify domain
    'https://*.netlify.app',
    'https://*.render.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'anthropic-version']
}));

// Add CORS preflight handling
app.options('*', cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// LLM Proxy endpoint
app.post('/api/llm-proxy', async (req, res) => {
  try {
    const { provider, apiKey, model, prompt, temperature, maxTokens } = req.body;

    // Validate required fields
    if (!provider || !apiKey || !model || !prompt) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['provider', 'apiKey', 'model', 'prompt']
      });
    }

    let response;
    let targetUrl;

    console.log(`Proxying request to ${provider} with model: ${model}`);

    switch (provider) {
      case 'anthropic':
        targetUrl = 'https://api.anthropic.com/v1/messages';
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens || 4000,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        break;

      case 'openai':
        targetUrl = 'https://api.openai.com/v1/chat/completions';
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are a helpful coding assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: temperature || 0.1,
            max_tokens: maxTokens || 4000
          })
        });
        break;

      case 'google':
        targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: temperature || 0.1,
              maxOutputTokens: maxTokens || 4000
            }
          })
        });
        break;

      default:
        return res.status(400).json({ 
          error: `Unsupported provider: ${provider}`,
          supported: ['anthropic', 'openai', 'google']
        });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} ${response.statusText}`, errorText);
      
      return res.status(response.status).json({ 
        error: `API request failed: ${response.statusText}`,
        details: errorText,
        provider,
        model
      });
    }

    const data = await response.json();
    console.log(`Successfully proxied response from ${provider}`);
    
    // Transform response to match our expected format
    let transformedResponse;
    switch (provider) {
      case 'anthropic':
        transformedResponse = {
          content: data.content[0].text,
          usage: data.usage
        };
        break;
      case 'openai':
        transformedResponse = {
          content: data.choices[0].message.content,
          usage: data.usage
        };
        break;
      case 'google':
        transformedResponse = {
          content: data.candidates[0].content.parts[0].text
        };
        break;
    }

    res.json(transformedResponse);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for connection testing
app.post('/api/test-connection', async (req, res) => {
  console.log('Test connection request received:', {
    provider: req.body.provider,
    model: req.body.model,
    hasApiKey: !!req.body.apiKey,
    origin: req.headers.origin,
    method: req.method
  });
  
  try {
    const { provider, apiKey, model } = req.body;

    if (!provider || !apiKey || !model) {
      return res.status(400).json({
        error: 'Missing required fields for connection test'
      });
    }

    let response;
    let targetUrl;

    switch (provider) {
      case 'anthropic':
        targetUrl = 'https://api.anthropic.com/v1/models';
        response = await fetch(targetUrl, {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
        });
        break;

      case 'openai':
        targetUrl = 'https://api.openai.com/v1/models';
        response = await fetch(targetUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        break;

      case 'google':
        targetUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        response = await fetch(targetUrl);
        break;

      default:
        return res.status(400).json({ 
          error: `Unsupported provider: ${provider}` 
        });
    }

    if (response.ok) {
      res.json({ 
        success: true, 
        message: `Successfully connected to ${provider}`,
        provider,
        model
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ 
        error: `Connection test failed: ${response.statusText}`,
        details: errorText,
        provider,
        model
      });
    }

  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({ 
      error: 'Connection test failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available: ['/health', '/api/llm-proxy', '/api/test-connection']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeShui Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 LLM Proxy: http://localhost:${PORT}/api/llm-proxy`);
});
