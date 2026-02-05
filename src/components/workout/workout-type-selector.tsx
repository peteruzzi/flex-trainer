"use client";

import { WorkoutType } from "@/types";

interface WorkoutTypeSelectorProps {
  value: WorkoutType | null;
  onChange: (type: WorkoutType) => void;
}

const workoutTypes: { type: WorkoutType; label: string; emoji: string; description: string }[] = [
  { type: "pilates", label: "Pilates", emoji: "🧘", description: "Hot Pilates, Sculpt, HIIT" },
  { type: "crossfit", label: "CrossFit", emoji: "🏋️", description: "WODs, functional fitness" },
  { type: "strength", label: "Strength", emoji: "💪", description: "Weight training" },
  { type: "mtb", label: "MTB", emoji: "🚵", description: "Mountain biking" },
];

export function WorkoutTypeSelector({ value, onChange }: WorkoutTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {workoutTypes.map(({ type, label, emoji, description }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            value === type
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="text-2xl mb-1">{emoji}</div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </button>
      ))}
    </div>
  );
}
