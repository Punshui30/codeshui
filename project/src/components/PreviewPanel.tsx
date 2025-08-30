import React from 'react';
import { Eye } from 'lucide-react';
import { HeroSection } from './ui/hero-section';

export function PreviewPanel() {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-zinc-50/80 backdrop-blur-sm px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-zinc-600" />
          <span className="text-sm font-medium text-zinc-700">Static Preview</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1">
        <HeroSection />
      </div>
    </div>
  );
}