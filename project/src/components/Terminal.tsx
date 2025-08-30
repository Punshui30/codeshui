import React, { useState, useRef, useEffect } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  onClose: () => void;
}

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export function Terminal({ onClose }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to CodeShui Terminal',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (content: string, type: 'command' | 'output' | 'error' = 'output') => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeCommand = (command: string) => {
    addLine(`$ ${command}`, 'command');
    
    // Add to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Mock command execution
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case 'help':
        addLine('Available commands:', 'output');
        addLine('  help     - Show this help message', 'output');
        addLine('  clear    - Clear terminal', 'output');
        addLine('  ls       - List files', 'output');
        addLine('  pwd      - Print working directory', 'output');
        addLine('  date     - Show current date', 'output');
        break;
      
      case 'clear':
        setLines([]);
        break;
      
      case 'ls':
        addLine('index.html  style.css  script.js', 'output');
        break;
      
      case 'pwd':
        addLine('/home/project', 'output');
        break;
      
      case 'date':
        addLine(new Date().toString(), 'output');
        break;
      
      case '':
        break;
      
      default:
        addLine(`Command not found: ${command}`, 'error');
        addLine('Type "help" for available commands', 'output');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-white font-medium">Terminal</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {lines.map(line => (
          <div 
            key={line.id} 
            className={`${
              line.type === 'command' ? 'text-blue-400' : 
              line.type === 'error' ? 'text-red-400' : 
              'text-green-400'
            }`}
          >
            {line.content}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400"
            placeholder="Enter command..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}