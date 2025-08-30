// Netlify serverless function to proxy LLM API calls
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { provider, apiKey, model, prompt, temperature, maxTokens } = JSON.parse(event.body);

    let response;
    let targetUrl;

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
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unsupported provider' })
        };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `API request failed: ${response.statusText}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transformedResponse)
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
