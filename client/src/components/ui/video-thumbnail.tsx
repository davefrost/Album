import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, Volume2, VolumeX } from "lucide-react";
import type { Media } from "@/lib/api";

interface VideoThumbnailProps {
  video: Media;
  onClick?: () => void;
  autoPlay?: boolean;
}

export function VideoThumbnail({ video, onClick, autoPlay = false }: VideoThumbnailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const duration = video.metadata?.duration || 0;

  return (
    <Card
      className="aspect-video relative bg-slate-900 rounded-lg overflow-hidden group cursor-pointer"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={onClick}
    >
      {isPlaying ? (
        <video
          src={video.objectPath}
          className="w-full h-full object-cover"
          autoPlay={autoPlay}
          muted={isMuted}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <>
          {video.thumbnailPath ? (
            <img
              src={video.thumbnailPath}
              alt={video.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Play className="h-12 w-12 text-white/60" />
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        </>
      )}

      {/* Duration badge */}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {formatDuration(duration)}
      </div>

      {/* Video controls */}
      {showControls && isPlaying && (
        <div className="absolute bottom-2 left-2 flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Video info */}
      <div className="absolute top-2 left-2">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">VIDEO</span>
        </div>
      </div>
    </Card>
  );
}
