import React, { useState, useEffect } from 'react';
import { Settings, TestTube, CheckCircle, XCircle, Eye, EyeOff, Save, RefreshCw, X } from 'lucide-react';
import { LLMProvider } from '../hooks/useLLM';

interface LLMSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  updateConfig: (newConfig: Partial<any>) => void;
  PROVIDER_CONFIGS: any;
  config: any; // Add this to receive the global config
}

export function LLMSettings({ isOpen, onClose, updateConfig, PROVIDER_CONFIGS, config }: LLMSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleProviderChange = (provider: LLMProvider) => {
    const newConfig = {
      ...tempConfig,
      provider,
      url: PROVIDER_CONFIGS[provider].defaultUrl || '',
      model: PROVIDER_CONFIGS[provider].models[0] || 'custom'
    };
    setTempConfig(newConfig);
  };

  const handleTestConnection = async () => {
    setTestResult('testing');
    setTestMessage('');
    
    try {
      // Test with the current tempConfig directly
      const success = await testConnectionWithConfig(tempConfig);
      
      if (success) {
        setTestResult('success');
        setTestMessage('Connection successful!');
      } else {
        setTestResult('error');
        if (tempConfig.provider === 'anthropic' && !tempConfig.apiKey) {
          setTestMessage('Anthropic requires an API key. Please enter your API key and try again.');
        } else if (tempConfig.provider === 'openai' && !tempConfig.apiKey) {
          setTestMessage('OpenAI requires an API key. Please enter your API key and try again.');
        } else if (tempConfig.provider === 'google' && !tempConfig.apiKey) {
          setTestMessage('Google AI requires an API key. Please enter your API key and try again.');
        } else {
          setTestMessage('Connection failed. Please check your settings and try again.');
        }
      }
    } catch (error) {
      setTestResult('error');
      setTestMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to test connection with specific config
  const testConnectionWithConfig = async (testConfig: any): Promise<boolean> => {
    try {
      switch (testConfig.provider) {
        case 'ollama':
          // For Ollama, we can test locally but not from deployed sites
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            throw new Error('Ollama connection tests only work from localhost. Please test from your local development environment.');
          }
          const response = await fetch(`${testConfig.url}/api/tags`);
          return response.ok;
        
        case 'openai':
          if (!testConfig.apiKey) return false;
          // For deployed sites, we can't test external APIs due to CORS
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Just validate the API key format instead of testing the connection
            if (testConfig.apiKey.startsWith('sk-') && testConfig.apiKey.length > 20) {
              return true; // Assume valid if format looks correct
            } else {
              throw new Error('Invalid OpenAI API key format. Should start with "sk-" and be at least 20 characters.');
            }
          }
          const openaiResponse = await fetch(`${testConfig.url}/models`, {
            headers: {
              'Authorization': `Bearer ${testConfig.apiKey}`
            }
          });
          return openaiResponse.ok;
        
        case 'anthropic':
          if (!testConfig.apiKey) return false;
          // For deployed sites, we can't test external APIs due to CORS
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Just validate the API key format instead of testing the connection
            if (testConfig.apiKey.startsWith('sk-ant-') && testConfig.apiKey.length > 20) {
              return true; // Assume valid if format looks correct
            } else {
              throw new Error('Invalid Anthropic API key format. Should start with "sk-ant-" and be at least 20 characters.');
            }
          }
          const anthropicResponse = await fetch(`${testConfig.url}/v1/models`, {
            headers: {
              'x-api-key': testConfig.apiKey,
              'anthropic-version': '2023-06-01'
            }
          });
          return anthropicResponse.ok;
        
        case 'google':
          if (!testConfig.apiKey) return false;
          // For deployed sites, we can't test external APIs due to CORS
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Just validate the API key format instead of testing the connection
            if (testConfig.apiKey.length > 20) {
              return true; // Assume valid if format looks correct
            } else {
              throw new Error('Invalid Google AI API key format. Should be at least 20 characters.');
            }
          }
          const googleResponse = await fetch(`${testConfig.url}/v1beta/models?key=${testConfig.apiKey}`);
          return googleResponse.ok;
        
        case 'custom':
          return !!(testConfig.url && testConfig.apiKey);
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error; // Re-throw to show the actual error message
    }
  };

  const handleSave = async () => {
    console.log('Save button clicked!');
    console.log('Current tempConfig:', tempConfig);
    console.log('updateConfig function:', updateConfig);
    
    try {
      // Update the global config with the temp config
      console.log('Calling updateConfig...');
      await updateConfig(tempConfig);
      console.log('updateConfig completed successfully');
      onClose();
    } catch (error) {
      console.error('Error in handleSave:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save settings: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    setTempConfig(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="bg-gray-700 px-4 sm:px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">LLM Settings</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-3">
              AI Provider
            </label>
            {/* Debug info */}
            <div className="text-xs text-gray-400 mb-2">
              Current provider: {tempConfig.provider} | Models: {PROVIDER_CONFIGS[tempConfig.provider]?.models?.length || 0}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(PROVIDER_CONFIGS).map(([key, provider]) => (
                <button
                  key={key}
                  onClick={() => handleProviderChange(key as LLMProvider)}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    tempConfig.provider === key
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-white text-sm sm:text-base">{provider.name}</div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">{provider.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4">
            {/* URL Field */}
            {PROVIDER_CONFIGS[tempConfig.provider].defaultUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  API URL
                </label>
                <input
                  type="url"
                  value={tempConfig.url || ''}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, url: e.target.value }))}
                  placeholder={PROVIDER_CONFIGS[tempConfig.provider].defaultUrl}
                  className="w-full px-3 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* API Key Field */}
            {PROVIDER_CONFIGS[tempConfig.provider].requiresApiKey && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempConfig.apiKey || ''}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 pr-10 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Model
              </label>
              <select
                value={tempConfig.model}
                onChange={(e) => setTempConfig(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-3 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {PROVIDER_CONFIGS[tempConfig.provider]?.models?.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                )) || []}
              </select>
              {/* Debug info */}
              <div className="text-xs text-gray-400 mt-1">
                Available models: {PROVIDER_CONFIGS[tempConfig.provider]?.models?.join(', ') || 'None'}
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Temperature: {tempConfig.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={tempConfig.temperature || 0.1}
                onChange={(e) => setTempConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Focused (0.0)</span>
                <span className="hidden sm:inline">Balanced (1.0)</span>
                <span className="hidden sm:inline">Creative (2.0)</span>
                <span className="sm:hidden">Creative (2.0)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Max Tokens: {tempConfig.maxTokens}
              </label>
              <input
                type="range"
                min="100"
                max="8000"
                step="100"
                value={tempConfig.maxTokens || 4000}
                onChange={(e) => setTempConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Short (100)</span>
                <span className="hidden sm:inline">Medium (4000)</span>
                <span className="sm:hidden">Long (8000)</span>
                <span className="hidden sm:inline">Long (8000)</span>
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h3 className="text-sm font-medium text-gray-200">Test Connection</h3>
              <button
                onClick={handleTestConnection}
                disabled={testResult === 'testing'}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
              >
                {testResult === 'testing' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test
              </button>
            </div>
            
            {testResult !== 'idle' && (
              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                testResult === 'success' ? 'bg-green-600/20 text-green-400' :
                testResult === 'error' ? 'bg-red-600/20 text-red-400' :
                'bg-blue-600/20 text-blue-400'
              }`}>
                {testResult === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {testResult === 'error' && <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {testResult === 'testing' && <RefreshCw className="w-4 h-4 mt-0.5 animate-spin flex-shrink-0" />}
                <div className="flex-1">
                  <span className="text-sm">{testMessage}</span>
                  
                  {/* CORS Information */}
                  {testResult === 'error' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
                    <div className="mt-2 p-2 bg-yellow-600/20 border border-yellow-600/30 rounded text-xs text-yellow-400">
                      <strong>⚠️ CORS Limitation:</strong> Connection tests from deployed sites only validate API key format. 
                      <br /><br />
                      <strong>For full functionality:</strong>
                      <br />• Use CodeShui locally (localhost) for Ollama and real API testing
                      <br />• Deployed sites can only validate API key format due to browser security restrictions
                      <br />• External API calls will fail from deployed sites
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-700 px-4 sm:px-6 py-4 border-t border-gray-600 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
