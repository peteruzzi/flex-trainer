import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    include: { location: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(workouts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  
  const workout = await prisma.workout.create({
    data: {
      userId: session.user.id,
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
