import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/demo-user";

export async function GET() {
  const session = await auth();
  
  let userId = session?.user?.id;
  if (!userId) {
    const demoUser = await getOrCreateDemoUser();
    userId = demoUser.id;
  }

  const workouts = await prisma.workout.findMany({
    where: { userId },
    include: { location: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(workouts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  let userId = session?.user?.id;
  if (!userId) {
    const demoUser = await getOrCreateDemoUser();
    userId = demoUser.id;
  }

  const body = await request.json();
  
  const workout = await prisma.workout.create({
    data: {
      userId,
      type: body.type,
      date: new Date(body.date),
      locationId: body.locationId || null,
      duration: body.duration || null,
      notes: body.notes || null,
      classType: body.classType || null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      exercises: body.exercises ? JSON.stringify(body.exercises) : null,
      distance: body.distance || null,
      elevation: body.elevation || null,
      calories: body.calories || null,
    },
    include: { location: true },
  });

  return NextResponse.json(workout, { status: 201 });
}
