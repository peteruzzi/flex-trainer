import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.personalRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { displayName: "asc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const exerciseName = normalizeExerciseName(body.exerciseName || body.displayName);
  
  // Upsert: update if exists, create if not
  const record = await prisma.personalRecord.upsert({
    where: {
      userId_exerciseName: {
        userId: session.user.id,
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
      userId: session.user.id,
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
