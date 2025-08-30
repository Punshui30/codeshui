import { useState, useCallback } from 'react';
import { FileItem } from '../App';

const initialFiles: FileItem[] = [];

export function useFileSystem() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);

  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      html: 'html',
      css: 'css',
      js: 'javascript',
      json: 'json',
      md: 'markdown',
      txt: 'text',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript'
    };
    return languageMap[ext || ''] || 'text';
  };

  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  };

  const createFile = useCallback((name: string, parentId?: string) => {
    const newFile: FileItem = {
      id: generateId(),
      name,
      type: 'file',
      language: getFileExtension(name),
      content: '',
      parentId
    };

    setFiles(prev => {
      if (!parentId) {
        return [...prev, newFile];
      }

      const updateFiles = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === parentId && item.type === 'folder') {
            return {
              ...item,
              children: [...(item.children || []), newFile]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateFiles(item.children)
            };
          }
          return item;
        });
      };

      return updateFiles(prev);
    });
  }, []);

  const createFolder = useCallback((name: string, parentId?: string) => {
    const newFolder: FileItem = {
      id: generateId(),
      name,
      type: 'folder',
      children: [],
      parentId
    };

    setFiles(prev => {
      if (!parentId) {
        return [...prev, newFolder];
      }

      const updateFiles = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === parentId && item.type === 'folder') {
            return {
              ...item,
              children: [...(item.children || []), newFolder]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateFiles(item.children)
            };
          }
          return item;
        });
      };

      return updateFiles(prev);
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setFiles(prev => {
      const removeItem = (items: FileItem[]): FileItem[] => {
        return items.filter(item => {
          if (item.id === id) return false;
          if (item.children) {
            item.children = removeItem(item.children);
          }
          return true;
        });
      };
      return removeItem(prev);
    });
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prev => {
      const updateContent = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === id && item.type === 'file') {
            return { ...item, content };
          }
          if (item.children) {
            return { ...item, children: updateContent(item.children) };
          }
          return item;
        });
      };
      return updateContent(prev);
    });
  }, []);

  const getFileById = useCallback((id: string): FileItem | undefined => {
    const search = (items: FileItem[]): FileItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return search(files);
  }, [files]);

  const renameItem = useCallback((id: string, newName: string) => {
    setFiles(prev => {
      const updateName = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === id) {
            const updatedItem = { ...item, name: newName };
            if (item.type === 'file') {
              updatedItem.language = getFileExtension(newName);
            }
            return updatedItem;
          }
          if (item.children) {
            return { ...item, children: updateName(item.children) };
          }
          return item;
        });
      };
      return updateName(prev);
    });
  }, []);

  return {
    files,
    getFileById,
    createFile,
    createFolder,
    deleteItem,
    updateFileContent,
    renameItem
  };
}