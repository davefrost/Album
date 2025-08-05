import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Users, HardDrive, Code, Activity } from "lucide-react";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const { data: statsData, isLoading: statsLoading } = useQuery<{ stats?: any }>({
    queryKey: ["/api/admin/stats"],
    enabled: open,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{ users?: any[] }>({
    queryKey: ["/api/admin/users"],
    enabled: open,
  });

  const stats = statsData?.stats;
  const users = usersData?.users || [];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Admin Panel</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="dashboard" className="flex-1">
          <div className="flex">
            <div className="w-64 border-r border-slate-200 dark:border-slate-700 p-4">
              <TabsList className="w-full flex-col h-auto bg-transparent">
                <TabsTrigger value="dashboard" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="users" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="content" className="w-full justify-start">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <TabsContent value="dashboard" className="space-y-6">
                {statsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {stats?.totalUsers || 0}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 dark:text-green-400 text-sm font-medium">Storage Used</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                              {formatBytes(stats?.storageUsed || 0)}
                            </p>
                          </div>
                          <HardDrive className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-amber-50 dark:bg-amber-900/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">API Calls</p>
                            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                              {stats?.apiCalls?.toLocaleString() || 0}
                            </p>
                          </div>
                          <Code className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Activity</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-200">System activity monitoring</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Real-time activity will be displayed here</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">User Management</h4>
                  <Button>Add User</Button>
                </div>
                
                {usersLoading ? (
                  <Card className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {users.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{user.username}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === "admin" 
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              }`}>
                                {user.role}
                              </span>
                              <Button variant="outline" size="sm">Edit</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="content">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Content Management</h4>
                    <p className="text-slate-600 dark:text-slate-400">Content management features will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Security Settings</h4>
                    <p className="text-slate-600 dark:text-slate-400">Security management features will be implemented here.</p>
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
