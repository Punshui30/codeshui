import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader, Code, Wand2, X, Settings } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  codeBlock?: string;
}

interface AIAssistantProps {
  files: any[];
  onApplyCode: (fileId: string, content: string) => void;
  onClose: () => void;
  onShowSettings: () => void;
  config: any;
  isConnected: boolean;
  generateResponse: (prompt: string, systemPrompt?: string) => Promise<any>;
  PROVIDER_CONFIGS: any;
}

export function AIAssistant({ files, onApplyCode, onClose, onShowSettings, config, isConnected, generateResponse, PROVIDER_CONFIGS }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI coding assistant. I can help you debug, write, and improve your code. What would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Get context from current files
      const context = files
        .filter(f => f.type === 'file' && f.content)
        .map(f => `File: ${f.name}\n${f.content}`)
        .join('\n\n---\n\n');

      const systemPrompt = `You are a helpful coding assistant. Here's the current project context:

${context}

Please provide a helpful response. If you're suggesting code changes, format them clearly and indicate which file they should go in.`;

      const response = await generateResponse(input, systemPrompt);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Error: ${error.message}. Please check your LLM configuration in settings.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsProcessing(false);
  };

  const extractCodeBlock = (content: string): string | null => {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
    const match = content.match(codeBlockRegex);
    return match ? match[1] : null;
  };

  const applyCodeToFile = (message: Message) => {
    const codeBlock = extractCodeBlock(message.content);
    if (!codeBlock) return;

    const fileName = prompt('Which file should this code be applied to?', 'index.html');
    if (!fileName) return;

    const file = files.find(f => f.name === fileName);
    if (file) {
      onApplyCode(file.id, codeBlock);
    } else {
      alert('File not found. Please create the file first.');
    }
  };

  const getProviderDisplayName = () => {
    return PROVIDER_CONFIGS[config.provider]?.name || 'Unknown';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="font-medium">AI Assistant</span>
          <span className={`text-xs px-2 py-1 rounded ${
            isConnected ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {getProviderDisplayName()}
          </span>
          {!isConnected && (
            <span className="text-xs text-red-400">(Not Connected)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowSettings}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="LLM Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-100'
            } rounded-lg p-3`}>
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              
              {message.type === 'ai' && extractCodeBlock(message.content) && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => applyCodeToFile(message)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors"
                  >
                    <Code className="w-3 h-3" />
                    Apply Code
                  </button>
                </div>
              )}
              
              <div className="text-xs text-gray-400 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">U</span>
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-300">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask AI to help with your code..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
            disabled={isProcessing || !isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={isProcessing || !input.trim() || !isConnected}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setInput('Debug my code and find any issues')}
            disabled={!isConnected}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs transition-colors"
          >
            Debug Code
          </button>
          <button
            onClick={() => setInput('Improve the performance of my code')}
            disabled={!isConnected}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs transition-colors"
          >
            Optimize
          </button>
          <button
            onClick={() => setInput('Add comments to explain my code')}
            disabled={!isConnected}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs transition-colors"
          >
            Add Comments
          </button>
        </div>
        
        {!isConnected && (
          <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
            <div className="text-sm text-yellow-400">
              <strong>Not Connected:</strong> Please configure your LLM provider in settings to use the AI assistant.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}