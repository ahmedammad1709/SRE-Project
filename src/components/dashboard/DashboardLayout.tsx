import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, TrendingUp, FolderOpen, Plus, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userName?: string;
  isAdmin?: boolean;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

const DashboardLayout = ({ children, userName = "John Doe", isAdmin = false, activeTab, onNavigateTab }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem("app_user");
    } catch {
      void 0;
    }
    toast({ title: "Logged out", description: "You have been logged out successfully" });
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" aria-label="Open Menu" />
              <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
                <img src="/logo.png" alt="Softwate Requiremnet Bot" className="w-10 h-10 rounded-xl object-contain" />
                <span className="font-semibold text-xl">Softwate Requiremnet Bot</span>
                {isAdmin && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-accent-foreground ml-2">Admin</span>
                )}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="gradient-primary text-primary-foreground text-sm">
                        {userName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="pt-16 flex">
          <Sidebar collapsible="offcanvas" className="border-r sticky top-16 self-start h-[calc(100vh-4rem)]">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "overview"}
                      onClick={() => onNavigateTab?.("overview")}
                      className="transition-all duration-200 hover:shadow-sm hover:bg-sidebar-accent"
                    >
                      <TrendingUp />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "projects"}
                      onClick={() => onNavigateTab?.("projects")}
                      className="transition-all duration-200 hover:shadow-sm hover:bg-sidebar-accent"
                    >
                      <FolderOpen />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "new-project"}
                      onClick={() => onNavigateTab?.("new-project")}
                      className="transition-all duration-200 hover:shadow-sm hover:bg-sidebar-accent"
                    >
                      <Plus />
                      <span>New Project</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "summary"}
                      onClick={() => onNavigateTab?.("summary")}
                      className="transition-all duration-200 hover:shadow-sm hover:bg-sidebar-accent"
                    >
                      <FileText />
                      <span>Summary</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "settings"}
                      onClick={() => onNavigateTab?.("settings")}
                      className="transition-all duration-200 hover:shadow-sm hover:bg-sidebar-accent"
                    >
                      <Settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarInset className="flex-1 w-full p-8">{children}</SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
