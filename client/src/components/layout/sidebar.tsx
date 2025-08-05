import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import {
  Camera,
  FolderOpen,
  Video,
  Search,
  Code,
  Palette,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Leaf,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  onOpenModal: (modal: string) => void;
  onLogout: () => void;
  user?: any;
}

export function Sidebar({ onOpenModal, onLogout, user }: SidebarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Gallery", href: "/", icon: Camera },
    { name: "Albums", href: "/albums", icon: FolderOpen },
    { name: "Videos", href: "/videos", icon: Video },
    { name: "Search", href: "/search", icon: Search },
  ];

  const management = [
    { name: "API", onClick: () => onOpenModal("api"), icon: Code },
    { name: "Themes", onClick: () => onOpenModal("theme"), icon: Palette },
  ];

  if (user?.role === "admin") {
    management.push({ name: "Admin", onClick: () => onOpenModal("admin"), icon: Settings });
  }

  const themeIcons = {
    light: Sun,
    dark: Moon,
    nature: Leaf,
  };

  const ThemeIcon = themeIcons[theme];

  const toggleTheme = () => {
    const themes: Array<"light" | "dark" | "nature"> = ["light", "dark", "nature"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 
          shadow-lg border-r border-slate-200 dark:border-slate-700 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Camera className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">PhotoVault</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Media Manager</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors
                      ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}

            {/* Management Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Management
              </h3>
              {management.map((item) => {
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Account Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Account
              </h3>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* Theme Selector */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="p-1 h-8 w-8"
              >
                <ThemeIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
