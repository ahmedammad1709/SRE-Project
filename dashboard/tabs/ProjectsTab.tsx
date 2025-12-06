import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "../ProjectCard";

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "active" | "archived" | "draft";
}

interface ProjectsTabProps {
  projects: Project[];
  onNewProject: () => void;
}

export function ProjectsTab({ projects, onNewProject }: ProjectsTabProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Projects</h1>
          <p className="mt-1 text-muted-foreground">
            {projects.length} projects total
          </p>
        </div>
        <Button onClick={onNewProject} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
