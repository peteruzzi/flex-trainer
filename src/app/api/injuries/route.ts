import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const injuries = await prisma.injury.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { status: "asc" }, // active first
      { startDate: "desc" },
    ],
  });

  return NextResponse.json(injuries);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  
  const injury = await prisma.injury.create({
    data: {
      userId: session.user.id,
      bodyArea: body.bodyArea,
      name: body.name,
      severity: body.severity,
      status: body.status || "active",
      notes: body.notes || null,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });

  return NextResponse.json(injury, { status: 201 });
}
