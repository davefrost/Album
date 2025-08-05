import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PhotoGrid } from "@/components/ui/photo-grid";
import { AlbumCard } from "@/components/ui/album-card";
import { mediaApi, albumApi } from "@/lib/api";
import { Grid, List, Plus } from "lucide-react";

export default function Gallery() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("createdAt");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const { data: mediaData, isLoading: mediaLoading } = useQuery<{ media?: any[] }>({
    queryKey: ["/api/media"],
  });

  const { data: albumsData, isLoading: albumsLoading } = useQuery<{ albums?: any[] }>({
    queryKey: ["/api/albums"],
  });

  const media = mediaData?.media || [];
  const albums = albumsData?.albums || [];
  const recentAlbums = albums.slice(0, 4);

  const handleSelectAll = () => {
    const allIds = media.map((m: any) => m.id);
    setSelectedMediaIds(selectedMediaIds.length === media.length ? [] : allIds);
  };

  const handleSelectNone = () => {
    setSelectedMediaIds([]);
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Gallery Header */}
      <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">All Photos</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {media.length} photos • {albums.length} albums
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3 py-1"
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3 py-1"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Added</SelectItem>
                <SelectItem value="originalName">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm text-slate-600 dark:text-slate-400">Filters:</span>
          <Badge variant="secondary">Recent</Badge>
          <Badge variant="secondary">Photos</Badge>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Filter
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Recent Albums Section */}
        {!albumsLoading && recentAlbums.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Recent Albums</h3>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentAlbums.map((album: any) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  photoCount={media.filter((m: any) => m.albumId === album.id).length}
                  onClick={() => {
                    // Navigate to album view
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Recent Photos</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Select:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                All
              </Button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectNone}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                None
              </Button>
            </div>
          </div>

          {mediaLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <PhotoGrid
              media={media}
              selectedIds={selectedMediaIds}
              onSelectMedia={setSelectedMediaIds}
              onOpenMedia={(media) => {
                // Open media in lightbox
                console.log("Open media:", media);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
