
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  className?: string;
}

const ToolCard = ({
  icon: Icon,
  title,
  description,
  link,
  className,
}: ToolCardProps) => {
  return (
    <Link
      to={link}
      className={cn(
        "bg-card rounded-xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300 group flex flex-col h-full",
        className
      )}
    >
      <div className="bg-primary/5 rounded-lg w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground flex-grow">{description}</p>
      <div className="mt-4 text-primary text-sm font-medium group-hover:underline">
        Use Tool
      </div>
    </Link>
  );
};

export default ToolCard;
