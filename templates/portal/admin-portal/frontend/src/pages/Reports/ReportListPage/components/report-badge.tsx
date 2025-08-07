import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export type ReportCardProps = {
  title: string;
  subtitle?: string;
  createdBy?: string;
  category?: string;
  link: string;
};

export function ReportCard({
  title,
  subtitle,
  category,
  link,
}: ReportCardProps) {
  return (
    <div className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition bg-white dark:bg-muted/30">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-muted rounded-full">
          <FileText className="text-primary w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-lg font-semibold">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
            {category && <Badge variant="outline">{category}</Badge>}
          </div>
        </div>
        <Link
          to={link}
          className="inline-flex items-center justify-center rounded-md border border-primary px-3 py-1 text-sm font-medium transition hover:bg-primary hover:text-white"
        >
          View
        </Link>
      </div>
    </div>
  );
}