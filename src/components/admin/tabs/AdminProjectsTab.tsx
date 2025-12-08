import { useState, useEffect } from "react";
import { FileText, Eye, Calendar, User, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Project {
  id: number;
  name: string;
  description?: string;
  summary?: string;
  created_by?: string;
  created_at: string;
}

interface SummaryData {
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

export function AdminProjectsTab() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSummary, setFilterSummary] = useState<"all" | "with" | "without">("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
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

  const handleViewSummary = async (project: Project) => {
    try {
      if (project.summary) {
        const parsed = JSON.parse(project.summary);
        setSummaryData(parsed);
        setSelectedProject(project);
        setSummaryDialogOpen(true);
      } else {
        toast({
          title: "No Summary Available",
          description: "This project doesn't have a summary yet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to parse summary:", error);
      toast({
        title: "Error",
        description: "Failed to load project summary",
        variant: "destructive",
      });
    }
  };

  // Filter projects based on search and summary status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.created_by && project.created_by.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter =
      filterSummary === "all" ||
      (filterSummary === "with" && project.summary) ||
      (filterSummary === "without" && !project.summary);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            All Projects
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            View and manage all projects in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Filter className="h-4 w-4 text-white" />
            </div>
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSummary} onValueChange={(value: any) => setFilterSummary(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by summary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="with">With Summary</SelectItem>
                <SelectItem value="without">Without Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 overflow-hidden">
        <CardHeader>
          <CardTitle>Projects List</CardTitle>
          <CardDescription>
            {filteredProjects.length} of {projects.length} {projects.length === 1 ? "project" : "projects"} shown
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Project Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          {project.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-md truncate">
                        {project.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          {project.created_by || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={project.summary ? "default" : "secondary"}
                          className={
                            project.summary
                              ? "bg-green-500/10 text-green-600"
                              : "bg-gray-500/10 text-gray-600"
                          }
                        >
                          {project.summary ? "Available" : "Not Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSummary(project)}
                          disabled={!project.summary}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Summary
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedProject?.name} - Summary
            </DialogTitle>
            <DialogDescription>
              Complete project requirements summary
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Executive Summary */}
              {summaryData?.summary && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{summaryData.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Cost & Timeline */}
              {(summaryData?.costEstimate || summaryData?.timeline) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {summaryData.costEstimate && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Estimate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{summaryData.costEstimate}</div>
                      </CardContent>
                    </Card>
                  )}
                  {summaryData.timeline && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline Estimate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{summaryData.timeline}</div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Project Overview */}
              {summaryData?.overview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {summaryData.overview}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Functional Requirements */}
              {summaryData?.functional && summaryData.functional.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Functional Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {summaryData.functional.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Non-Functional Requirements */}
              {summaryData?.nonFunctional && summaryData.nonFunctional.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Non-Functional Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {summaryData.nonFunctional.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Stakeholders */}
              {summaryData?.stakeholders && summaryData.stakeholders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Users & Stakeholders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {summaryData.stakeholders.map((stakeholder, idx) => (
                        <li key={idx}>{stakeholder}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* User Stories */}
              {summaryData?.userStories && summaryData.userStories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Stories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {summaryData.userStories.map((story, idx) => (
                        <li key={idx}>{story}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Constraints */}
              {summaryData?.constraints && summaryData.constraints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {summaryData.constraints.map((constraint, idx) => (
                        <li key={idx}>{constraint}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {summaryData?.risks && summaryData.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {summaryData.risks.map((risk, idx) => (
                        <li key={idx}>{risk}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

