import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOverviewTab } from "@/components/admin/tabs/AdminOverviewTab";
import { AdminUsersTab } from "@/components/admin/tabs/AdminUsersTab";
import { AdminProjectsTab } from "@/components/admin/tabs/AdminProjectsTab";
import { AdminSettingsTab } from "@/components/admin/tabs/AdminSettingsTab";
import { useToast } from "@/hooks/use-toast";

type AdminTabValue = "overview" | "users" | "projects" | "settings";

interface UserData {
  name: string;
  email: string;
}

const DEFAULT_USER: UserData = {
  name: "Admin",
  email: "admin@example.com",
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTabValue>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData>(DEFAULT_USER);

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
    navigate("/");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverviewTab />;
      case "users":
        return <AdminUsersTab />;
      case "projects":
        return <AdminProjectsTab />;
      case "settings":
        return (
          <AdminSettingsTab
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardHeader
        userName={user.name}
        isAdmin={true}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="flex w-full pt-16">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
