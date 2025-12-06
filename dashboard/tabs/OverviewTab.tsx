import { FolderKanban, MessageSquare, ClipboardList, FileText } from "lucide-react";
import { StatCard } from "../StatCard";
import { ProjectCard } from "../ProjectCard";

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "active" | "archived" | "draft";
}

interface OverviewTabProps {
  projects: Project[];
}

const stats = [
  {
    title: "Total Projects",
    value: 12,
    icon: FolderKanban,
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Total Chats",
    value: 48,
    icon: MessageSquare,
    trend: { value: 8, isPositive: true },
  },
  {
    title: "Requirements Captured",
    value: 156,
    icon: ClipboardList,
    trend: { value: 23, isPositive: true },
  },
  {
    title: "Summaries Generated",
    value: 34,
    icon: FileText,
    trend: { value: 5, isPositive: false },
  },
];

export function OverviewTab({ projects }: OverviewTabProps) {
  const recentProjects = projects.slice(0, 2);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your projects and requirements
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
