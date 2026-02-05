"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BODY_AREAS, BODY_AREA_IMPACTS, type BodyArea, type Injury } from "@/lib/injury-mapping";

interface InjuryCardProps {
  injury: Injury;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const severityColors: Record<string, string> = {
  mild: "bg-yellow-100 text-yellow-800",
  moderate: "bg-orange-100 text-orange-800",
  severe: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  active: "bg-red-100 text-red-800",
  recovering: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

export function InjuryCard({ injury, onUpdateStatus, onDelete }: InjuryCardProps) {
  const bodyArea = BODY_AREAS.find(b => b.value === injury.bodyArea);
  const impact = BODY_AREA_IMPACTS[injury.bodyArea as BodyArea];
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className={injury.status === "resolved" ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{bodyArea?.emoji || "🩹"}</span>
            <div>
              <div className="font-medium">{injury.name}</div>
              <div className="text-xs text-muted-foreground">
                {bodyArea?.label || injury.bodyArea} · Since {formatDate(injury.startDate)}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Badge variant="secondary" className={severityColors[injury.severity]}>
              {injury.severity}
            </Badge>
            <Badge variant="secondary" className={statusColors[injury.status]}>
              {injury.status}
            </Badge>
          </div>
        </div>

        {injury.notes && (
          <p className="text-sm text-muted-foreground mb-2 italic">
            &ldquo;{injury.notes}&rdquo;
          </p>
        )}

        {injury.status !== "resolved" && impact && (
          <div className="text-xs space-y-1 mb-3 p-2 bg-gray-50 rounded">
            {impact.avoidMovements.length > 0 && (
              <p>
                <span className="font-medium">Avoid:</span>{" "}
                {impact.avoidMovements.slice(0, 4).join(", ")}
              </p>
            )}
            {impact.alternatives.length > 0 && (
              <p>
                <span className="font-medium">Try instead:</span>{" "}
                {impact.alternatives.slice(0, 3).join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {injury.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(injury.id, "recovering")}
            >
              Mark Recovering
            </Button>
          )}
          {injury.status === "recovering" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(injury.id, "resolved")}
            >
              Mark Resolved
            </Button>
          )}
          {injury.status === "resolved" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(injury.id, "active")}
            >
              Reactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(injury.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
