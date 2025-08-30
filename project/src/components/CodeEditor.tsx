import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '../App';

interface CodeEditorProps {
  file: Tab;
  onChange: (content: string) => void;
}

export function CodeEditor({ file, onChange }: CodeEditorProps) {
  const [content, setContent] = useState(file.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(file.content);
  }, [file.content]);

  const handleChange = (value: string) => {
    setContent(value);
    onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      
      setContent(newValue);
      onChange(newValue);
      
      // Set cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getLanguageClass = (language: string) => {
    const languageMap: { [key: string]: string } = {
      html: 'language-html',
      css: 'language-css',
      javascript: 'language-javascript',
      typescript: 'language-typescript',
      json: 'language-json',
      markdown: 'language-markdown'
    };
    return languageMap[language] || 'language-text';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-codeshui-dark-100 to-codeshui-dark-200 px-4 py-2 border-b border-codeshui-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-codeshui-500">{file.name}</span>
            {file.isDirty && (
              <span className="w-2 h-2 bg-codeshui-500 rounded-full animate-golden-pulse"></span>
            )}
          </div>
          <span className="text-xs text-codeshui-500/70 uppercase font-medium">{file.language}</span>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full h-full bg-gradient-to-br from-codeshui-dark-50 to-codeshui-dark-100 text-white font-mono text-sm leading-6 resize-none border-none outline-none p-4 ${getLanguageClass(file.language)} focus:ring-2 focus:ring-codeshui-500/50`}
          spellCheck={false}
          placeholder={`Start writing ${file.language} code...`}
        />
        
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bg-gradient-to-r from-codeshui-dark-100 to-codeshui-dark-200 text-codeshui-500/50 text-sm font-mono leading-6 p-4 pt-4 select-none pointer-events-none border-r border-codeshui-500/20">
          {content.split('\n').map((_, index) => (
            <div key={index} className="text-right pr-2 min-w-8">
              {index + 1}
            </div>
          ))}
        </div>
        
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-codeshui-dark-100 to-codeshui-dark-200 pointer-events-none border-r border-codeshui-500/20"
          style={{ width: `${Math.max(content.split('\n').length.toString().length * 8 + 32, 48)}px` }}
        />
      </div>
    </div>
  );
}