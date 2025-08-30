import React, { useState, useRef } from 'react';
import { Bot, Code, Download, Settings, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ComponentTranslation {
  name: string;
  description: string;
  code: string;
  dependencies: string[];
  filePath: string;
  category: string;
}

interface ComponentTranslatorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (component: ComponentTranslation) => void;
  config: any;
  isConnected: boolean;
  generateResponse: (prompt: string, systemPrompt?: string) => Promise<any>;
  PROVIDER_CONFIGS: any;
}

export function ComponentTranslator({ isOpen, onClose, onAddComponent, config, isConnected, generateResponse, PROVIDER_CONFIGS }: ComponentTranslatorProps) {
  const [prompt, setPrompt] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedComponent, setTranslatedComponent] = useState<ComponentTranslation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const promptRef = useRef<HTMLTextAreaElement>(null);

  const translatePrompt = async () => {
    if (!prompt.trim() || !isConnected) return;

    setIsTranslating(true);
    setError(null);
    setTranslatedComponent(null);

    try {
      const systemPrompt = `You are a component translation expert. Your job is to take 21st.dev component prompts and translate them to work in a Vite + React + TypeScript project.

IMPORTANT TRANSLATION RULES:
1. Convert Next.js specific code to standard React
2. Replace @/components/ui paths with relative paths
3. Convert Next.js Image component to standard img or use a placeholder
4. Remove Next.js specific imports and features
5. Adapt shadcn patterns to work with standard Tailwind CSS
6. Generate proper TypeScript interfaces
7. Create components that work in a browser environment
8. Handle dependencies properly (framer-motion, lucide-react, etc.)

OUTPUT FORMAT (return as JSON):
{
  "name": "Component Name",
  "description": "Brief description of what this component does",
  "code": "The translated React component code",
  "dependencies": ["list", "of", "npm", "packages"],
  "filePath": "suggested/file/path.tsx",
  "category": "ui|layout|animation|form|other"
}

21st.dev Prompt to translate:
${prompt}`;

      const response = await generateResponse(prompt, systemPrompt);
      
      try {
        const parsed = JSON.parse(response.content);
        if (parsed.name && parsed.code) {
          setTranslatedComponent(parsed);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        // If JSON parsing fails, try to extract the component manually
        const fallbackComponent = createFallbackComponent(response.content, prompt);
        setTranslatedComponent(fallbackComponent);
      }
    } catch (error) {
      setError(`Translation failed: ${error.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const createFallbackComponent = (content: string, originalPrompt: string): ComponentTranslation => {
    // Extract component name from prompt
    const nameMatch = originalPrompt.match(/(?:Create|Build|Make)\s+(?:a\s+)?([A-Z][a-zA-Z\s]+?)(?:\s+component|\s+that|$)/i);
    const name = nameMatch ? nameMatch[1].trim() : 'Translated Component';
    
    return {
      name,
      description: 'Component translated from 21st.dev prompt',
      code: content,
      dependencies: ['react', 'react-dom'],
      filePath: `components/${name.replace(/\s+/g, '-').toLowerCase()}.tsx`,
      category: 'ui'
    };
  };

  const handleAddComponent = () => {
    if (translatedComponent) {
      onAddComponent(translatedComponent);
      onClose();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('21st.dev') || pastedText.includes('shadcn') || pastedText.includes('Next.js')) {
      setPrompt(pastedText);
    }
  };

  const getProviderDisplayName = () => {
    return PROVIDER_CONFIGS[config.provider]?.name || 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Component Translator</h2>
            <span className={`text-xs px-2 py-1 rounded ${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {getProviderDisplayName()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
              <div className="text-sm text-yellow-400">
                <strong>LLM not connected:</strong> Please configure your AI provider in settings to use the component translator.
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Paste 21st.dev Component Prompt
            </label>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste a 21st.dev component prompt here... The AI will translate it to work in your CodeShui builder."
              className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              disabled={!isConnected}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={translatePrompt}
                disabled={!prompt.trim() || !isConnected || isTranslating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isTranslating ? <Loader className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
                {isTranslating ? 'Translating...' : 'Translate Component'}
              </button>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-200 mb-3">Translation Options</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <strong>Target Framework:</strong> Vite + React + TypeScript
                </div>
                <div>
                  <strong>Styling:</strong> Tailwind CSS
                </div>
                <div>
                  <strong>Image Handling:</strong> Standard HTML img tags
                </div>
                <div>
                  <strong>Path Structure:</strong> Relative imports
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Translation Result */}
          {translatedComponent && (
            <div className="space-y-4">
              <div className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Component Translated Successfully!</span>
                </div>
                <div className="text-sm text-green-300">
                  <strong>Name:</strong> {translatedComponent.name}<br />
                  <strong>Category:</strong> {translatedComponent.category}<br />
                  <strong>Dependencies:</strong> {translatedComponent.dependencies.join(', ')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Translated Component Code
                </label>
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{translatedComponent.code}</code>
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddComponent}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Add to Project
                </button>
                <button
                  onClick={() => setTranslatedComponent(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
                >
                  Translate Another
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-200 mb-2">How to Use:</h3>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Copy a component prompt from 21st.dev</li>
              <li>Paste it into the text area above</li>
              <li>Click "Translate Component"</li>
              <li>Review the translated code</li>
              <li>Click "Add to Project" to use it</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
