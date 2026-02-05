"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Workout } from "@/types";

interface WorkoutCardProps {
  workout: Workout;
}

const typeConfig: Record<string, { label: string; emoji: string; color: string }> = {
  pilates: { label: "Pilates", emoji: "🧘", color: "bg-pink-100 text-pink-800" },
  crossfit: { label: "CrossFit", emoji: "🏋️", color: "bg-orange-100 text-orange-800" },
  strength: { label: "Strength", emoji: "💪", color: "bg-blue-100 text-blue-800" },
  mtb: { label: "MTB", emoji: "🚵", color: "bg-green-100 text-green-800" },
};

const classTypeLabels: Record<string, string> = {
  hiit: "HIIT",
  pilates: "Pilates",
  sculpt: "Sculpt",
};

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const config = typeConfig[workout.type] || { label: workout.type, emoji: "🏃", color: "" };
  const tags = workout.tags ? JSON.parse(workout.tags) : [];
  const exercises = workout.exercises ? JSON.parse(workout.exercises) : [];

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{config.emoji}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{config.label}</span>
                {workout.classType && (
                  <Badge variant="secondary" className={config.color}>
                    {classTypeLabels[workout.classType] || workout.classType}
                  </Badge>
                )}
              </div>
              {workout.location && (
                <div className="text-sm text-muted-foreground">
                  📍 {workout.location.name}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-right">
            <div>{formatDate(workout.date)}</div>
            {workout.duration && <div>{workout.duration} min</div>}
          </div>
        </div>

        {/* CrossFit tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Strength exercises */}
        {exercises.length > 0 && (
          <div className="mt-3 text-sm text-muted-foreground">
            {exercises.slice(0, 3).map((ex: { name: string; sets: number; reps: number; weight?: number }, i: number) => (
              <span key={i}>
                {ex.name}
                {i < Math.min(exercises.length, 3) - 1 && " • "}
              </span>
            ))}
            {exercises.length > 3 && ` +${exercises.length - 3} more`}
          </div>
        )}

        {/* MTB stats */}
        {workout.type === "mtb" && (
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            {workout.distance && <span>{workout.distance} mi</span>}
            {workout.elevation && <span>↑ {workout.elevation} ft</span>}
            {workout.calories && <span>🔥 {workout.calories} cal</span>}
          </div>
        )}

        {/* Notes */}
        {workout.notes && (
          <div className="mt-3 text-sm text-muted-foreground italic">
            &ldquo;{workout.notes}&rdquo;
          </div>
        )}
      </CardContent>
    </Card>
  );
}
