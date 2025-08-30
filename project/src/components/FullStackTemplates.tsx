import React, { useState } from 'react';
import { Layers, Database, Globe, Smartphone, ShoppingCart, Users, FileText, Plus, Download, Eye, Code } from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'blog' | 'dashboard' | 'social' | 'api' | 'custom';
  frontend: {
    framework: 'react' | 'vue' | 'svelte' | 'angular';
    styling: 'tailwind' | 'bootstrap' | 'material-ui' | 'custom';
    features: string[];
  };
  backend: {
    framework: 'express' | 'fastify' | 'koa' | 'hono' | 'none';
    database: 'sqlite' | 'postgresql' | 'mongodb' | 'mysql' | 'none';
    features: string[];
  };
  dependencies: {
    frontend: string[];
    backend: string[];
  };
  structure: {
    folders: string[];
    files: string[];
  };
  preview: string;
}

interface FullStackTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: ProjectTemplate) => void;
}

const defaultTemplates: ProjectTemplate[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'Full-featured online store with product management, cart, and payment integration',
    category: 'ecommerce',
    frontend: {
      framework: 'react',
      styling: 'tailwind',
      features: ['Product catalog', 'Shopping cart', 'User authentication', 'Payment processing', 'Admin dashboard']
    },
    backend: {
      framework: 'express',
      database: 'postgresql',
      features: ['REST API', 'User management', 'Product CRUD', 'Order processing', 'Payment webhooks']
    },
    dependencies: {
      frontend: ['react', 'react-router-dom', 'axios', 'zustand', 'stripe-js'],
      backend: ['express', 'pg', 'bcrypt', 'jsonwebtoken', 'stripe', 'multer']
    },
    structure: {
      folders: ['src', 'src/components', 'src/pages', 'src/hooks', 'src/store', 'server', 'server/routes', 'server/models'],
      files: ['package.json', 'src/App.tsx', 'src/main.tsx', 'server/server.js', 'server/package.json', '.env.example']
    },
    preview: 'A modern e-commerce platform with a clean, responsive design and full backend functionality.'
  },
  {
    id: '2',
    name: 'Blog Platform',
    description: 'Content management system with markdown support, user roles, and SEO optimization',
    category: 'blog',
    frontend: {
      framework: 'react',
      styling: 'tailwind',
      features: ['Markdown editor', 'User authentication', 'Role-based access', 'SEO optimization', 'Comment system']
    },
    backend: {
      framework: 'fastify',
      database: 'sqlite',
      features: ['Content API', 'User management', 'File uploads', 'Search functionality', 'RSS feeds']
    },
    dependencies: {
      frontend: ['react', 'react-markdown', 'react-router-dom', 'axios', 'react-hook-form'],
      backend: ['fastify', 'sqlite3', 'bcrypt', 'jsonwebtoken', 'multer', 'marked']
    },
    structure: {
      folders: ['src', 'src/components', 'src/pages', 'src/hooks', 'server', 'server/routes', 'server/models'],
      files: ['package.json', 'src/App.tsx', 'src/main.tsx', 'server/server.js', 'server/package.json', '.env.example']
    },
    preview: 'A professional blog platform with markdown support and comprehensive content management.'
  },
  {
    id: '3',
    name: 'Admin Dashboard',
    description: 'Modern admin interface with data visualization, user management, and analytics',
    category: 'dashboard',
    frontend: {
      framework: 'react',
      styling: 'tailwind',
      features: ['Data tables', 'Charts and graphs', 'User management', 'Role permissions', 'Real-time updates']
    },
    backend: {
      framework: 'express',
      database: 'mongodb',
      features: ['REST API', 'Authentication', 'Data aggregation', 'File management', 'Logging system']
    },
    dependencies: {
      frontend: ['react', 'recharts', 'react-table', 'axios', 'react-hook-form', 'date-fns'],
      backend: ['express', 'mongodb', 'mongoose', 'bcrypt', 'jsonwebtoken', 'winston']
    },
    structure: {
      folders: ['src', 'src/components', 'src/pages', 'src/hooks', 'src/utils', 'server', 'server/routes', 'server/models'],
      files: ['package.json', 'src/App.tsx', 'src/main.tsx', 'server/server.js', 'server/package.json', '.env.example']
    },
    preview: 'A comprehensive admin dashboard with data visualization and user management capabilities.'
  },
  {
    id: '4',
    name: 'Social Media App',
    description: 'Social networking platform with posts, comments, likes, and real-time features',
    category: 'social',
    frontend: {
      framework: 'react',
      styling: 'tailwind',
      features: ['Post creation', 'Real-time chat', 'User profiles', 'Friend system', 'News feed']
    },
    backend: {
      framework: 'koa',
      database: 'mongodb',
      features: ['WebSocket support', 'Real-time updates', 'File uploads', 'Push notifications', 'Search']
    },
    dependencies: {
      frontend: ['react', 'socket.io-client', 'react-router-dom', 'axios', 'react-hook-form'],
      backend: ['koa', 'mongodb', 'mongoose', 'socket.io', 'bcrypt', 'jsonwebtoken']
    },
    structure: {
      folders: ['src', 'src/components', 'src/pages', 'src/hooks', 'src/context', 'server', 'server/routes', 'server/models'],
      files: ['package.json', 'src/App.tsx', 'src/main.tsx', 'server/server.js', 'server/package.json', '.env.example']
    },
    preview: 'A modern social media application with real-time features and user interaction.'
  },
  {
    id: '5',
    name: 'REST API Server',
    description: 'Clean, scalable API server with authentication, validation, and documentation',
    category: 'api',
    frontend: {
      framework: 'react',
      styling: 'tailwind',
      features: ['API documentation', 'Request testing', 'Response visualization', 'Error handling', 'Rate limiting']
    },
    backend: {
      framework: 'hono',
      database: 'postgresql',
      features: ['REST endpoints', 'JWT authentication', 'Input validation', 'Error handling', 'API documentation']
    },
    dependencies: {
      frontend: ['react', 'axios', 'react-hook-form', 'react-query'],
      backend: ['hono', 'pg', 'bcrypt', 'jsonwebtoken', 'zod', 'swagger-ui-express']
    },
    structure: {
      folders: ['src', 'src/components', 'src/pages', 'server', 'server/routes', 'server/middleware', 'server/validation'],
      files: ['package.json', 'src/App.tsx', 'src/main.tsx', 'server/server.js', 'server/package.json', '.env.example']
    },
    preview: 'A production-ready REST API server with comprehensive documentation and testing tools.'
  }
];

