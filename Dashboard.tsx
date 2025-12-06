import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { OverviewTab } from "@/components/dashboard/tabs/OverviewTab";
import { ProjectsTab } from "@/components/dashboard/tabs/ProjectsTab";
import { NewProjectTab } from "@/components/dashboard/tabs/NewProjectTab";
import { SummaryTab } from "@/components/dashboard/tabs/SummaryTab";
import { SettingsTab } from "@/components/dashboard/tabs/SettingsTab";
import { dummyProjects } from "@/data/dummyProjects";
import { useToast } from "@/hooks/use-toast";

type TabValue = "overview" | "projects" | "new-project" | "summary" | "settings";

interface UserData {
  name: string;
  email: string;
}

const DEFAULT_USER: UserData = {
  name: "John Doe",
  email: "john.doe@example.com",
};

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectStarted, setProjectStarted] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [user, setUser] = useState<UserData>(DEFAULT_USER);
  const isAdmin = false;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("app_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {
      void 0;
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSaveProfile = (name: string, email: string) => {
    const userData = { name, email };
    setUser(userData);
    localStorage.setItem("app_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem("app_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    window.location.href = "/";
  };

  const handleNewProject = () => {
    setProjectStarted(false);
    setNewProjectName("");
    setActiveTab("new-project");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab projects={dummyProjects} />;
      case "projects":
        return <ProjectsTab projects={dummyProjects} onNewProject={handleNewProject} />;
      case "new-project":
        return (
          <NewProjectTab
            projectStarted={projectStarted}
            setProjectStarted={setProjectStarted}
            projectName={newProjectName}
            setProjectName={setNewProjectName}
          />
        );
      case "summary":
        return <SummaryTab onNewProject={handleNewProject} />;
      case "settings":
        return (
          <SettingsTab
            userName={user.name}
            userEmail={user.email}
            onSaveProfile={handleSaveProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userName={user.name}
        isAdmin={isAdmin}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="flex w-full pt-16">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 w-full p-8">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
