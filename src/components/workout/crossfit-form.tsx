"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CrossFitTag, Exercise } from "@/types";

interface PersonalRecord {
  id: string;
  exerciseName: string;
  displayName: string;
  maxWeight: number;
}

interface CrossFitFormProps {
  tags: CrossFitTag[];
  onTagsChange: (tags: CrossFitTag[]) => void;
  exercises?: Exercise[];
  onExercisesChange?: (exercises: Exercise[]) => void;
}

const availableTags: { tag: CrossFitTag; label: string; emoji: string }[] = [
  { tag: "push", label: "Push", emoji: "💪" },
  { tag: "pull", label: "Pull", emoji: "🏋️" },
  { tag: "upper", label: "Upper", emoji: "🦾" },
  { tag: "lower", label: "Lower", emoji: "🦵" },
  { tag: "cardio", label: "Cardio", emoji: "❤️" },
];

const commonCrossFitMovements = [
  "Clean",
  "Snatch",
  "Clean & Jerk",
  "Thruster",
  "Front Squat",
  "Back Squat",
  "Deadlift",
  "Overhead Press",
  "Push Press",
  "Power Clean",
  "Hang Clean",
  "Wall Balls",
  "Box Jumps",
  "Burpees",
  "Pull-ups",
  "Toes to Bar",
];

const PERCENTAGES = [100, 90, 80, 70, 60, 50, 40, 30];

export function CrossFitForm({ 
  tags, 
  onTagsChange, 
  exercises = [], 
  onExercisesChange 
}: CrossFitFormProps) {
  const queryClient = useQueryClient();
  const [showExercises, setShowExercises] = useState(false);
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: "",
    sets: 1,
    reps: 1,
    weight: undefined,
  });
  const [usePercentage, setUsePercentage] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState<number>(80);

  const { data: personalRecords = [] } = useQuery<PersonalRecord[]>({
    queryKey: ["personal-records"],
    queryFn: async () => {
      const res = await fetch("/api/personal-records");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const saveRecordMutation = useMutation({
    mutationFn: async (data: { displayName: string; maxWeight: number }) => {
      const res = await fetch("/api/personal-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save PR");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-records"] });
    },
  });

  const currentPR = personalRecords.find(
    (pr) => pr.displayName.toLowerCase() === newExercise.name.toLowerCase()
  );

  const toggleTag = (tag: CrossFitTag) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const addExercise = () => {
    if (!newExercise.name || !onExercisesChange) return;
    
    if (newExercise.isMax && newExercise.weight) {
      saveRecordMutation.mutate({
        displayName: newExercise.name,
        maxWeight: newExercise.weight,
      });
    }
    
    onExercisesChange([...exercises, newExercise]);
    setNewExercise({ name: "", sets: 1, reps: 1, weight: undefined });
    setUsePercentage(false);
  };

  const removeExercise = (index: number) => {
    if (onExercisesChange) {
      onExercisesChange(exercises.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      {/* Tags */}
      <div className="space-y-3">
        <Label>Movement Focus (select all that apply)</Label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(({ tag, label, emoji }) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-1 ${
                tags.includes(tag)
                  ? "border-orange-500 bg-orange-50 text-orange-800"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{emoji}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle exercise logging */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowExercises(!showExercises)}
        className="w-full"
      >
        {showExercises ? "Hide" : "Log"} specific movements & weights
      </Button>

      {showExercises && onExercisesChange && (
        <div className="space-y-3 p-3 border rounded-lg bg-orange-50/50">
          <Label>WOD Movements</Label>
          
          {/* Quick add common movements */}
          <div className="flex flex-wrap gap-1">
            {commonCrossFitMovements
              .filter((e) => !exercises.some((ex) => ex.name === e))
              .slice(0, 8)
              .map((name) => {
                const pr = personalRecords.find(
                  (p) => p.displayName.toLowerCase() === name.toLowerCase()
                );
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setNewExercise({ ...newExercise, name })}
                    className={`px-2 py-1 text-xs border rounded hover:bg-white ${
                      newExercise.name === name ? "bg-white border-orange-500" : ""
                    }`}
                  >
                    {name}
                    {pr && <span className="text-muted-foreground ml-1">({pr.maxWeight}#)</span>}
                  </button>
                );
              })}
          </div>

          {/* Exercise list */}
          {exercises.length > 0 && (
            <div className="space-y-1">
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-white rounded text-sm"
                >
                  <div className="flex-1">
                    <span className="font-medium">{exercise.name}</span>
                    {exercise.weight && (
                      <span className="text-muted-foreground ml-2">
                        @ {exercise.weight}lbs
                        {exercise.percentageUsed && (
                          <span className="text-orange-600 ml-1">
                            ({exercise.percentageUsed}%)
                          </span>
                        )}
                      </span>
                    )}
                    {exercise.isMax && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded ml-1">PR!</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add exercise form */}
          <div className="space-y-2 p-2 bg-white rounded">
            <Input
              placeholder="Movement name"
              value={newExercise.name}
              onChange={(e) => {
                setNewExercise({ ...newExercise, name: e.target.value });
                setUsePercentage(false);
              }}
            />
            
            {/* PR info */}
            {currentPR && (
              <div className="flex justify-between items-center text-xs p-2 bg-blue-50 rounded">
                <span>PR: <strong>{currentPR.maxWeight}#</strong></span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-5 px-2"
                  onClick={() => setUsePercentage(!usePercentage)}
                >
                  {usePercentage ? "Manual" : "Use %"}
                </Button>
              </div>
            )}
            
            {usePercentage && currentPR && (
              <Select
                value={selectedPercentage.toString()}
                onValueChange={(val) => {
                  const pct = parseInt(val);
                  setSelectedPercentage(pct);
                  setNewExercise({
                    ...newExercise,
                    weight: Math.round((currentPR.maxWeight * pct) / 100),
                    maxWeight: currentPR.maxWeight,
                    percentageUsed: pct,
                  });
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERCENTAGES.map((pct) => (
                    <SelectItem key={pct} value={pct.toString()}>
                      {pct}% = {Math.round((currentPR.maxWeight * pct) / 100)}#
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!usePercentage && (
              <Input
                type="number"
                placeholder="Weight (lbs)"
                value={newExercise.weight || ""}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    weight: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            )}

            {newExercise.weight && (!currentPR || newExercise.weight > currentPR.maxWeight) && (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={newExercise.isMax || false}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, isMax: e.target.checked })
                  }
                  className="rounded"
                />
                {currentPR ? `New PR! (was ${currentPR.maxWeight}#)` : "Set as my PR"}
              </label>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addExercise}
              disabled={!newExercise.name}
            >
              Add Movement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
