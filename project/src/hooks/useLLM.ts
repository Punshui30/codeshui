import { useState, useCallback } from 'react';

export type LLMProvider = 'ollama' | 'openai' | 'anthropic' | 'google' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  url?: string;
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

export interface ProviderConfig {
  name: string;
  description: string;
  models: string[];
  requiresApiKey: boolean;
  defaultUrl?: string;
}

export const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  ollama: {
    name: 'Ollama (Local)',
    description: 'Run models locally with Ollama',
    models: ['llama3.1:8b', 'codellama', 'llama2', 'mistral', 'deepseek-coder', 'neural-chat', 'wizard-coder'],
    requiresApiKey: false,
    defaultUrl: 'http://127.0.0.1:11434'
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 Turbo, and more',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    requiresApiKey: true,
    defaultUrl: 'https://api.openai.com/v1'
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude 3 and Claude 2',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1'],
    requiresApiKey: true,
    defaultUrl: 'https://api.anthropic.com'
  },
  google: {
    name: 'Google AI',
    description: 'Gemini Pro and other models',
    models: ['gemini-pro', 'gemini-pro-vision', 'text-bison'],
    requiresApiKey: true,
    defaultUrl: 'https://generativelanguage.googleapis.com'
  },
  custom: {
    name: 'Custom API',
    description: 'Connect to any compatible API',
    models: ['custom'],
    requiresApiKey: true
  }
};

