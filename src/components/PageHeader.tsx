import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  rightAction?: ReactNode;
}

const PageHeader = ({ title, backTo, rightAction }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-sm z-40">
      {backTo ? (
        <button onClick={() => navigate(backTo)} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ChevronLeft size={24} className="text-foreground" />
        </button>
      ) : (
        <div className="w-10" />
      )}
      <h1 className="text-lg font-bold font-heading text-foreground">{title}</h1>
      {rightAction || <div className="w-10" />}
    </header>
  );
};

export default PageHeader;
