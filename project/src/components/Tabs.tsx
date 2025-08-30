import React from 'react';
import { X, Circle } from 'lucide-react';
import { Tab } from '../App';

interface TabsProps {
  tabs: Tab[];
  activeTab: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabSave: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabClick, onTabClose, onTabSave }: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        onTabSave(tabId);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-codeshui-dark-100 to-codeshui-dark-200 border-b border-codeshui-500/30 flex overflow-x-auto shadow-golden">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 border-r border-codeshui-500/20 cursor-pointer hover:bg-codeshui-500/10 transition-all duration-200 min-w-24 sm:min-w-32 max-w-32 sm:max-w-48 ${
            activeTab === tab.id 
              ? 'bg-gradient-to-r from-codeshui-500/20 to-accent-gold/20 border-b-2 border-codeshui-500 shadow-golden' 
              : 'hover:bg-codeshui-500/5'
          }`}
          onClick={() => onTabClick(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
          tabIndex={0}
        >
          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            {tab.isDirty && (
              <Circle className="w-2 h-2 fill-codeshui-500 text-codeshui-500 animate-golden-pulse" />
            )}
            <span className={`text-xs sm:text-sm truncate ${
              activeTab === tab.id ? 'text-codeshui-500 font-medium' : 'text-codeshui-500/70'
            }`}>
              {tab.name}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="p-1 hover:bg-codeshui-500/20 rounded transition-colors text-codeshui-500 hover:text-codeshui-400"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}