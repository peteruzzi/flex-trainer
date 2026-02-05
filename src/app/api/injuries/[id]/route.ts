import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  
  // Verify ownership
  const existing = await prisma.injury.findFirst({
    where: { id, userId: session.user.id },
  });
  
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const injury = await prisma.injury.update({
    where: { id },
    data: {
      bodyArea: body.bodyArea ?? existing.bodyArea,
      name: body.name ?? existing.name,
      severity: body.severity ?? existing.severity,
      status: body.status ?? existing.status,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
    },
  });

  return NextResponse.json(injury);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  // Verify ownership
  const existing = await prisma.injury.findFirst({
    where: { id, userId: session.user.id },
  });
  
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.injury.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
