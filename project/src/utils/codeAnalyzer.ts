export interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
  column?: number;
  severity: 'high' | 'medium' | 'low';
  category: 'syntax' | 'logic' | 'performance' | 'security' | 'style';
}

export class CodeAnalyzer {
  static analyzeHTML(content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for missing DOCTYPE
      if (index === 0 && !line.toLowerCase().includes('<!doctype')) {
        issues.push({
          type: 'warning',
          message: 'Missing DOCTYPE declaration',
          line: index + 1,
          severity: 'medium',
          category: 'syntax'
        });
      }

      // Check for missing alt attributes on images
      if (line.includes('<img') && !line.includes('alt=')) {
        issues.push({
          type: 'warning',
          message: 'Image missing alt attribute for accessibility',
          line: index + 1,
          severity: 'medium',
          category: 'style'
        });
      }

      // Check for inline styles
      if (line.includes('style=')) {
        issues.push({
          type: 'suggestion',
          message: 'Consider moving inline styles to CSS file',
          line: index + 1,
          severity: 'low',
          category: 'style'
        });
      }
    });

    return issues;
  }

  static analyzeCSS(content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for !important usage
      if (line.includes('!important')) {
        issues.push({
          type: 'warning',
          message: 'Avoid using !important, consider specificity instead',
          line: index + 1,
          severity: 'medium',
          category: 'style'
        });
      }

      // Check for missing semicolons
      if (line.trim().includes(':') && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        issues.push({
          type: 'error',
          message: 'Missing semicolon',
          line: index + 1,
          severity: 'high',
          category: 'syntax'
        });
      }
    });

    return issues;
  }

  static analyzeJavaScript(content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for console.log statements
      if (line.includes('console.log')) {
        issues.push({
          type: 'suggestion',
          message: 'Remove console.log statements in production',
          line: index + 1,
          severity: 'low',
          category: 'style'
        });
      }

      // Check for var usage
      if (line.includes('var ')) {
        issues.push({
          type: 'suggestion',
          message: 'Use let or const instead of var',
          line: index + 1,
          severity: 'medium',
          category: 'style'
        });
      }

      // Check for == usage
      if (line.includes('==') && !line.includes('===')) {
        issues.push({
          type: 'warning',
          message: 'Use strict equality (===) instead of loose equality (==)',
          line: index + 1,
          severity: 'medium',
          category: 'logic'
        });
      }
    });

    return issues;
  }

  static analyzeFile(fileName: string, content: string): CodeIssue[] {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'html':
        return this.analyzeHTML(content);
      case 'css':
        return this.analyzeCSS(content);
      case 'js':
      case 'jsx':
        return this.analyzeJavaScript(content);
      default:
        return [];
    }
  }
}