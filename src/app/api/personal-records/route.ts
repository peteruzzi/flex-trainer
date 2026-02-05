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

  const records = await prisma.personalRecord.findMany({
    where: { userId },
    orderBy: { displayName: "asc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  let userId = session?.user?.id;
  if (!userId) {
    const demoUser = await getOrCreateDemoUser();
    userId = demoUser.id;
  }

  const body = await request.json();
  const exerciseName = normalizeExerciseName(body.exerciseName || body.displayName);
  
  // Upsert: update if exists, create if not
  const record = await prisma.personalRecord.upsert({
    where: {
      userId_exerciseName: {
        userId,
        exerciseName,
      },
    },
    update: {
      maxWeight: body.maxWeight,
      displayName: body.displayName,
      date: new Date(),
      notes: body.notes || null,
    },
    create: {
      userId,
      exerciseName,
      displayName: body.displayName,
      maxWeight: body.maxWeight,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}

function normalizeExerciseName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}
