import { useState, useEffect } from "react";
import { Users, FolderKanban, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function AdminOverviewTab() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalSummaries: 0,
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));
      
      // Fetch in parallel for faster loading
      const [usersRes, projectsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/projects")
      ]);
      
      const [usersData, projectsData] = await Promise.all([
        usersRes.json(),
        projectsRes.json()
      ]);
      
      const totalUsers = usersData.success ? usersData.data.length : 0;
      const totalProjects = projectsData.success ? projectsData.data.length : 0;
      const totalSummaries = projectsData.success
        ? projectsData.data.filter((p: any) => p.summary).length
        : 0;

      setStats({
        totalUsers,
        totalProjects,
        totalSummaries,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      description: "Registered users",
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      gradient: "from-purple-500 to-pink-500",
      description: "All projects",
    },
    {
      title: "Total Summaries",
      value: stats.totalSummaries,
      icon: FileText,
      gradient: "from-green-500 to-emerald-500",
      description: "Generated summaries",
    },
    {
      title: "Summary Rate",
      value: stats.totalProjects > 0
        ? `${Math.round((stats.totalSummaries / stats.totalProjects) * 100)}%`
        : "0%",
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
      description: "Projects with summaries",
    },
  ];

  if (stats.loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            Admin Overview
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Real-time insights and comprehensive analytics
          </p>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="group border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden relative backdrop-blur-sm"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
            
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <CardDescription className="text-sm font-medium">{stat.description}</CardDescription>
              
              {/* Decorative line */}
              <div className={`mt-4 h-1 w-12 bg-gradient-to-r ${stat.gradient} rounded-full`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-slate-900 dark:via-blue-950/20 dark:to-purple-950/20 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">User Activity</CardTitle>
                <CardDescription>Platform engagement metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">Active Users</span>
              <span className="text-xl font-bold text-blue-600">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">Total Accounts</span>
              <span className="text-xl font-bold text-purple-600">{stats.totalUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 dark:from-slate-900 dark:via-purple-950/20 dark:to-pink-950/20 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <FolderKanban className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Project Statistics</CardTitle>
                <CardDescription>Development and completion rates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">Total Projects</span>
              <span className="text-xl font-bold text-purple-600">{stats.totalProjects}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">With Summaries</span>
              <span className="text-xl font-bold text-pink-600">{stats.totalSummaries}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

