import React, { useState } from 'react';
import { Package, Search, Grid, List, Plus, Code, Download, Trash2, Eye, Edit, X } from 'lucide-react';

interface ComponentTranslation {
  id: string;
  name: string;
  description: string;
  code: string;
  dependencies: string[];
  filePath: string;
  category: string;
  createdAt: Date;
}

interface ComponentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (component: ComponentTranslation) => void;
  onEditComponent: (component: ComponentTranslation) => void;
  onDeleteComponent: (componentId: string) => void;
  components: ComponentTranslation[];
}

const categories = ['all', 'ui', 'layout', 'animation', 'form', 'other'];

export function ComponentLibrary({ 
  isOpen, 
  onClose, 
  onAddComponent, 
  onEditComponent, 
  onDeleteComponent,
  components 
}: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedComponent, setSelectedComponent] = useState<ComponentTranslation | null>(null);

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToProject = (component: ComponentTranslation) => {
    onAddComponent(component);
    onClose();
  };

  const handlePreview = (component: ComponentTranslation) => {
    setSelectedComponent(component);
  };

  const handleEdit = (component: ComponentTranslation) => {
    onEditComponent(component);
  };

  const handleDelete = (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      onDeleteComponent(componentId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Component Library</h2>
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
              {components.length} components
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
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Components Display */}
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No components found</p>
              <p className="text-sm">Try adjusting your search or category filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredComponents.map(component => (
                <div
                  key={component.id}
                  className={`bg-gray-700 rounded-lg border border-gray-600 overflow-hidden ${
                    viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-white">{component.name}</h3>
                          <p className="text-sm text-gray-400">{component.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          component.category === 'ui' ? 'bg-blue-600' :
                          component.category === 'layout' ? 'bg-green-600' :
                          component.category === 'animation' ? 'bg-purple-600' :
                          component.category === 'form' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`}>
                          {component.category}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <div>Dependencies: {component.dependencies.join(', ')}</div>
                        <div>Created: {component.createdAt.toLocaleDateString()}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(component)}
                          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleAddToProject(component)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-3 h-3" />
                          Use
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(component)}
                          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(component.id)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-white">{component.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            component.category === 'ui' ? 'bg-blue-600' :
                            component.category === 'layout' ? 'bg-green-600' :
                            component.category === 'animation' ? 'bg-purple-600' :
                            component.category === 'form' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          }`}>
                            {component.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{component.description}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          Dependencies: {component.dependencies.join(', ')} | Created: {component.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(component)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddToProject(component)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(component)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(component.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Component Preview Modal */}
        {selectedComponent && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Preview: {selectedComponent.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">Component Code:</h4>
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{selectedComponent.code}</code>
                    </pre>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddToProject(selectedComponent)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Add to Project
                  </button>
                  <button
                    onClick={() => setSelectedComponent(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
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