const categories = [
  { id: 'all', name: 'All Templates', icon: Layers },
  { id: 'ecommerce', name: 'E-Commerce', icon: ShoppingCart },
  { id: 'blog', name: 'Blog & CMS', icon: FileText },
  { id: 'dashboard', name: 'Admin Dashboard', icon: Database },
  { id: 'social', name: 'Social Media', icon: Users },
  { id: 'api', name: 'API Server', icon: Globe }
];

export function FullStackTemplates({ isOpen, onClose, onUseTemplate }: FullStackTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);

  const filteredTemplates = defaultTemplates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleUseTemplate = (template: ProjectTemplate) => {
    onUseTemplate(template);
    onClose();
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? React.createElement(category.icon, { className: "w-4 h-4" }) : null;
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'react': return 'bg-blue-600';
      case 'vue': return 'bg-green-600';
      case 'svelte': return 'bg-orange-600';
      case 'angular': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Full-Stack Templates</h2>
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
              {defaultTemplates.length} templates
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {getCategoryIcon(category.id)}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden hover:border-blue-500 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.category === 'ecommerce' ? 'bg-green-600' :
                      template.category === 'blog' ? 'bg-blue-600' :
                      template.category === 'dashboard' ? 'bg-purple-600' :
                      template.category === 'social' ? 'bg-pink-600' :
                      template.category === 'api' ? 'bg-orange-600' :
                      'bg-gray-600'
                    }`}>
                      {template.category}
                    </span>
                  </div>

                  {/* Frontend & Backend Info */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-200 mb-2">Frontend</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getFrameworkColor(template.frontend.framework)}`}>
                          {template.frontend.framework}
                        </span>
                        <span className="text-xs text-gray-400">{template.frontend.styling}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-200 mb-2">Backend</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          template.backend.framework === 'none' ? 'bg-gray-600' : 'bg-green-600'
                        }`}>
                          {template.backend.framework === 'none' ? 'None' : template.backend.framework}
                        </span>
                        <span className="text-xs text-gray-400">{template.backend.database}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-200 mb-2">Key Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.frontend.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="text-xs bg-gray-600 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {template.frontend.features.length > 3 && (
                        <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                          +{template.frontend.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplateDetails(true);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Details Modal */}
        {showTemplateDetails && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedTemplate.name}</h3>
                <button
                  onClick={() => setShowTemplateDetails(false)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                {/* Overview */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Overview</h4>
                  <p className="text-gray-300">{selectedTemplate.preview}</p>
                </div>

                {/* Frontend Details */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Frontend Stack</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-200 mb-2">Framework & Styling</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${getFrameworkColor(selectedTemplate.frontend.framework)}`}>
                              {selectedTemplate.frontend.framework}
                            </span>
                            <span className="text-sm text-gray-400">{selectedTemplate.frontend.styling}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-200 mb-2">Features</h5>
                        <div className="space-y-1">
                          {selectedTemplate.frontend.features.map((feature, index) => (
                            <div key={index} className="text-sm text-gray-400 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backend Details */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Backend Stack</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-200 mb-2">Framework & Database</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              selectedTemplate.backend.framework === 'none' ? 'bg-gray-600' : 'bg-green-600'
                            }`}>
                              {selectedTemplate.backend.framework === 'none' ? 'None' : selectedTemplate.backend.framework}
                            </span>
                            <span className="text-sm text-gray-400">{selectedTemplate.backend.database}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-200 mb-2">Features</h5>
                        <div className="space-y-1">
                          {selectedTemplate.backend.features.map((feature, index) => (
                            <div key={index} className="text-sm text-gray-400 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Dependencies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-200 mb-2">Frontend</h5>
                      <div className="bg-gray-900 rounded p-3">
                        <pre className="text-xs text-gray-300">
                          {selectedTemplate.dependencies.frontend.map(dep => `"${dep}": "^latest"`).join('\n')}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-200 mb-2">Backend</h5>
                      <div className="bg-gray-900 rounded p-3">
                        <pre className="text-xs text-gray-300">
                          {selectedTemplate.dependencies.backend.map(dep => `"${dep}": "^latest"`).join('\n')}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Structure */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Project Structure</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-200 mb-2">Folders</h5>
                        <div className="space-y-1">
                          {selectedTemplate.structure.folders.map((folder, index) => (
                            <div key={index} className="text-sm text-gray-400 flex items-center gap-2">
                              <Code className="w-3 h-3" />
                              {folder}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-200 mb-2">Key Files</h5>
                        <div className="space-y-1">
                          {selectedTemplate.structure.files.map((file, index) => (
                            <div key={index} className="text-sm text-gray-400 flex items-center gap-2">
                              <FileText className="w-3 h-3" />
                              {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Use This Template
                  </button>
                  <button
                    onClick={() => setShowTemplateDetails(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
