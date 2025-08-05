import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Upload, Search } from "lucide-react";

interface TopbarProps {
  onOpenModal: (modal: string) => void;
  onSearch: (query: string) => void;
  user?: any;
}

export function Topbar({ onOpenModal, onSearch, user }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <form onSubmit={handleSearch} className="relative max-w-md w-full">
            <Input
              type="search"
              placeholder="Search photos, albums, videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => onOpenModal("upload")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenModal("notifications")}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-white text-sm font-medium">
              {user?.username?.substring(0, 2)?.toUpperCase() || "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
