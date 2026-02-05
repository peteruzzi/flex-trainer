"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { MuscleBalanceChart } from "@/components/dashboard/muscle-balance-chart";
import { AIRecommendationCard } from "@/components/dashboard/ai-recommendation-card";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  
  // For demo purposes, always allow access - APIs will use demo user if no session
  const isDemo = !session && status !== "loading";
  const userName = session?.user?.name || "Peter";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: recommendation, isLoading: recLoading } = useQuery({
    queryKey: ["recommendation"],
    queryFn: async () => {
      const res = await fetch("/api/ai/recommendation");
      if (!res.ok) throw new Error("Failed to fetch recommendation");
      return res.json();
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-2xl">💪</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">💪 Flex Trainer</h1>
            <p className="text-xs text-muted-foreground">
              Hey, {userName}!{isDemo && " (Demo Mode)"}
            </p>
          </div>
          {session ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* AI Recommendation */}
        <AIRecommendationCard
          recommendation={recommendation}
          isLoading={recLoading}
        />

        {/* Weekly Summary */}
        {statsLoading ? (
          <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
        ) : (
          <WeeklySummary
            total={stats?.weekly?.total || 0}
            byType={stats?.weekly?.byType || {}}
          />
        )}

        {/* Muscle Balance */}
        {statsLoading ? (
          <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
        ) : (
          <MuscleBalanceChart
            balance={stats?.monthly?.muscleBalance || {
              push: 0,
              pull: 0,
              upper: 0,
              lower: 0,
              cardio: 0,
              core: 0,
            }}
            imbalances={stats?.monthly?.imbalances || { neglected: [], overtrained: [] }}
          />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/history">
            <Button variant="outline" className="w-full">
              📋 History
            </Button>
          </Link>
          <Link href="/log">
            <Button className="w-full">
              ➕ Log Workout
            </Button>
          </Link>
        </div>
        
        {/* Injuries Link */}
        <Link href="/injuries">
          <Button variant="ghost" className="w-full text-muted-foreground">
            🩹 Manage Injuries
          </Button>
        </Link>
      </main>

      {/* FAB */}
      <Link
        href="/log"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
      >
        +
      </Link>
    </div>
  );
}
