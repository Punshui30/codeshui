import React from 'react';
import { Menu, Settings, Play, Bug, Library, Code, Database, Languages, Youtube } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onShowProjectManager: () => void;
  onRun: () => void;
  onShowAI: () => void;
  onShowDebugger: () => void;
  onShowComponentTranslator: () => void;
  onShowComponentLibrary: () => void;
  onShowBackendManager: () => void;
  onShowFullStackTemplates: () => void;
  onShowYouTube: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onShowProjectManager, 
  onRun, 
  onShowAI, 
  onShowDebugger, 
  onShowComponentTranslator, 
  onShowComponentLibrary, 
  onShowBackendManager, 
  onShowFullStackTemplates,
  onShowYouTube
}) => {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-black font-bold text-lg">CS</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CodeShui</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Code Builder</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={onShowFullStackTemplates}
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors flex items-center space-x-2"
        >
          <Library className="h-4 w-4" />
          <span>Templates</span>
        </button>
        
        <button 
          onClick={onShowBackendManager}
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors flex items-center space-x-2"
        >
          <Database className="h-4 w-4" />
          <span>Backend</span>
        </button>
        
        <button 
          onClick={onShowComponentTranslator}
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors flex items-center space-x-2"
        >
          <Languages className="h-4 w-4" />
          <span>Translate</span>
        </button>
        
        <button 
          onClick={onShowComponentLibrary}
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors flex items-center space-x-2"
        >
          <Code className="h-4 w-4" />
          <span>Library</span>
        </button>
        
        <button 
          onClick={onShowAI}
          className="px-3 py-2 text-sm font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Code className="h-4 w-4" />
          <span>AI</span>
        </button>
        
        <button 
          onClick={onShowDebugger}
          className="px-3 py-2 text-sm font-medium text-white bg-silver-500 hover:bg-silver-600 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Bug className="h-4 w-4" />
          <span>Debug</span>
        </button>
        
        <button 
          onClick={onShowYouTube}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Youtube className="h-4 w-4" />
          <span>YouTube</span>
        </button>
        
        <button 
          onClick={onShowProjectManager}
          className="px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Library className="h-4 w-4" />
          <span>Projects</span>
        </button>
        
        <button 
          onClick={onRun}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>▷ Run</span>
        </button>
        
        <button
          onClick={onShowComponentTranslator}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;