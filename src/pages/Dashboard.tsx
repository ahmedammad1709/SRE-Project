import { useState } from "react";
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
    <DashboardLayout userName="John Doe">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your projects and requirements</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dummyProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>

          {/* New Project Tab */}
          <TabsContent value="new-project" className="animate-fade-in">
            {!projectStarted ? (
              <div className="max-w-md mx-auto">
                <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                  <h2 className="text-xl font-semibold mb-6">Start a New Project</h2>
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
              <div className="max-w-3xl mx-auto">
                <ChatInterface projectName={newProjectName} />
              </div>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Project Summaries</h2>
            <div className="space-y-4">
              {dummySummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="p-4 rounded-xl bg-card border border-border shadow-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{summary.projectName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {summary.requirements} requirements • {summary.date}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Summary
                  </Button>
                </div>
              ))}

              {dummySummaries.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No summaries yet. Start a project to generate summaries.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="animate-fade-in">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              
              <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">John Doe</h3>
                    <p className="text-muted-foreground">john.doe@example.com</p>
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settingsName">Full Name</Label>
                    <Input id="settingsName" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settingsEmail">Email</Label>
                    <Input id="settingsEmail" defaultValue="john.doe@example.com" />
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-medium">Change Password</h4>
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
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => toast({ title: "Settings saved", description: "Your changes have been saved" })}>
                    Save Changes
                  </Button>
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
