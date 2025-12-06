import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabValue = "overview" | "projects" | "new-project" | "summary" | "settings";

interface DashboardSidebarProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "projects" as const, label: "Projects", icon: FolderKanban },
  { id: "new-project" as const, label: "New Project", icon: PlusCircle },
  { id: "summary" as const, label: "Summary", icon: FileText },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export function DashboardSidebar({ activeTab, onTabChange, isOpen, onClose }: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border",
          "transform transition-transform duration-200 ease-in-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-semibold text-foreground">Navigation</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={cn(
                "sidebar-item w-full",
                activeTab === item.id && "sidebar-item-active"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
