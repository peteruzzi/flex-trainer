"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { WorkoutCard } from "@/components/history/workout-card";
import type { Workout } from "@/types";

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { data: workouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      const res = await fetch("/api/workouts");
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return res.json();
    },
    enabled: !!session,
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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-sm">
            ← Back
          </button>
          <h1 className="font-bold">Workout History</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="font-semibold mb-2">No workouts yet</h2>
            <p className="text-sm text-muted-foreground">
              Log your first workout to see it here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
