"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkoutTypeSelector } from "@/components/workout/workout-type-selector";
import { LocationPicker } from "@/components/workout/location-picker";
import { PilatesForm } from "@/components/workout/pilates-form";
import { CrossFitForm } from "@/components/workout/crossfit-form";
import { StrengthForm } from "@/components/workout/strength-form";
import { MTBForm } from "@/components/workout/mtb-form";
import { toast } from "sonner";
import type { WorkoutType, PilatesClassType, CrossFitTag, Exercise, Location } from "@/types";

export default function LogWorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [locationId, setLocationId] = useState<string | undefined>();
  const [duration, setDuration] = useState<number | undefined>();
  const [notes, setNotes] = useState("");

  // Pilates
  const [classType, setClassType] = useState<PilatesClassType | undefined>();

  // CrossFit
  const [tags, setTags] = useState<CrossFitTag[]>([]);

  // Strength
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // MTB
  const [distance, setDistance] = useState<number | undefined>();
  const [elevation, setElevation] = useState<number | undefined>();
  const [calories, setCalories] = useState<number | undefined>();

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await fetch("/api/locations");
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create workout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["recommendation"] });
      toast.success("Workout logged!");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Failed to log workout");
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-2xl">💪</div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutType) return;

    const data: Record<string, unknown> = {
      type: workoutType,
      date: new Date(date).toISOString(),
      locationId,
      duration,
      notes: notes || undefined,
    };

    if (workoutType === "pilates") {
      data.classType = classType;
    } else if (workoutType === "crossfit") {
      data.tags = tags;
      if (exercises.length > 0) {
        data.exercises = exercises;
      }
    } else if (workoutType === "strength") {
      data.exercises = exercises;
    } else if (workoutType === "mtb") {
      data.distance = distance;
      data.elevation = elevation;
      data.calories = calories;
    }

    mutation.mutate(data);
  };

  const isValid = () => {
    if (!workoutType) return false;
    if (workoutType === "pilates" && !classType) return false;
    if (workoutType === "crossfit" && tags.length === 0) return false;
    return true;
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-sm">
            ← Back
          </button>
          <h1 className="font-bold">Log Workout</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Workout Type */}
          <div className="space-y-2">
            <Label>Workout Type</Label>
            <WorkoutTypeSelector value={workoutType} onChange={setWorkoutType} />
          </div>

          {/* Type-specific forms */}
          {workoutType === "pilates" && (
            <>
              <PilatesForm classType={classType} onClassTypeChange={setClassType} />
              <LocationPicker
                locations={locations}
                value={locationId}
                onChange={setLocationId}
                workoutType="pilates"
              />
            </>
          )}

          {workoutType === "crossfit" && (
            <>
              <CrossFitForm 
                tags={tags} 
                onTagsChange={setTags}
                exercises={exercises}
                onExercisesChange={setExercises}
              />
              <LocationPicker
                locations={locations}
                value={locationId}
                onChange={setLocationId}
                workoutType="crossfit"
              />
            </>
          )}

          {workoutType === "strength" && (
            <>
              <StrengthForm exercises={exercises} onExercisesChange={setExercises} />
              <LocationPicker
                locations={locations}
                value={locationId}
                onChange={setLocationId}
              />
            </>
          )}

          {workoutType === "mtb" && (
            <MTBForm
              distance={distance}
              elevation={elevation}
              calories={calories}
              duration={duration}
              onDistanceChange={setDistance}
              onElevationChange={setElevation}
              onCaloriesChange={setCalories}
              onDurationChange={setDuration}
            />
          )}

          {/* Duration (for non-MTB) */}
          {workoutType && workoutType !== "mtb" && (
            <div className="space-y-2">
              <Label>Duration (minutes, optional)</Label>
              <Input
                type="number"
                min={1}
                placeholder="45"
                value={duration || ""}
                onChange={(e) =>
                  setDuration(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
          )}

          {/* Notes */}
          {workoutType && (
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="How did it feel?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isValid() || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Workout"}
          </Button>
        </form>
      </main>
    </div>
  );
}
