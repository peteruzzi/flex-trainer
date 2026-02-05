"use client";

import { Label } from "@/components/ui/label";
import type { PilatesClassType } from "@/types";

interface PilatesFormProps {
  classType: PilatesClassType | undefined;
  onClassTypeChange: (classType: PilatesClassType) => void;
}

const classTypes: { type: PilatesClassType; label: string; description: string }[] = [
  { type: "hiit", label: "HIIT", description: "High intensity intervals" },
  { type: "pilates", label: "Pilates", description: "Traditional mat pilates" },
  { type: "sculpt", label: "Sculpt", description: "Strength + pilates fusion" },
];

export function PilatesForm({ classType, onClassTypeChange }: PilatesFormProps) {
  return (
    <div className="space-y-3">
      <Label>Class Type</Label>
      <div className="grid grid-cols-3 gap-2">
        {classTypes.map(({ type, label, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => onClassTypeChange(type)}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              classType === type
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
