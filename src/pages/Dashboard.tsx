import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ChatInterface from "@/components/dashboard/ChatInterface";
import { FolderOpen, MessageSquare, FileText, TrendingUp, Plus, Settings, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const dummyProjects = [
  {
    id: "1",
    name: "E-Commerce Platform",
    description: "Requirements for a modern e-commerce platform with inventory management",
    chats: 12,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "Healthcare App",
    description: "Mobile app for patient appointment scheduling and health tracking",
    chats: 8,
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    name: "CRM System",
    description: "Customer relationship management system for sales teams",
    chats: 15,
    lastUpdated: "3 days ago",
  },
  {
    id: "4",
    name: "Learning Platform",
    description: "Online learning platform with course management and progress tracking",
    chats: 6,
    lastUpdated: "1 week ago",
  },
];

const dummySummaries = [
  {
    id: "1",
    projectName: "E-Commerce Platform",
    date: "Dec 1, 2024",
    requirements: 24,
  },
  {
    id: "2",
    projectName: "Healthcare App",
    date: "Nov 28, 2024",
    requirements: 18,
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [newProjectName, setNewProjectName] = useState("");
  const [projectStarted, setProjectStarted] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john.doe@example.com");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("app_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setUserName(u.name);
        if (u?.email) setUserEmail(u.email);
      }
    } catch { void 0; }
  }, []);

  const handleStartProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a project name to continue",
        variant: "destructive",
      });
      return;
    }
    setProjectStarted(true);
    toast({
      title: "Project started!",
      description: `"${newProjectName}" is ready for requirements gathering`,
    });
  };

  return (
    <DashboardLayout userName={userName} activeTab={activeTab} onNavigateTab={setActiveTab}>
      <div className={`w-full py-8 ${activeTab !== "new-project" ? "px-6" : ""}`}>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl hidden">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="new-project" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </TabsTrigger>
            <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your projects and requirements</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Projects"
                value={4}
                icon={FolderOpen}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Total Chats"
                value={41}
                icon={MessageSquare}
                trend={{ value: 8, isPositive: true }}
              />
              <StatCard
                title="Requirements Captured"
                value={156}
                icon={FileText}
                trend={{ value: 23, isPositive: true }}
              />
              <StatCard
                title="Summaries Generated"
                value={12}
                icon={TrendingUp}
                subtitle="This month"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dummyProjects.slice(0, 2).map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">All Projects</h2>
              <Button onClick={() => setActiveTab("new-project")}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {dummyProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>

          {/* New Project Tab */}
          <TabsContent value="new-project" className="animate-fade-in w-full flex justify-center">
            {!projectStarted ? (
              <div className="min-h-[calc(100vh-8rem)] w-full flex items-center justify-center px-4">
                <div className="bg-card rounded-xl border border-border p-8 shadow-card w-full max-w-[550px]">
                  <h2 className="text-xl font-semibold mb-6 text-center">
                    Start a New Project
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        placeholder="Enter project name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleStartProject} className="w-full">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <ChatInterface projectName={newProjectName} />
              </div>
            )}
          </TabsContent>


          {/* Summary Tab */}
          <TabsContent value="summary" className="animate-fade-in">
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
              <div className="text-center space-y-3">
                <FileText className="w-12 h-12 mx-auto opacity-50" />
                <h2 className="text-2xl font-semibold">No Summary Available</h2>
                <p className="text-muted-foreground">You can only generate summary by creating a new project.</p>
                <Button onClick={() => setActiveTab("new-project")}>Create New Project</Button>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="animate-fade-in">
            <div className="min-h-[calc(100vh-8rem)] flex items-center w-full">
              <div className="w-full space-y-6 max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-center">Account Settings</h2>

                <div className="space-y-6">
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4 w-full">
                    <h3 className="font-semibold text-lg">Profile</h3>
                    <div className="space-y-2">
                      <Label htmlFor="settingsName">Full Name</Label>
                      <Input id="settingsName" defaultValue={userName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settingsEmail">Email</Label>
                      <Input id="settingsEmail" defaultValue={userEmail} />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => {
                          try {
                            const nameInput = document.getElementById("settingsName") as HTMLInputElement | null;
                            const emailInput = document.getElementById("settingsEmail") as HTMLInputElement | null;
                            const name = nameInput?.value || userName;
                            const email = emailInput?.value || userEmail;
                            const data = { name, email };
                            localStorage.setItem("app_user", JSON.stringify(data));
                            setUserName(name);
                            setUserEmail(email);
                            toast({ title: "Profile updated", description: "Your profile has been saved" });
                          } catch {
                            toast({ title: "Failed to save", description: "Unable to update profile", variant: "destructive" });
                          }
                        }}
                      >
                        Save Profile
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4 w-full">
                    <h3 className="font-semibold text-lg">Change Password</h3>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" placeholder="Enter current password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <Input id="confirmNewPassword" type="password" placeholder="Confirm new password" />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={() => toast({ title: "Password updated", description: "Your password has been changed" })}>Update Password</Button>
                    </div>
                  </div>

                  <div className="bg-destructive/10 border border-destructive rounded-xl p-6 shadow-card w-full">
                    <h3 className="font-semibold text-lg text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">Deleting your account is permanent and cannot be undone.</p>
                    <div className="flex justify-end">
                      <Button variant="destructive" onClick={() => toast({ title: "Account deletion requested", description: "This would delete the account in a real app" })}>Delete Account</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
