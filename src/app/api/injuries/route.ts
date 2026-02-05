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

  const injuries = await prisma.injury.findMany({
    where: { userId },
    orderBy: [
      { status: "asc" }, // active first
      { startDate: "desc" },
    ],
  });

  return NextResponse.json(injuries);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  let userId = session?.user?.id;
  if (!userId) {
    const demoUser = await getOrCreateDemoUser();
    userId = demoUser.id;
  }

  const body = await request.json();
  
  const injury = await prisma.injury.create({
    data: {
      userId,
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
