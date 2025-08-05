import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlbumCard } from "@/components/ui/album-card";
import { albumApi, mediaApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, FolderPlus } from "lucide-react";

export default function Albums() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: albumsData, isLoading: albumsLoading } = useQuery<{ albums?: any[] }>({
    queryKey: ["/api/albums"],
  });

  const { data: mediaData } = useQuery<{ media?: any[] }>({
    queryKey: ["/api/media"],
  });

  const createAlbumMutation = useMutation({
    mutationFn: albumApi.createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Album created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create album",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAlbumName("");
    setAlbumDescription("");
    setIsPublic(false);
  };

  const handleCreateAlbum = () => {
    if (!albumName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an album name",
        variant: "destructive",
      });
      return;
    }

    createAlbumMutation.mutate({
      name: albumName,
      description: albumDescription || undefined,
      isPublic,
    });
  };

  const albums = albumsData?.albums || [];
  const media = mediaData?.media || [];

  const getAlbumPhotoCount = (albumId: string) => {
    return media.filter((m: any) => m.albumId === albumId).length;
  };

  const getAlbumCover = (albumId: string) => {
    const albumMedia = media.filter((m: any) => m.albumId === albumId);
    return albumMedia.length > 0 ? albumMedia[0].objectPath : undefined;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Albums</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {albums.length} albums
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="albumName">Album Name</Label>
                  <Input
                    id="albumName"
                    placeholder="Enter album name"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="albumDescription">Description (optional)</Label>
                  <Textarea
                    id="albumDescription"
                    placeholder="Enter album description"
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                  />
                  <Label htmlFor="isPublic" className="text-sm">
                    Make this album public
                  </Label>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAlbum}
                    disabled={createAlbumMutation.isPending}
                  >
                    Create Album
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-6 py-6">
        {albumsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {albums.map((album: any) => (
              <AlbumCard
                key={album.id}
                album={album}
                photoCount={getAlbumPhotoCount(album.id)}
                coverImage={getAlbumCover(album.id)}
                onClick={() => {
                  // Navigate to album detail view
                  console.log("Open album:", album);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FolderPlus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No albums yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Create your first album to organize your photos</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Album
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
