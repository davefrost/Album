import { Card } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import type { Album } from "@/lib/api";

interface AlbumCardProps {
  album: Album;
  photoCount?: number;
  coverImage?: string;
  onClick?: () => void;
}

export function AlbumCard({ album, photoCount = 0, coverImage, onClick }: AlbumCardProps) {
  return (
    <Card
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={`${album.name} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
            <FolderOpen className="h-12 w-12 text-slate-400 dark:text-slate-500" />
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 text-white">
          <h4 className="font-medium text-sm line-clamp-1">{album.name}</h4>
          <p className="text-xs opacity-90">
            {photoCount} {photoCount === 1 ? "photo" : "photos"}
          </p>
        </div>

        {album.isPublic && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Public
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
