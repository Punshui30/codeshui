import { useState, useCallback } from 'react';

interface OllamaConfig {
  url: string;
  model: string;
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

export function useOllama() {
  const [config, setConfig] = useState<OllamaConfig>({
    url: 'http://localhost:11434',
    model: 'codellama'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const testConnection = useCallback(async () => {
    try {
      const response = await fetch(`${config.url}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models?.map((m: any) => m.name) || []);
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.error('Ollama connection failed:', error);
    }
    setIsConnected(false);
    return false;
  }, [config.url]);

  const generateResponse = useCallback(async (prompt: string, systemPrompt?: string): Promise<string> => {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      const response = await fetch(`${config.url}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            top_k: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      throw new Error(`Ollama request failed: ${error.message}`);
    }
  }, [config]);

  const streamResponse = useCallback(async function* (prompt: string, systemPrompt?: string) {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      const response = await fetch(`${config.url}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          prompt: fullPrompt,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
                yield data.response;
              }
              if (data.done) return;
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Ollama stream failed: ${error.message}`);
    }
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<OllamaConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return {
    config,
    isConnected,
    availableModels,
    testConnection,
    generateResponse,
    streamResponse,
    updateConfig
  };
}