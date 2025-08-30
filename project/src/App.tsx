import React, { useState, useCallback } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/CodeEditor';
import { PreviewPanel } from './components/PreviewPanel';
import { Terminal } from './components/Terminal';
import { ProjectManager } from './components/ProjectManager';
import { Tabs } from './components/Tabs';
import Header from './components/Header';
import { LivePreview } from './components/LivePreview';
import { AIAssistant } from './components/AIAssistant';
import { AIDebugger } from './components/AIDebugger';
import { LLMSettings } from './components/LLMSettings';
import { ComponentTranslator } from './components/ComponentTranslator';
import { ComponentLibrary } from './components/ComponentLibrary';
import { BackendManager } from './components/BackendManager';
import { FullStackTemplates } from './components/FullStackTemplates';
import { useFileSystem } from './hooks/useFileSystem';
import { useComponentLibrary } from './hooks/useComponentLibrary';
import { useBackendManager } from './hooks/useBackendManager';
import { useLLM } from './hooks/useLLM';
import { FileIcon, FolderOpen, X } from 'lucide-react';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileItem[];
  parentId?: string;
}

export interface Tab {
  id: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
}

function App() {
  const { files, createFile, createFolder, deleteItem, updateFileContent, renameItem } = useFileSystem();
  const { components, addComponent, updateComponent, deleteComponent } = useComponentLibrary();
  const { servers, addServer, updateServer, deleteServer } = useBackendManager();
  const { config, isConnected, isLoading, testConnection, generateResponse, streamResponse, updateConfig, getAvailableModels, PROVIDER_CONFIGS } = useLLM();
  
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAIDebugger, setShowAIDebugger] = useState(false);
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [showComponentTranslator, setShowComponentTranslator] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showBackendManager, setShowBackendManager] = useState(false);
  const [showFullStackTemplates, setShowFullStackTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'live'>('live');

  const openFile = useCallback((file: FileItem) => {
    const existingTab = openTabs.find(tab => tab.id === file.id);
    if (existingTab) {
      setActiveTab(file.id);
      return;
    }
    const newTab: Tab = {
      id: file.id,
      name: file.name,
      content: file.content || '',
      language: file.language || 'text',
      isDirty: false
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTab(file.id);
  }, [openTabs]);

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTab === tabId) {
      const remainingTabs = openTabs.filter(tab => tab.id !== tabId);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null);
    }
  }, [activeTab, openTabs]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setOpenTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, content, isDirty: tab.content !== content }
        : tab
    ));
    updateFileContent(tabId, content);
  }, [updateFileContent]);

  const saveTab = useCallback((tabId: string) => {
    setOpenTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isDirty: false } : tab
    ));
  }, []);

  const activeTabData = openTabs.find(tab => tab.id === activeTab);

  const runProject = () => {
    setShowPreview(true);
    setShowTerminal(true);
    setPreviewMode('live');
  };

  const applyAIFix = useCallback((fileId: string, fix: string) => {
    updateFileContent(fileId, fix);
    setOpenTabs(prev => prev.map(tab =>
      tab.id === fileId ? { ...tab, isDirty: true } : tab
    ));
  }, [updateFileContent]);

  const handleAddComponent = useCallback((component: any) => {
    addComponent(component);
    // Create a new file with the component
    const fileName = component.filePath || `components/${component.name.toLowerCase().replace(/\s+/g, '-')}.tsx`;
    createFile(fileName);
    // Get the created file and update its content
    const createdFile = files.find(f => f.name === fileName);
    if (createdFile) {
      updateFileContent(createdFile.id, component.code);
    }
  }, [addComponent, createFile, updateFileContent, files]);

  const handleUseTemplate = useCallback((template: any) => {
    // Create the project structure based on the template
    console.log('Using template:', template.name);
    
    // Create main project files
    createFile('package.json');
    const packageFile = files.find(f => f.name === 'package.json');
    if (packageFile) {
      updateFileContent(packageFile.id, JSON.stringify(template.dependencies, null, 2));
    }
    
    createFile('README.md');
    const readmeFile = files.find(f => f.name === 'README.md');
    if (readmeFile) {
      updateFileContent(readmeFile.id, `# ${template.name}\n\n${template.description}`);
    }
    
    // Create frontend structure
    if (template.structure.folders) {
      template.structure.folders.forEach((folder: string) => {
        if (folder.startsWith('src/')) {
          createFolder(folder);
        }
      });
    }
    
    // Create backend structure
    if (template.backend.framework !== 'none') {
      createFolder('server');
      createFolder('server/routes');
      createFolder('server/models');
      
      // Generate server code
      const serverCode = `// ${template.name} Server
// Generated from template

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '${template.name} API is running!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
      
      createFile('server/server.js');
      const serverFile = files.find(f => f.name === 'server.js');
      if (serverFile) {
        updateFileContent(serverFile.id, serverCode);
      }
    }
  }, [createFile, createFolder, updateFileContent, files]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
             <Header
         onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
         onShowProjectManager={() => setShowProjectManager(true)}
         onRun={runProject}
         onShowAI={() => setShowAIAssistant(true)}
         onShowDebugger={() => setShowAIDebugger(true)}
         onShowComponentTranslator={() => setShowComponentTranslator(true)}
         onShowComponentLibrary={() => setShowComponentLibrary(true)}
         onShowBackendManager={() => setShowBackendManager(true)}
         onShowFullStackTemplates={() => setShowFullStackTemplates(true)}
         onShowYouTube={() => {}} // Placeholder for now
       />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-white/90 backdrop-blur-sm border-r-2 border-primary/50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-0' : 'w-full sm:w-80'
        } overflow-hidden shadow-sm absolute sm:relative z-40 h-full`}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-zinc-600" />
              <h2 className="text-lg font-semibold text-zinc-900">Files</h2>
            </div>
            <FileExplorer
              files={files}
              onOpenFile={openFile}
              onCreateFile={createFile}
              onCreateFolder={createFolder}
              onDeleteItem={deleteItem}
              onRenameItem={renameItem}
            />
          </div>
        </div>

        {/* AI Assistant - Integrated into tablet interface */}
        {showAIAssistant && (
          <div className="flex-1 flex flex-col bg-gray-900">
            <AIAssistant
              files={files}
              onApplyCode={applyAIFix}
              onClose={() => setShowAIAssistant(false)}
              onShowSettings={() => setShowLLMSettings(true)}
              config={config}
              isConnected={isConnected}
              generateResponse={generateResponse}
              PROVIDER_CONFIGS={PROVIDER_CONFIGS}
            />
          </div>
        )}

        {/* Main Content Area - Only show when AI is not active */}
        {!showAIAssistant && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            {openTabs.length > 0 && (
              <Tabs
                tabs={openTabs}
                activeTab={activeTab}
                onTabClick={setActiveTab}
                onTabClose={closeTab}
                onTabSave={saveTab}
              />
            )}

            {/* Editor and Preview */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Code Editor */}
              <div className={`bg-white transition-all duration-300 ${
                showPreview ? 'w-full lg:w-1/2' : 'w-full'
              }`}>
                {activeTabData ? (
                  <CodeEditor
                    file={activeTabData}
                    onChange={(content) => updateTabContent(activeTabData.id, content)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileIcon className="w-10 h-10 text-blue-600" />
                      </div>
                      <p className="text-lg text-zinc-900 font-medium">Open a file to start editing</p>
                      <p className="text-sm mt-2 text-zinc-600">Select a file from the explorer or create a new one</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              {showPreview && (
                <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-zinc-200">
                  <div className="h-full flex flex-col">
                    <div className="bg-zinc-50/80 backdrop-blur-sm px-3 sm:px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => setPreviewMode('preview')}
                          className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            previewMode === 'preview' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                          }`}
                        >
                          Static
                        </button>
                        <button
                          onClick={() => setPreviewMode('live')}
                          className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            previewMode === 'live' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                          }`}
                        >
                          Live
                        </button>
                      </div>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-1 hover:bg-codeshui-500/20 rounded transition-colors text-codeshui-500 hover:text-codeshui-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {previewMode === 'live' ? (
                      <LivePreview />
                    ) : (
                      <PreviewPanel />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Terminal */}
            {showTerminal && (
              <div className="h-64 border-t border-codeshui-500/30 bg-gradient-to-r from-codeshui-dark-100 to-codeshui-dark-200">
                <Terminal onClose={() => setShowTerminal(false)} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager onClose={() => setShowProjectManager(false)} />
      )}

      {/* AI Debugger Modal */}
      {showAIDebugger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl h-3/4">
            <AIDebugger
              files={files}
              onApplyFix={applyAIFix}
              onClose={() => setShowAIDebugger(false)}
              onShowSettings={() => setShowLLMSettings(true)}
              config={config}
              isConnected={isConnected}
              generateResponse={generateResponse}
              PROVIDER_CONFIGS={PROVIDER_CONFIGS}
            />
          </div>
        </div>
      )}

      {/* LLM Settings Modal */}
      <LLMSettings
        isOpen={showLLMSettings}
        onClose={() => setShowLLMSettings(false)}
        updateConfig={updateConfig}
        PROVIDER_CONFIGS={PROVIDER_CONFIGS}
        config={config}
      />

      {/* Component Translator Modal */}
      <ComponentTranslator
        isOpen={showComponentTranslator}
        onClose={() => setShowComponentTranslator(false)}
        onAddComponent={handleAddComponent}
        config={config}
        isConnected={isConnected}
        generateResponse={generateResponse}
        PROVIDER_CONFIGS={PROVIDER_CONFIGS}
      />

      {/* Component Library Modal */}
      <ComponentLibrary
        isOpen={showComponentLibrary}
        onClose={() => setShowComponentLibrary(false)}
        onAddComponent={handleAddComponent}
        onEditComponent={(component) => {
          // Find the component by name and update it
          const existingComponent = components.find(c => c.name === component.name);
          if (existingComponent) {
            updateComponent(existingComponent.id, component);
          }
        }}
        onDeleteComponent={deleteComponent}
        components={components}
      />

      {/* Backend Manager Modal */}
      <BackendManager
        isOpen={showBackendManager}
        onClose={() => setShowBackendManager(false)}
        onAddServer={addServer}
        onUpdateServer={updateServer}
        onDeleteServer={deleteServer}
        servers={servers}
      />

      {/* Full-Stack Templates Modal */}
      <FullStackTemplates
        isOpen={showFullStackTemplates}
        onClose={() => setShowFullStackTemplates(false)}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}

export default App;
