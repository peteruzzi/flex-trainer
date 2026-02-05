import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMuscleBalance, findImbalances } from "@/lib/muscle-mapping";
import { getOrCreateDemoUser } from "@/lib/demo-user";

export async function GET() {
  const session = await auth();
  
  // Use demo user if no session (for demo mode)
  let userId = session?.user?.id;
  if (!userId) {
    const demoUser = await getOrCreateDemoUser();
    userId = demoUser.id;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Weekly workouts
  const weeklyWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo },
    },
    include: { location: true },
    orderBy: { date: "desc" },
  });

  // Monthly workouts for balance
  const monthlyWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
  });

  // Count by type this week
  const weeklyByType = weeklyWorkouts.reduce<Record<string, number>>((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});

  // Calculate muscle balance from monthly data
  const muscleBalance = calculateMuscleBalance(monthlyWorkouts);
  const imbalances = findImbalances(muscleBalance);

  // Total counts
  const totalWorkouts = await prisma.workout.count({
    where: { userId },
  });

  return NextResponse.json({
    weekly: {
      total: weeklyWorkouts.length,
      byType: weeklyByType,
      workouts: weeklyWorkouts,
    },
    monthly: {
      muscleBalance,
      imbalances,
    },
    allTime: {
      total: totalWorkouts,
    },
  });
}
