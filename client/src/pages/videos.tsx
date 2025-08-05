import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { VideoThumbnail } from "@/components/ui/video-thumbnail";
import { mediaApi } from "@/lib/api";
import { Video } from "lucide-react";

export default function Videos() {
  const { data: mediaData, isLoading } = useQuery<{ media?: any[] }>({
    queryKey: ["/api/media"],
  });

  const videos = (mediaData?.media || []).filter((m: any) => m.type === "video");

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Videos</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {videos.length} videos
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video: any) => (
              <VideoThumbnail
                key={video.id}
                video={video}
                onClick={() => {
                  // Open video in player
                  console.log("Open video:", video);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No videos yet</h3>
            <p className="text-slate-600 dark:text-slate-400">Upload some videos to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
