import React, { useState } from 'react';
import { Bot, Zap, AlertTriangle, CheckCircle, X, Lightbulb, Info, Settings } from 'lucide-react';

type IssueType = 'error' | 'warning' | 'suggestion';

interface DebugIssue {
  id: string;
  type: IssueType;
  message: string;
  file: string;
  line?: number;
  fix?: string;
  autoFixable: boolean;
}

interface AIDebuggerProps {
  files: any[];
  onApplyFix: (fileId: string, fix: string) => void;
  onClose: () => void;
  onShowSettings?: () => void;
  config: any;
  isConnected: boolean;
  generateResponse: (prompt: string, systemPrompt?: string) => Promise<any>;
  PROVIDER_CONFIGS: any;
}

/* ----------------------------- helpers (module scope - SINGLE definitions) ----------------------------- */

function getIssueIcon(type: IssueType) {
  switch (type) {
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden />;
    case 'suggestion':
      return <Lightbulb className="w-4 h-4 text-blue-500" aria-hidden />;
    default:
      return <Info className="w-4 h-4" aria-hidden />;
  }
}

function getIssueBadgeClasses(type: IssueType) {
  switch (type) {
    case 'error':
      return 'bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20';
    case 'warning':
      return 'bg-yellow-500/10 text-yellow-700 ring-1 ring-inset ring-yellow-500/20';
    case 'suggestion':
      return 'bg-blue-500/10 text-blue-600 ring-1 ring-inset ring-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 ring-1 ring-inset ring-gray-500/20';
  }
}

/* -------------------------------------------------- component -------------------------------------------------- */

