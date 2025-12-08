import { useState, useEffect } from "react";
import { FileX, Plus, Download, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SummaryTabProps {
  onNewProject: () => void;
  initialData?: ExtractedData;
}

interface ExtractedData {
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
}

export function SummaryTab({ onNewProject, initialData }: SummaryTabProps) {
  const { toast } = useToast();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(initialData ?? null);
  
  // Sync when initial data changes (e.g., generated from NewProjectTab)
  useEffect(() => {
    setExtractedData(initialData ?? null);
  }, [initialData]);

  const hasData = extractedData && (
    extractedData.overview ||
    (extractedData.functional && extractedData.functional.length > 0) ||
    (extractedData.nonFunctional && extractedData.nonFunctional.length > 0)
  );


  const handleGeneratePDF = async () => {
    if (!hasData) {
      toast({
        title: "No data available",
        description: "Please generate a summary first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingPDF(true);
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SRS_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: "Your SRS report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "Failed to generate PDF",
        description: error instanceof Error ? error.message : "Could not generate the report.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!hasData) {
    return (
      <div className="min-h-[calc(100vh-8rem)] w-full flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <FileX className="h-8 w-8 text-muted-foreground" />
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-2">No Summary Available</h2>
          <p className="text-muted-foreground mb-6">
            Start a new project and have a conversation to generate summaries.
          </p>

          <Button onClick={onNewProject} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Project
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-[calc(100vh-8rem)] w-full animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Requirements Summary</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete overview of extracted requirements</p>
        </div>
        <Button onClick={handleGeneratePDF} disabled={generatingPDF} className="gap-2">
          {generatingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF Report
            </>
          )}
        </Button>
      </div>

      {/* Summary Card */}
      {extractedData?.summary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>High-level overview of the project</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap">{extractedData.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Cost & Timeline - Always show */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Estimate
            </CardTitle>
            <CardDescription>Estimated project cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {extractedData?.costEstimate || "Not specified"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Estimate
            </CardTitle>
            <CardDescription>Estimated project timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {extractedData?.timeline || "Not specified"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {extractedData.overview && (
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>High-level goal and problem statement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{extractedData.overview}</p>
            </CardContent>
          </Card>
        )}

        {extractedData.functional && extractedData.functional.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Functional Requirements</CardTitle>
              <CardDescription>Main actions the system must support</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {extractedData.functional.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {extractedData.nonFunctional && extractedData.nonFunctional.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Non-Functional Requirements</CardTitle>
              <CardDescription>Quality attributes and system characteristics</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {extractedData.nonFunctional.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {extractedData.stakeholders && extractedData.stakeholders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Users & Stakeholders</CardTitle>
              <CardDescription>Who will use this system</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {extractedData.stakeholders.map((stakeholder, idx) => (
                  <li key={idx}>{stakeholder}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {extractedData.constraints && extractedData.constraints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Constraints</CardTitle>
              <CardDescription>Budget, timeline, technology, and legal constraints</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {extractedData.constraints.map((constraint, idx) => (
                  <li key={idx}>{constraint}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {extractedData.risks && extractedData.risks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Risks</CardTitle>
              <CardDescription>Possible risks that might affect the system</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {extractedData.risks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {extractedData.userStories && extractedData.userStories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>User Stories</CardTitle>
              <CardDescription>User stories in the format: As a [user], I want [goal] so that [reason]</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {extractedData.userStories.map((story, idx) => (
                  <li key={idx}>{story}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
