"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeeklySummaryProps {
  total: number;
  byType: Record<string, number>;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  pilates: { label: "Pilates", color: "bg-pink-100 text-pink-800" },
  crossfit: { label: "CrossFit", color: "bg-orange-100 text-orange-800" },
  strength: { label: "Strength", color: "bg-blue-100 text-blue-800" },
  mtb: { label: "MTB", color: "bg-green-100 text-green-800" },
};

export function WeeklySummary({ total, byType }: WeeklySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-3">
          {total} workout{total !== 1 ? "s" : ""}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byType).map(([type, count]) => (
            <Badge
              key={type}
              variant="secondary"
              className={typeLabels[type]?.color || ""}
            >
              {typeLabels[type]?.label || type} × {count}
            </Badge>
          ))}
          {Object.keys(byType).length === 0 && (
            <span className="text-sm text-muted-foreground">
              No workouts yet this week
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