export function AIDebugger({ files, onApplyFix, onClose, onShowSettings, config, isConnected, generateResponse, PROVIDER_CONFIGS }: AIDebuggerProps) {
  const [issues, setIssues] = useState<DebugIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [filter, setFilter] = useState<IssueType | 'all'>('all');

  const analyzeCode = async () => {
    if (!isConnected) {
      alert('Please configure your LLM provider in settings first.');
      return;
    }

    setIsAnalyzing(true);
    setIssues([]);

    try {
      // Get context from current files
      const context = files
        .filter(f => f.type === 'file' && f.content)
        .map(f => `File: ${f.name}\nContent:\n${f.content}`)
        .join('\n\n---\n\n');

      const prompt = `Analyze the following code for potential issues. Look for:
1. Syntax errors
2. Logic errors
3. Performance issues
4. Code quality issues
5. Security vulnerabilities
6. Best practice violations

For each issue found, provide:
- Type (error/warning/suggestion)
- Clear description
- File name and line number if applicable
- Suggested fix
- Whether it's auto-fixable

Format your response as a JSON array with this structure:
[
  {
    "type": "error|warning|suggestion",
    "message": "Description of the issue",
    "file": "filename.ext",
    "line": 123,
    "fix": "Suggested fix or improvement",
    "autoFixable": true/false
  }
]

Code to analyze:
${context}`;

      const response = await generateResponse(prompt);
      
      try {
        // Try to parse the response as JSON
        const parsedIssues = JSON.parse(response.content);
        if (Array.isArray(parsedIssues)) {
          const formattedIssues: DebugIssue[] = parsedIssues.map((issue, index) => ({
            id: (index + 1).toString(),
            type: issue.type || 'suggestion',
            message: issue.message || 'Unknown issue',
            file: issue.file || 'unknown',
            line: issue.line,
            fix: issue.fix || 'No fix suggested',
            autoFixable: issue.autoFixable || false
          }));
          
          setIssues(formattedIssues);
          setSelectedIssue(formattedIssues[0]?.id ?? null);
        } else {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        // If JSON parsing fails, create a generic issue
        const fallbackIssue: DebugIssue = {
          id: '1',
          type: 'suggestion',
          message: 'AI analysis completed but response format was unexpected',
          file: 'analysis',
          fix: response.content,
          autoFixable: false
        };
        setIssues([fallbackIssue]);
        setSelectedIssue('1');
      }
    } catch (error) {
      const errorIssue: DebugIssue = {
        id: '1',
        type: 'error',
        message: `Analysis failed: ${error.message}`,
        file: 'error',
        fix: 'Please check your LLM configuration and try again.',
        autoFixable: false
      };
      setIssues([errorIssue]);
      setSelectedIssue('1');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyFix = (issue: DebugIssue) => {
    if (!issue.fix) return;
    
    // Find the actual file by name
    const targetFile = files.find(f => f.name === issue.file);
    if (targetFile) {
      onApplyFix(targetFile.id, issue.fix);
    } else {
      alert(`File ${issue.file} not found. Please create it first.`);
    }
  };

  const visibleIssues =
    filter === 'all' ? issues : issues.filter((i) => i.type === filter);

  const selected = issues.find((i) => i.id === selectedIssue) || null;

  const getProviderDisplayName = () => {
    return PROVIDER_CONFIGS[config.provider]?.name || 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-[1000px] max-w-[95vw] h-[70vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold tracking-tight">AI Debugger</h2>
            <span className={`ml-2 text-xs px-2 py-1 rounded ${
              isConnected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {getProviderDisplayName()}
            </span>
            {!isConnected && (
              <span className="ml-2 text-xs text-red-500">(Not Connected)</span>
            )}
            <span className="ml-2 text-xs text-neutral-500">
              {issues.length ? `${issues.length} issue(s) found` : 'Idle'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className={`px-2 py-1 rounded-md text-xs ${filter === 'all' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-2 py-1 rounded-md text-xs ${filter === 'error' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                onClick={() => setFilter('error')}
              >
                Errors
              </button>
              <button
                className={`px-2 py-1 rounded-md text-xs ${filter === 'warning' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                onClick={() => setFilter('warning')}
              >
                Warnings
              </button>
              <button
                className={`px-2 py-1 rounded-md text-xs ${filter === 'suggestion' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                onClick={() => setFilter('suggestion')}
              >
                Suggestions
              </button>
            </div>

            {onShowSettings && (
              <button
                onClick={onShowSettings}
                className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="LLM Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={analyzeCode}
              disabled={isAnalyzing || !isConnected}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing…' : 'Analyze'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 h-[calc(70vh-64px)]">
          {/* Left: list */}
          <div className="col-span-5 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
            {isAnalyzing ? (
              <div className="h-full flex items-center justify-center text-neutral-500">
                <div className="w-5 h-5 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin mr-2" />
                <span>Let me scan the project…</span>
              </div>
            ) : !isConnected ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500 p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                <p>LLM not connected</p>
                <p className="text-xs">Configure your AI provider in settings to analyze code</p>
              </div>
            ) : visibleIssues.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <p>No issues found.</p>
                <p className="text-xs">Your code looks good!</p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {visibleIssues.map((issue) => (
                  <li
                    key={issue.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 ${selectedIssue === issue.id ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`}
                    onClick={() => setSelectedIssue(issue.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIssueIcon(issue.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{issue.message}</p>
                          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${getIssueBadgeClasses(issue.type)}`}>
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-1">
                          {issue.file}{issue.line ? `:${issue.line}` : ''}
                        </p>
                        {issue.autoFixable && (
                          <p className="text-[10px] text-emerald-600 mt-1">Auto-fix available</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: details */}
          <div className="col-span-7 overflow-y-auto">
            {selected ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  {getIssueIcon(selected.type)}
                  <h3 className="font-semibold">Details</h3>
                </div>

                <div className="text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-neutral-500">Message</div>
                      <div className="mt-1">{selected.message}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500">Location</div>
                      <div className="mt-1">
                        {selected.file}{selected.line ? `:${selected.line}` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Suggested fix</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {selected.fix ?? 'No automated suggestion provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Bot className="w-4 h-4" />
                    <span>AI generated analysis</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-md text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      onClick={() => setSelectedIssue(null)}
                    >
                      Back to list
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      disabled={!selected.fix}
                      onClick={() => applyFix(selected)}
                    >
                      Apply fix
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                Select an issue to see details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
