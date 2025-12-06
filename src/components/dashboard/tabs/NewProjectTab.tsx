import { useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface NewProjectTabProps {
  projectStarted: boolean;
  setProjectStarted: (started: boolean) => void;
  projectName: string;
  setProjectName: (name: string) => void;
}

export function NewProjectTab({
  projectStarted,
  setProjectStarted,
  projectName,
  setProjectName,
}: NewProjectTabProps) {
  const { toast } = useToast();

  const handleStartProject = () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    setProjectStarted(true);
    toast({
      title: `"${projectName}" is ready`,
      description: "Start gathering requirements for your project.",
    });
  };

  const handleBack = () => {
    setProjectStarted(false);
    setProjectName("");
  };

  if (!projectStarted) {
    return (
      <div className="min-h-[calc(100vh-8rem)] w-full flex items-center justify-center animate-fade-in">
        <div className="centered-card text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Start a New Project
          </h2>

          <div className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartProject()}
              />
            </div>

            <Button onClick={handleStartProject} className="w-full">
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{projectName}</h1>
          <p className="text-sm text-muted-foreground">Requirement gathering session</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Chat Interface</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This is where the chat interface for gathering requirements would be displayed.
          </p>
        </div>
      </div>
    </div>
  );
}
