import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi, albumApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("no-album");
  const [tags, setTags] = useState("");
  const [autoResize, setAutoResize] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: albumsData } = useQuery<{ albums?: any[] }>({
    queryKey: ["/api/albums"],
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: mediaApi.createMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedAlbumId("no-album");
    setTags("");
    setAutoResize(true);
    setIsPublic(false);
  };

  const handleGetUploadParameters = async () => {
    const response = await mediaApi.getUploadUrl();
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const uploadURL = (file as any).uploadURL;
      
      if (uploadURL) {
        const tagsArray = tags
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);

        uploadMutation.mutate({
          filename: file.name,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size || 0,
          objectPath: uploadURL,
          type: file.type?.startsWith("video/") ? "video" : "photo",
          albumId: selectedAlbumId === "no-album" ? undefined : selectedAlbumId,
          tags: tagsArray,
          isPublic,
          metadata: {
            autoResized: autoResize,
          },
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <ObjectUploader
              maxNumberOfFiles={10}
              maxFileSize={100 * 1024 * 1024} // 100MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full"
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                    Drop files here or click to browse
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Supports JPEG, PNG, GIF, WebP, MP4, WebM, AVI files up to 100MB
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Select Files
                  </Button>
                </div>
              </div>
            </ObjectUploader>
          </div>
          
          {/* Upload Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="album">Album (optional)</Label>
                <Select value={selectedAlbumId} onValueChange={setSelectedAlbumId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an album" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-album">No album</SelectItem>
                    {albumsData?.albums?.map((album: any) => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="nature, landscape, summer"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoResize"
                  checked={autoResize}
                  onCheckedChange={(checked) => setAutoResize(checked as boolean)}
                />
                <Label htmlFor="autoResize" className="text-sm">
                  Auto-resize large images
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make publicly accessible
                </Label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
