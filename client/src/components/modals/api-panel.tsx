import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiKeyApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, Key, Book, BarChart3, Globe } from "lucide-react";

interface ApiPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiPanel({ open, onOpenChange }: ApiPanelProps) {
  const [newKeyName, setNewKeyName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeysData, isLoading } = useQuery<{ apiKeys?: any[] }>({
    queryKey: ["/api/api-keys"],
    enabled: open,
  });

  const createKeyMutation = useMutation({
    mutationFn: apiKeyApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setNewKeyName("");
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: apiKeyApi.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    createKeyMutation.mutate({
      name: newKeyName,
      permissions: ["read", "write"],
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const apiKeys = apiKeysData?.apiKeys || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>API Documentation & Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="keys" className="flex-1">
          <div className="flex">
            <div className="w-64 border-r border-slate-200 dark:border-slate-700 p-4">
              <TabsList className="w-full flex-col h-auto bg-transparent">
                <TabsTrigger value="keys" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="docs" className="w-full justify-start">
                  <Book className="h-4 w-4 mr-2" />
                  Documentation
                </TabsTrigger>
                <TabsTrigger value="usage" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Usage Stats
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Webhooks
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <TabsContent value="keys" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">API Keys</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Key name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-48"
                    />
                    <Button
                      onClick={handleCreateKey}
                      disabled={createKeyMutation.isPending}
                    >
                      Generate New Key
                    </Button>
                  </div>
                </div>
                
                {isLoading ? (
                  <Card className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey: any) => (
                      <Card key={apiKey.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {apiKey.name}
                                </span>
                                <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                                  {apiKey.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <code className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded font-mono">
                                {apiKey.key}
                              </code>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                                Created: {new Date(apiKey.createdAt).toLocaleDateString()} • 
                                Last used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Never"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => deleteKeyMutation.mutate(apiKey.id)}
                                disabled={deleteKeyMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {apiKeys.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Key className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                            No API keys yet
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Create your first API key to start integrating with PhotoVault
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="docs" className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Quick Start</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Upload Photo</h5>
                      <div className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
                        <div className="text-green-400 inline">POST</div>{" "}
                        <div className="text-blue-400 inline">/api/v1/photos</div>
                        <pre className="text-slate-300 mt-2 text-xs">{`curl -X POST https://api.photovault.com/v1/photos \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@photo.jpg" \\
  -F "album_id=123"`}</pre>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Get Albums</h5>
                      <div className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
                        <div className="text-blue-400 inline">GET</div>{" "}
                        <div className="text-blue-400 inline">/api/v1/albums</div>
                        <pre className="text-slate-300 mt-2 text-xs">{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.photovault.com/v1/albums`}</pre>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Search Media</h5>
                      <div className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
                        <div className="text-blue-400 inline">GET</div>{" "}
                        <div className="text-blue-400 inline">/api/v1/media/search</div>
                        <pre className="text-slate-300 mt-2 text-xs">{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://api.photovault.com/v1/media/search?q=nature"`}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="usage">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">API Usage Statistics</h4>
                    <p className="text-slate-600 dark:text-slate-400">Usage analytics will be displayed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="webhooks">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Webhook Configuration</h4>
                    <p className="text-slate-600 dark:text-slate-400">Webhook management features will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
