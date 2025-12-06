import { FileX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SummaryTabProps {
  onNewProject: () => void;
}

export function SummaryTab({ onNewProject }: SummaryTabProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] w-full flex items-center justify-center animate-fade-in">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No Summary Available
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Start a new project and gather requirements to generate summaries.
        </p>

        <Button onClick={onNewProject} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Project
        </Button>
      </div>
    </div>
  );
}
