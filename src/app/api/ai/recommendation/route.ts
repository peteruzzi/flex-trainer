import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecommendation } from "@/lib/ai-mock";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get recent workouts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: "desc" },
  });

  const locations = await prisma.location.findMany();
  
  // Get active/recovering injuries
  const injuries = await prisma.injury.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["active", "recovering"] },
    },
  });

  const recommendation = generateRecommendation(workouts, locations, injuries);

  return NextResponse.json(recommendation);
}
