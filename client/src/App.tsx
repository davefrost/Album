import { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { UploadModal } from "@/components/modals/upload-modal";
import { AdminPanel } from "@/components/modals/admin-panel";
import { ApiPanel } from "@/components/modals/api-panel";
import { ThemePanel } from "@/components/modals/theme-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi, mediaApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Gallery from "@/pages/gallery";
import Albums from "@/pages/albums";
import Videos from "@/pages/videos";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { Camera } from "lucide-react";

interface LoginFormProps {
  onLogin: (user: any) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      onLogin(data.user);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <Camera className="text-white h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">PhotoVault</CardTitle>
          <p className="text-slate-600 dark:text-slate-400">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loginMutation.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loginMutation.isPending}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Default credentials: admin / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuthenticatedApp({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleOpenModal = (modal: string) => {
    setActiveModal(modal);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log("Search:", query);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar
        onOpenModal={handleOpenModal}
        onLogout={onLogout}
        user={user}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onOpenModal={handleOpenModal}
          onSearch={handleSearch}
          user={user}
        />
        
        <Switch>
          <Route path="/" component={Gallery} />
          <Route path="/albums" component={Albums} />
          <Route path="/videos" component={Videos} />
          <Route path="/search">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Search</h2>
                <p className="text-slate-600 dark:text-slate-400">Search functionality will be implemented here</p>
              </div>
            </div>
          </Route>
          {user?.role === "admin" && <Route path="/admin" component={Admin} />}
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Modals */}
      <UploadModal
        open={activeModal === "upload"}
        onOpenChange={(open) => !open && handleCloseModal()}
      />
      
      <AdminPanel
        open={activeModal === "admin"}
        onOpenChange={(open) => !open && handleCloseModal()}
      />
      
      <ApiPanel
        open={activeModal === "api"}
        onOpenChange={(open) => !open && handleCloseModal()}
      />
      
      <ThemePanel
        open={activeModal === "theme"}
        onOpenChange={(open) => !open && handleCloseModal()}
      />
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated
  const { data: userData, isLoading: authLoading } = useQuery<{ user?: any }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!authLoading) {
      if (userData?.user) {
        setUser(userData.user);
      }
      setIsLoading(false);
    }
  }, [userData, authLoading]);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      queryClient.clear();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 animate-pulse">
            <Camera className="text-white h-6 w-6" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="photovault-theme">
        <TooltipProvider>
          <Toaster />
          {user ? (
            <AuthenticatedApp user={user} onLogout={handleLogout} />
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
