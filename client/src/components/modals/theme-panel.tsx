import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";

interface ThemePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemePanel({ open, onOpenChange }: ThemePanelProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "light",
      name: "Default",
      description: "Clean and modern",
      colors: ["bg-blue-500", "bg-slate-100", "bg-slate-800"],
    },
    {
      id: "nature",
      name: "Nature",
      description: "Earthy and calming",
      colors: ["bg-emerald-500", "bg-slate-100", "bg-slate-800"],
    },
    {
      id: "dark",
      name: "Dark",
      description: "Professional and sleek",
      colors: ["bg-slate-800", "bg-slate-600", "bg-blue-400"],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Theme Customization</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Color Schemes</h4>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((themeOption) => (
                <Card
                  key={themeOption.id}
                  className={`cursor-pointer transition-colors ${
                    theme === themeOption.id
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
                  }`}
                  onClick={() => setTheme(themeOption.id as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-2 mb-3">
                      {themeOption.colors.map((color, index) => (
                        <div key={index} className={`w-6 h-6 ${color} rounded-full`}></div>
                      ))}
                    </div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{themeOption.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{themeOption.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Layout Options</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Grid Density</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Adjust photo grid spacing</p>
                </div>
                <Select defaultValue="comfortable">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Sidebar Position</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Choose sidebar location</p>
                </div>
                <Select defaultValue="left">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={() => setTheme("light")}
            >
              Reset to Default
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
