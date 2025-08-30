import React, { useState } from 'react';
import { X, Plus, Folder, Clock, Star } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  template: string;
  lastModified: Date;
  starred: boolean;
}

interface ProjectManagerProps {
  onClose: () => void;
}

const projectTemplates = [
  {
    id: 'vanilla',
    name: 'Vanilla JavaScript',
    description: 'Basic HTML, CSS, and JavaScript setup',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>Hello World!</h1>
        <p>Welcome to your new project.</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      'style.css': `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 2rem;
    background: #f8fafc;
    color: #334155;
}

#app {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

h1 {
    color: #1e293b;
    margin-bottom: 1rem;
}`,
      'script.js': `console.log('Hello from CodeShui!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully');
});`
    }
  },
  {
    id: 'react',
    name: 'React App',
    description: 'React application with modern setup',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="script.js"></script>
</body>
</html>`,
      'script.js': `// React app example
console.log('React app starting...');`
    }
  }
];

export function ProjectManager({ onClose }: ProjectManagerProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'templates'>('recent');
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Portfolio Website',
      description: 'Personal portfolio with modern design',
      template: 'vanilla',
      lastModified: new Date(Date.now() - 1000 * 60 * 30),
      starred: true
    },
    {
      id: '2',
      name: 'Todo App',
      description: 'React-based todo application',
      template: 'react',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
      starred: false
    }
  ]);

  const createProject = (template: any) => {
    const name = prompt('Project name:');
    if (name) {
      console.log(`Creating project "${name}" with template "${template.name}"`);
      onClose();
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'recent' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Recent Projects
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'templates' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Templates
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'recent' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => {
                    console.log(`Opening project: ${project.name}`);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-400" />
                      <h3 className="font-medium text-white truncate">{project.name}</h3>
                    </div>
                    {project.starred && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="capitalize">{project.template}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(project.lastModified)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => createProject(template)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{template.name}</h3>
                      <p className="text-sm text-gray-300">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                      Template
                    </span>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                      Create
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}