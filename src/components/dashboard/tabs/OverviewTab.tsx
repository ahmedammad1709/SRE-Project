import { useState, useEffect } from "react";
import { FolderKanban, MessageSquare } from "lucide-react";
import { StatCard } from "../StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface OverviewTabProps {
  userEmail: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  summary?: string;
  created_by?: string;
  created_at: string;
}

export function OverviewTab({ userEmail }: OverviewTabProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [userEmail]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      } else {
        throw new Error(data.error || "Failed to load projects");
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalProjects = projects.length;
  const totalChats = totalProjects; // Same as total projects
  const latestProject = projects.length > 0 ? projects[0] : null; // Already sorted by created_at DESC

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: FolderKanban,
      trend: { value: totalProjects, isPositive: true },
    },
    {
      title: "Total Chats",
      value: totalChats,
      icon: MessageSquare,
      trend: { value: totalChats, isPositive: true },
    },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your projects and requirements
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Project</h2>
        {latestProject ? (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{latestProject.name}</CardTitle>
              <CardDescription>
                {latestProject.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Created: {new Date(latestProject.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
