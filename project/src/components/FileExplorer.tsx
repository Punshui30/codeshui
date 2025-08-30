import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { FileItem } from '../App';

interface FileExplorerProps {
  files: FileItem[];
  onOpenFile: (file: FileItem) => void;
  onCreateFile: (name: string, parentId?: string) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
}

interface FileTreeItemProps {
  item: FileItem;
  level: number;
  onOpenFile: (file: FileItem) => void;
  onCreateFile: (name: string, parentId?: string) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
}

function FileTreeItem({ 
  item, 
  level, 
  onOpenFile, 
  onCreateFile, 
  onCreateFolder, 
  onDeleteItem,
  onRenameItem 
}: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const handleRename = () => {
    if (newName.trim() && newName !== item.name) {
      onRenameItem(item.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(item.name);
      setIsRenaming(false);
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-700 rounded cursor-pointer group relative`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
        }}
      >
        {item.type === 'folder' && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 flex items-center justify-center"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        
        {item.type === 'file' && <div className="w-4" />}
        
        <div className="w-4 h-4 flex items-center justify-center">
          {item.type === 'folder' ? (
            isExpanded ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />
          ) : (
            <File className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {isRenaming ? (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-gray-600 text-white px-2 py-1 rounded text-sm"
            autoFocus
          />
        ) : (
          <span 
            className="flex-1 text-sm truncate"
            onClick={() => item.type === 'file' && onOpenFile(item)}
          >
            {item.name}
          </span>
        )}

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-opacity"
        >
          <MoreHorizontal className="w-3 h-3" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 min-w-32">
            {item.type === 'folder' && (
              <>
                <button
                  onClick={() => {
                    const name = prompt('File name:');
                    if (name) onCreateFile(name, item.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  New File
                </button>
                <button
                  onClick={() => {
                    const name = prompt('Folder name:');
                    if (name) onCreateFolder(name, item.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2"
                >
                  <Folder className="w-3 h-3" />
                  New Folder
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsRenaming(true);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2"
            >
              <Edit className="w-3 h-3" />
              Rename
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${item.name}?`)) {
                  onDeleteItem(item.id);
                }
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-600 text-red-400 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map(child => (
            <FileTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onOpenFile={onOpenFile}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDeleteItem={onDeleteItem}
              onRenameItem={onRenameItem}
            />
          ))}
        </div>
      )}

      {showMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

export function FileExplorer({ 
  files, 
  onOpenFile, 
  onCreateFile, 
  onCreateFolder, 
  onDeleteItem,
  onRenameItem 
}: FileExplorerProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {
            const name = prompt('File name:');
            if (name) onCreateFile(name);
          }}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-all duration-200 text-white shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus className="w-3 h-3" />
          File
        </button>
        <button
          onClick={() => {
            const name = prompt('Folder name:');
            if (name) onCreateFolder(name);
          }}
          className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-all duration-200 text-white shadow-md hover:shadow-lg"
        >
          <Plus className="w-3 h-3" />
          Folder
        </button>
      </div>

      <div className="space-y-1">
        {files.map(item => (
          <FileTreeItem
            key={item.id}
            item={item}
            level={0}
            onOpenFile={onOpenFile}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDeleteItem={onDeleteItem}
            onRenameItem={onRenameItem}
          />
        ))}
      </div>
    </div>
  );
}