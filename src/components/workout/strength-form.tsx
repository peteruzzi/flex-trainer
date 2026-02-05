"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Exercise } from "@/types";

interface PersonalRecord {
  id: string;
  exerciseName: string;
  displayName: string;
  maxWeight: number;
  date: string;
}

interface StrengthFormProps {
  exercises: Exercise[];
  onExercisesChange: (exercises: Exercise[]) => void;
}

const commonExercises = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-ups",
  "Dips",
  "Lunges",
  "Leg Press",
  "Lat Pulldown",
  "Clean",
  "Snatch",
  "Front Squat",
  "Romanian Deadlift",
  "Hip Thrust",
];

const PERCENTAGES = [100, 90, 80, 70, 60, 50, 40, 30];

export function StrengthForm({ exercises, onExercisesChange }: StrengthFormProps) {
  const queryClient = useQueryClient();
  
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: "",
    sets: 3,
    reps: 10,
    weight: undefined,
    maxWeight: undefined,
    percentageUsed: undefined,
    isMax: false,
  });
  
  const [usePercentage, setUsePercentage] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState<number>(80);

  // Fetch personal records
  const { data: personalRecords = [] } = useQuery<PersonalRecord[]>({
    queryKey: ["personal-records"],
    queryFn: async () => {
      const res = await fetch("/api/personal-records");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Save personal record mutation
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

  // Get PR for current exercise
  const currentPR = personalRecords.find(
    (pr) => pr.displayName.toLowerCase() === newExercise.name.toLowerCase()
  );

  // Calculate weight from percentage when PR exists
  useEffect(() => {
    if (usePercentage && currentPR && selectedPercentage) {
      const calculatedWeight = Math.round((currentPR.maxWeight * selectedPercentage) / 100);
      setNewExercise((prev) => ({
        ...prev,
        weight: calculatedWeight,
        maxWeight: currentPR.maxWeight,
        percentageUsed: selectedPercentage,
      }));
    }
  }, [usePercentage, currentPR, selectedPercentage]);

  const addExercise = () => {
    if (!newExercise.name) return;
    
    // If this is a new max, save it as PR
    if (newExercise.isMax && newExercise.weight) {
      saveRecordMutation.mutate({
        displayName: newExercise.name,
        maxWeight: newExercise.weight,
      });
    }
    
    onExercisesChange([...exercises, newExercise]);
    setNewExercise({
      name: "",
      sets: 3,
      reps: 10,
      weight: undefined,
      maxWeight: undefined,
      percentageUsed: undefined,
      isMax: false,
    });
    setUsePercentage(false);
  };

  const removeExercise = (index: number) => {
    onExercisesChange(exercises.filter((_, i) => i !== index));
  };

  const addQuickExercise = (name: string) => {
    const pr = personalRecords.find(
      (p) => p.displayName.toLowerCase() === name.toLowerCase()
    );
    onExercisesChange([
      ...exercises,
      { name, sets: 3, reps: 10, maxWeight: pr?.maxWeight },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Quick add */}
      <div className="space-y-2">
        <Label>Quick Add</Label>
        <div className="flex flex-wrap gap-1">
          {commonExercises
            .filter((e) => !exercises.some((ex) => ex.name === e))
            .slice(0, 6)
            .map((name) => {
              const pr = personalRecords.find(
                (p) => p.displayName.toLowerCase() === name.toLowerCase()
              );
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => addQuickExercise(name)}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                >
                  + {name}
                  {pr && <span className="text-muted-foreground ml-1">({pr.maxWeight}lb max)</span>}
                </button>
              );
            })}
        </div>
      </div>

      {/* Exercise list */}
      {exercises.length > 0 && (
        <div className="space-y-2">
          <Label>Exercises</Label>
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center gap-2">
                  {exercise.name}
                  {exercise.isMax && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">NEW PR!</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight && ` @ ${exercise.weight}lbs`}
                  {exercise.percentageUsed && exercise.maxWeight && (
                    <span className="text-blue-600 ml-1">
                      ({exercise.percentageUsed}% of {exercise.maxWeight}lb max)
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExercise(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual add */}
      <div className="space-y-3 p-3 border rounded-lg">
        <Label>Add Exercise</Label>
        <Input
          placeholder="Exercise name"
          value={newExercise.name}
          onChange={(e) => {
            setNewExercise({ ...newExercise, name: e.target.value });
            setUsePercentage(false);
          }}
        />
        
        {/* Show PR info if available */}
        {currentPR && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="flex justify-between items-center">
              <span>
                Your PR: <strong>{currentPR.maxWeight} lbs</strong>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={() => setUsePercentage(!usePercentage)}
              >
                {usePercentage ? "Enter manually" : "Use % calculator"}
              </Button>
            </div>
          </div>
        )}
        
        {/* Percentage calculator */}
        {usePercentage && currentPR && (
          <div className="p-2 bg-gray-50 rounded space-y-2">
            <Label className="text-xs">Select percentage of max</Label>
            <Select
              value={selectedPercentage.toString()}
              onValueChange={(val) => setSelectedPercentage(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERCENTAGES.map((pct) => (
                  <SelectItem key={pct} value={pct.toString()}>
                    {pct}% = {Math.round((currentPR.maxWeight * pct) / 100)} lbs
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Sets</Label>
            <Input
              type="number"
              min={1}
              value={newExercise.sets}
              onChange={(e) =>
                setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Reps</Label>
            <Input
              type="number"
              min={1}
              value={newExercise.reps}
              onChange={(e) =>
                setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Weight (lbs)</Label>
            <Input
              type="number"
              min={0}
              value={newExercise.weight || ""}
              onChange={(e) =>
                setNewExercise({
                  ...newExercise,
                  weight: e.target.value ? parseInt(e.target.value) : undefined,
                  percentageUsed: undefined, // Clear percentage if manually entering
                })
              }
              disabled={usePercentage}
            />
          </div>
        </div>

        {/* New Max checkbox */}
        {newExercise.weight && (!currentPR || newExercise.weight > currentPR.maxWeight) && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newExercise.isMax || false}
              onChange={(e) =>
                setNewExercise({ ...newExercise, isMax: e.target.checked })
              }
              className="rounded"
            />
            <span>
              {currentPR
                ? `New PR! (Previous: ${currentPR.maxWeight} lbs)`
                : "Set as my max (PR) for this exercise"}
            </span>
          </label>
        )}

        <Button type="button" variant="secondary" size="sm" onClick={addExercise}>
          Add Exercise
        </Button>
      </div>
    </div>
  );
}
