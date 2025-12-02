import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, FileText, Users, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl">Software Requiremnet Bot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Requirements Gathering
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Transform Ideas Into
            <span className="text-gradient block mt-2">Software Requirements</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Our intelligent bot helps you capture, organize, and refine software requirements through natural conversation. Say goodbye to missed requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/signup">
              <Button variant="hero" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="hero-outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features to streamline your requirements gathering process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border hover:border-primary/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative rounded-3xl gradient-primary p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Process?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of teams using ReqBot to gather better requirements faster.
              </p>
              <Link to="/signup">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2024 ReqBot. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description: "Chat naturally with our AI to capture requirements without complex forms or rigid templates.",
  },
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Automatically generate comprehensive requirement documents from your conversations.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share projects with your team and collaborate on requirements in real-time.",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get instant feedback on requirement completeness and potential gaps.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared. Full compliance with industry standards.",
  },
  {
    icon: Bot,
    title: "AI-Powered Insights",
    description: "Leverage AI to suggest improvements and identify missing requirements.",
  },
];

export default Landing;
