import { useState } from "react";
import { MessageSquare, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@/contexts/ConversationContext";
import { ChatInterface } from "../ChatInterface";

interface NewProjectTabProps {
  projectStarted: boolean;
  setProjectStarted: (started: boolean) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  projectId: number | null;
  setProjectId: (id: number | null) => void;
  onSummaryReady?: (data: {
    overview?: string;
    functional?: string[];
    nonFunctional?: string[];
    stakeholders?: string[];
    userStories?: string[];
    constraints?: string[];
    risks?: string[];
    timeline?: string;
    costEstimate?: string;
    summary?: string;
  }) => void;
  onGoToSummary?: () => void;
}

export function NewProjectTab({
  projectStarted,
  setProjectStarted,
  projectName,
  setProjectName,
  projectId,
  setProjectId,
  onSummaryReady,
  onGoToSummary,
}: NewProjectTabProps) {
  const { toast } = useToast();
  const { resetConversation, setProjectId: setContextProjectId } = useConversation();
  const [creating, setCreating] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleStartProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      
      // Create project in database
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName.trim(),
          description: `Requirements gathering project: ${projectName}`,
          created_by: (() => {
            try {
              const stored = localStorage.getItem("app_user");
              const parsed = stored ? JSON.parse(stored) : null;
              return parsed?.email ?? null;
            } catch {
              return null;
            }
          })(),
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        const newProjectId = data.data.id;
        setProjectId(newProjectId);
        setContextProjectId(newProjectId);
        resetConversation(); // Reset conversation state for new project
        setProjectStarted(true);
        toast({
          title: `"${projectName}" is ready`,
          description: "Start gathering requirements for your project.",
        });
      } else {
        throw new Error(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({
        title: "Failed to create project",
        description: error instanceof Error ? error.message : "Could not create project.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleBack = () => {
    setProjectStarted(false);
    setProjectName("");
    setProjectId(null);
    setContextProjectId(null);
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

            <Button onClick={handleStartProject} className="w-full" disabled={creating}>
              {creating ? "Creating..." : "Start Chat"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{projectName}</h1>
            <p className="text-sm text-muted-foreground">Requirement gathering session</p>
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={async () => {
            if (!projectId) {
              return toast({
                title: "No project",
                description: "Start a project first to generate summary.",
                variant: "destructive",
              });
            }
            try {
              setGeneratingSummary(true);
              const res = await fetch("/api/generate-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId }),
              });
              const data = await res.json();
              if (!data.success) {
                throw new Error(data.error || "Failed to generate summary");
              }
              onSummaryReady?.(data.data);
              toast({
                title: "Summary generated",
                description: "Redirecting to the Summary tab.",
              });
              onGoToSummary?.();
            } catch (error) {
              toast({
                title: "Failed to generate summary",
                description: error instanceof Error ? error.message : "Could not generate summary.",
                variant: "destructive",
              });
            } finally {
              setGeneratingSummary(false);
            }
          }}
          disabled={generatingSummary}
        >
          <FileText className="h-4 w-4" />
          {generatingSummary ? "Generating…" : "Generate Summary"}
        </Button>
      </div>

      {projectId ? (
        <ChatInterface projectId={projectId} projectName={projectName} />
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Loading chat...</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Preparing the chat interface for your project.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
