import { useState, useCallback } from 'react';

export interface ComponentTranslation {
  id: string;
  name: string;
  description: string;
  code: string;
  dependencies: string[];
  filePath: string;
  category: string;
  createdAt: Date;
}

export function useComponentLibrary() {
  const [components, setComponents] = useState<ComponentTranslation[]>([]);

  const addComponent = useCallback((component: Omit<ComponentTranslation, 'id' | 'createdAt'>) => {
    const newComponent: ComponentTranslation = {
      ...component,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      createdAt: new Date()
    };
    
    setComponents(prev => [...prev, newComponent]);
    return newComponent;
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<ComponentTranslation>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
  }, []);

  const getComponentById = useCallback((id: string) => {
    return components.find(comp => comp.id === id);
  }, [components]);

  const getComponentsByCategory = useCallback((category: string) => {
    if (category === 'all') return components;
    return components.filter(comp => comp.category === category);
  }, [components]);

  const searchComponents = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return components.filter(comp => 
      comp.name.toLowerCase().includes(term) ||
      comp.description.toLowerCase().includes(term) ||
      comp.category.toLowerCase().includes(term)
    );
  }, [components]);

  const getComponentStats = useCallback(() => {
    const stats = {
      total: components.length,
      byCategory: {} as Record<string, number>,
      byDependency: {} as Record<string, number>
    };

    components.forEach(comp => {
      // Count by category
      stats.byCategory[comp.category] = (stats.byCategory[comp.category] || 0) + 1;
      
      // Count by dependency
      comp.dependencies.forEach(dep => {
        stats.byDependency[dep] = (stats.byDependency[dep] || 0) + 1;
      });
    });

    return stats;
  }, [components]);

  const exportComponents = useCallback(() => {
    const dataStr = JSON.stringify(components, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'component-library.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [components]);

  const importComponents = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedComponents = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedComponents)) {
            setComponents(prev => [...prev, ...importedComponents]);
            resolve();
          } else {
            reject(new Error('Invalid file format'));
          }
        } catch (error) {
          reject(new Error('Failed to parse file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  const clearComponents = useCallback(() => {
    if (confirm('Are you sure you want to clear all components? This action cannot be undone.')) {
      setComponents([]);
    }
  }, []);

  return {
    components,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponentById,
    getComponentsByCategory,
    searchComponents,
    getComponentStats,
    exportComponents,
    importComponents,
    clearComponents
  };
}
