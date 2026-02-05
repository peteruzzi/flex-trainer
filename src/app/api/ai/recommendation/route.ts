import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecommendation } from "@/lib/ai-mock";
import { getOrCreateDemoUser } from "@/lib/demo-user";

export async function GET() {
  const session = await auth();
  
  // Use demo user if no session
  let userId = session?.user?.id;
  if (!userId) {
    const demoUser = await getOrCreateDemoUser();
    userId = demoUser.id;
  }

  // Get recent workouts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "desc" },
  });

  const locations = await prisma.location.findMany();
  
  // Get active/recovering injuries
  const injuries = await prisma.injury.findMany({
    where: {
      userId,
      status: { in: ["active", "recovering"] },
    },
  });

  const recommendation = generateRecommendation(workouts, locations, injuries);

  return NextResponse.json(recommendation);
}