export function useLLM() {
  // Load config from localStorage or use defaults
  const loadConfig = (): LLMConfig => {
    try {
      const saved = localStorage.getItem('codeshui-llm-config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load LLM config from localStorage:', error);
    }
    
    return {
      provider: 'ollama',
      url: 'http://127.0.0.1:11434',
      model: 'llama3.1:8b',
      temperature: 0.1,
      maxTokens: 4000
    };
  };

  const [config, setConfig] = useState<LLMConfig>(loadConfig);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to test connection with specific config
  const testConnectionWithConfig = useCallback(async (testConfig: LLMConfig): Promise<boolean> => {
    try {
      // Simple connection testing without proxy server
      
      switch (testConfig.provider) {
        case 'ollama':
          if (!testConfig.url) return false;
          // For deployed sites, just validate the URL format
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return testConfig.url.includes('127.0.0.1') || testConfig.url.includes('localhost');
          }
          // For localhost, actually test the connection
          try {
            const response = await fetch(`${testConfig.url}/api/tags`);
            return response.ok;
          } catch (e) {
            return false;
          }
        
        case 'openai':
        case 'anthropic':
        case 'google':
          if (!testConfig.apiKey) return false;
          
          // Use backend for connection testing on deployed sites
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
              const backendUrl = 'https://codeshui-backend.onrender.com';
              const response = await fetch(`${backendUrl}/api/test-connection`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  provider: testConfig.provider,
                  apiKey: testConfig.apiKey,
                  model: testConfig.model
                })
              });
              return response.ok;
            } catch (e) {
              return false;
            }
          }
          
          // For localhost, test directly
          try {
            if (testConfig.provider === 'anthropic') {
              const response = await fetch('https://api.anthropic.com/v1/models', {
                headers: {
                  'x-api-key': testConfig.apiKey,
                  'anthropic-version': '2023-06-01'
                }
              });
              return response.ok;
            } else if (testConfig.provider === 'openai') {
              const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                  'Authorization': `Bearer ${testConfig.apiKey}`
                }
              });
              return response.ok;
            } else if (testConfig.provider === 'google') {
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${testConfig.apiKey}`);
              return response.ok;
            }
            return false;
          } catch (e) {
            return false;
          }
        
        case 'custom':
          // For custom APIs, we'll assume it's working if we have a URL and API key
          return !!(testConfig.url && testConfig.apiKey);
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const connected = await testConnectionWithConfig(config);
      setIsConnected(connected);
      setIsLoading(false);
      return connected;
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      setIsLoading(false);
      return false;
    }
  }, [config, testConnectionWithConfig]);

  const generateResponse = useCallback(async (prompt: string, systemPrompt?: string): Promise<LLMResponse> => {
    setIsLoading(true);
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      switch (config.provider) {
        case 'ollama':
          // Ollama only works on localhost
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            throw new Error('Ollama only works on localhost. Please use localhost for full Ollama functionality.');
          }
          return await generateOllamaResponse(fullPrompt);
        
        case 'openai':
        case 'anthropic':
        case 'google':
          // Use proxy for external APIs on deployed sites
          return await generateProxiedResponse(fullPrompt);
        
        case 'custom':
          return await generateCustomResponse(fullPrompt);
        
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const generateOllamaResponse = async (prompt: string): Promise<LLMResponse> => {
    const response = await fetch(`${config.url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt,
        stream: false,
        options: {
          temperature: config.temperature,
          top_p: 0.9,
          top_k: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.response };
  };

  const generateOpenAIResponse = async (prompt: string): Promise<LLMResponse> => {
    if (!config.apiKey) throw new Error('OpenAI API key required');
    
    const response = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  };

  const generateAnthropicResponse = async (prompt: string): Promise<LLMResponse> => {
    if (!config.apiKey) throw new Error('Anthropic API key required');
    
    const response = await fetch(`${config.url}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage
    };
  };

  const generateGoogleResponse = async (prompt: string): Promise<LLMResponse> => {
    if (!config.apiKey) throw new Error('Google API key required');
    
    const response = await fetch(`${config.url}/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text
    };
  };





  const generateProxiedResponse = async (prompt: string): Promise<LLMResponse> => {
    if (!config.apiKey) {
      throw new Error(`${config.provider} API key required`);
    }

    // Use our backend server proxy
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001'
      : 'https://codeshui-backend.onrender.com';  // Your Render backend
    
    const response = await fetch(`${backendUrl}/api/llm-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: config.provider,
        model: config.model,
        prompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Backend request failed: ${response.statusText}${errorData.error ? ` - ${errorData.error}` : ''}`);
    }

    const data = await response.json();
    return data;
  };

  const generateCustomResponse = async (prompt: string): Promise<LLMResponse> => {
    if (!config.url || !config.apiKey) {
      throw new Error('Custom API requires both URL and API key');
    }
    
    const response = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  };

  const streamResponse = useCallback(async function* (prompt: string, systemPrompt?: string): AsyncGenerator<LLMStreamChunk> {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    
    try {
      switch (config.provider) {
        case 'ollama':
          yield* streamOllamaResponse(fullPrompt);
          break;
        
        case 'openai':
          yield* streamOpenAIResponse(fullPrompt);
          break;
        
        case 'anthropic':
          yield* streamAnthropicResponse(fullPrompt);
          break;
        
        case 'google':
          yield* streamGoogleResponse(fullPrompt);
          break;
        
        case 'custom':
          yield* streamCustomResponse(fullPrompt);
          break;
        
        default:
          throw new Error(`Streaming not supported for provider: ${config.provider}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Streaming failed: ${errorMessage}`);
    }
  }, [config]);

  const streamOllamaResponse = async function* (prompt: string): AsyncGenerator<LLMStreamChunk> {
    const response = await fetch(`${config.url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield { content: data.response, done: false };
            }
            if (data.done) {
              yield { content: '', done: true };
              return;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  };

  const streamOpenAIResponse = async function* (prompt: string): AsyncGenerator<LLMStreamChunk> {
    if (!config.apiKey) throw new Error('OpenAI API key required');
    
    const response = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices[0]?.delta?.content) {
              yield { content: parsed.choices[0].delta.content, done: false };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  };

  const streamAnthropicResponse = async function* (prompt: string): AsyncGenerator<LLMStreamChunk> {
    if (!config.apiKey) throw new Error('Anthropic API key required');
    
    const response = await fetch(`${config.url}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield { content: parsed.delta.text, done: false };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  };

  const streamGoogleResponse = async function* (prompt: string): AsyncGenerator<LLMStreamChunk> {
    if (!config.apiKey) throw new Error('Google API key required');
    
    const response = await fetch(`${config.url}/v1beta/models/${config.model}:streamGenerateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.candidates[0]?.content?.parts[0]?.text) {
              yield { content: parsed.candidates[0].content.parts[0].text, done: false };
            }
            if (parsed.candidates[0]?.finishReason) {
              yield { content: '', done: true };
              return;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  };

  const streamCustomResponse = async function* (prompt: string): AsyncGenerator<LLMStreamChunk> {
    if (!config.url || !config.apiKey) {
      throw new Error('Custom API requires both URL and API key');
    }
    
    const response = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices[0]?.delta?.content) {
              yield { content: parsed.choices[0].delta.content, done: false };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  };

  const updateConfig = useCallback(async (newConfig: Partial<LLMConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    
    // Save to localStorage
    try {
      localStorage.setItem('codeshui-llm-config', JSON.stringify(updatedConfig));
    } catch (error) {
      console.error('Failed to save LLM config to localStorage:', error);
    }
    
    // Update the config state
    setConfig(updatedConfig);
    
    // Only test connection if we're on localhost (avoid CORS issues on deployed sites)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const connected = await testConnectionWithConfig(updatedConfig);
        setIsConnected(connected);
      } catch (error) {
        console.error('Connection test failed after config update:', error);
        setIsConnected(false);
      }
    } else {
      // For deployed sites, just assume connection is possible if config looks valid
      const hasProvider = Boolean(updatedConfig.provider);
      const isOllama = updatedConfig.provider === 'ollama';
      const hasApiKey = Boolean(updatedConfig.apiKey && updatedConfig.apiKey.length > 0);
      const isValidConfig = hasProvider && (isOllama || (!isOllama && hasApiKey));
      
      setIsConnected(isValidConfig);
      console.log('Skipping connection test on deployed site. Assuming connection is possible.');
    }
  }, [config]);

  const getAvailableModels = useCallback((): string[] => {
    return PROVIDER_CONFIGS[config.provider]?.models || [];
  }, [config.provider]);

  return {
    config,
    isConnected,
    isLoading,
    testConnection,
    generateResponse,
    streamResponse,
    updateConfig,
    getAvailableModels,
    PROVIDER_CONFIGS
  };
}
