import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, MoreHorizontal } from "lucide-react";
import type { Media } from "@/lib/api";

interface PhotoGridProps {
  media: Media[];
  onSelectMedia?: (mediaIds: string[]) => void;
  onOpenMedia?: (media: Media) => void;
  selectedIds?: string[];
}

export function PhotoGrid({ media, onSelectMedia, onOpenMedia, selectedIds = [] }: PhotoGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelectAll = () => {
    const allIds = media.map(m => m.id);
    onSelectMedia?.(selectedIds.length === media.length ? [] : allIds);
  };

  const handleSelectMedia = (mediaId: string, selected: boolean) => {
    if (selected) {
      onSelectMedia?.([...selectedIds, mediaId]);
    } else {
      onSelectMedia?.(selectedIds.filter(id => id !== mediaId));
    }
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No media found</h3>
        <p className="text-slate-600 dark:text-slate-400">Upload some photos or videos to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      {onSelectMedia && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">Select:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {selectedIds.length === media.length ? "None" : "All"}
          </Button>
          {selectedIds.length > 0 && (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {selectedIds.length} selected
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {media.map((item) => (
          <Card
            key={item.id}
            className="aspect-square relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onOpenMedia?.(item)}
          >
            <img
              src={item.objectPath}
              alt={item.originalName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
              {/* Selection checkbox */}
              {onSelectMedia && (
                <div
                  className={`absolute top-2 left-2 transition-opacity ${
                    hoveredId === item.id || selectedIds.includes(item.id) ? "opacity-100" : "opacity-0"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectMedia(item.id, checked as boolean)}
                    className="bg-white/80 border-white"
                  />
                </div>
              )}

              {/* Video indicator */}
              {item.type === "video" && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}

              {/* More options */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 bg-white/20 hover:bg-white/40 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle more options
                  }}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Load more placeholder */}
        <Card className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center cursor-pointer hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 transition-colors">
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-xs text-slate-500 dark:text-slate-400">Load More</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
