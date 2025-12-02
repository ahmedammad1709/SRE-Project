import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, Users, Ban, CheckCircle, Calendar, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const dummyProjects = [
  {
    id: "1",
    name: "E-Commerce Platform",
    owner: "John Doe",
    chats: 12,
    requirements: 24,
    createdAt: "Nov 15, 2024",
    status: "active",
  },
  {
    id: "2",
    name: "Healthcare App",
    owner: "Jane Smith",
    chats: 8,
    requirements: 18,
    createdAt: "Nov 20, 2024",
    status: "active",
  },
  {
    id: "3",
    name: "CRM System",
    owner: "Bob Wilson",
    chats: 15,
    requirements: 32,
    createdAt: "Nov 10, 2024",
    status: "active",
  },
  {
    id: "4",
    name: "Learning Platform",
    owner: "Alice Brown",
    chats: 6,
    requirements: 14,
    createdAt: "Nov 25, 2024",
    status: "archived",
  },
  {
    id: "5",
    name: "Inventory System",
    owner: "Charlie Davis",
    chats: 10,
    requirements: 20,
    createdAt: "Nov 28, 2024",
    status: "active",
  },
];

const dummyUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    projects: 3,
    joinedAt: "Oct 15, 2024",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    projects: 2,
    joinedAt: "Oct 20, 2024",
    status: "active",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    projects: 1,
    joinedAt: "Nov 1, 2024",
    status: "blocked",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    projects: 4,
    joinedAt: "Nov 5, 2024",
    status: "active",
  },
  {
    id: "5",
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    projects: 1,
    joinedAt: "Nov 10, 2024",
    status: "active",
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [users, setUsers] = useState(dummyUsers);

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "blocked" : "active" }
          : user
      )
    );

    const user = users.find((u) => u.id === userId);
    const newStatus = user?.status === "active" ? "blocked" : "unblocked";
    
    toast({
      title: `User ${newStatus}`,
      description: `${user?.name} has been ${newStatus}`,
    });
  };

  return (
    <DashboardLayout userName="Admin" isAdmin>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all projects and users</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="projects" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="animate-fade-in">
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold">All Projects</h2>
                <p className="text-sm text-muted-foreground">{dummyProjects.length} total projects</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-center">Chats</TableHead>
                      <TableHead className="text-center">Requirements</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                              <FolderOpen className="w-4 h-4" />
                            </div>
                            {project.name}
                          </div>
                        </TableCell>
                        <TableCell>{project.owner}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                            {project.chats}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{project.requirements}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {project.createdAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={project.status === "active" ? "default" : "secondary"}
                            className={project.status === "active" ? "bg-success/10 text-success hover:bg-success/20" : ""}
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="animate-fade-in">
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Manage Users</h2>
                <p className="text-sm text-muted-foreground">{users.length} registered users</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Projects</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                              {user.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="text-center">{user.projects}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {user.joinedAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === "active" ? "default" : "destructive"}
                            className={user.status === "active" ? "bg-success/10 text-success hover:bg-success/20" : ""}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={user.status === "active" ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === "active" ? (
                              <>
                                <Ban className="w-4 h-4 mr-1" />
                                Block
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Unblock
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
