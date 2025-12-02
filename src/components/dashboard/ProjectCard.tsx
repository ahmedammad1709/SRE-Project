import { FolderOpen, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  name: string;
  description: string;
  chats: number;
  lastUpdated: string;
  onClick?: () => void;
}

const ProjectCard = ({ name, description, chats, lastUpdated, onClick }: ProjectCardProps) => {
  return (
    <div className="group p-5 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <FolderOpen className="w-5 h-5" />
        </div>
        <Button variant="ghost" size="sm" onClick={onClick}>
          Open
        </Button>
      </div>

      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {chats} chats
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
