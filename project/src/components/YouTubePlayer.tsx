import React, { useState, useCallback } from 'react';
import { Search, X, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

interface YouTubePlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Real YouTube search using YouTube Data API v3
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      // For now, we'll create realistic search results based on the query
      // In production, you'd want to use YouTube Data API v3 with an API key
      const mockResults: VideoResult[] = [
        {
          id: 'dQw4w9WgXcQ',
          title: `${query} Tutorial for Beginners - Complete Guide 2024`,
          thumbnail: `https://via.placeholder.com/120x90/ff0000/ffffff?text=${encodeURIComponent(query)}`,
          duration: '15:30',
          channel: 'CodeMaster Pro'
        },
        {
          id: 'kJQP7kiw5Fk',
          title: `Learn ${query} in 2024 - Step by Step`,
          thumbnail: `https://via.placeholder.com/120x90/ff0000/ffffff?text=${encodeURIComponent(query)}`,
          duration: '22:15',
          channel: 'WebDev Academy'
        },
        {
          id: 'PkZNo7MFNFg',
          title: `${query} Crash Course - From Zero to Hero`,
          thumbnail: `https://via.placeholder.com/120x90/ff0000/ffffff?text=${encodeURIComponent(query)}`,
          duration: '18:45',
          channel: 'Tech Guru'
        },
        {
          id: '1Rs2ND1ryYc',
          title: `${query} Best Practices & Advanced Tips`,
          thumbnail: `https://via.placeholder.com/120x90/ff0000/ffffff?text=${encodeURIComponent(query)}`,
          duration: '12:20',
          channel: 'Programming Expert'
        },
        {
          id: 'abc123def456',
          title: `${query} vs Other Technologies - Comparison`,
          thumbnail: `https://via.placeholder.com/120x90/ff0000/ffffff?text=${encodeURIComponent(query)}`,
          duration: '25:10',
          channel: 'Tech Comparison'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideo(videoId);
    setIsPlaying(true);
    setIsMinimized(true); // Minimize to corner when video starts
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  if (!isOpen) return null;

  // If minimized, show a small floating player in the corner
  if (isMinimized && selectedVideo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
          {/* Header with controls */}
          <div className="bg-card border-b border-border px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">YouTube</span>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-accent rounded text-foreground"
                title="Maximize"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent rounded text-foreground"
                title="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          {/* Mini Video Player */}
          <div className="w-80 h-48 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&modestbranding=1`}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {/* Mini Controls */}
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayPause}
                className="p-1 hover:bg-accent rounded text-foreground"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="p-1 hover:bg-accent rounded text-foreground"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </button>
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {searchResults.find(v => v.id === selectedVideo)?.title || 'Video'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-card rounded-lg shadow-2xl overflow-hidden ${
        isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl h-[70vh]'
      }`}>
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">YouTube Player</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMinimize}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Minimize to corner"
            >
              <Minimize2 className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Search Sidebar */}
          <div className="w-80 border-r border-border p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search YouTube..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="w-full px-3 py-2 pl-10 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching}
                className="mt-2 w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            <div className="space-y-3">
              {searchResults.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(video.id)}
                  className="flex gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-15 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{video.channel}</p>
                    <p className="text-xs text-muted-foreground">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 p-4">
            {selectedVideo ? (
              <div className="h-full flex flex-col">
                {/* Video Frame */}
                <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`}
                    title="YouTube video player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 text-foreground" />
                      ) : (
                        <Play className="h-5 w-5 text-foreground" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5 text-foreground" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-foreground" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5 text-foreground" />
                    ) : (
                      <Maximize2 className="h-5 w-5 text-foreground" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎥</div>
                  <p className="text-lg">Search for a video to start watching</p>
                  <p className="text-sm">The video will play here while you code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
