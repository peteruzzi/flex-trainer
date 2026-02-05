import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "peter@demo.flextrainer.app";
const DEMO_USER_NAME = "Peter";

export async function POST() {
  try {
    // Find or create demo user
    let user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: DEMO_USER_NAME,
          email: DEMO_USER_EMAIL,
          emailVerified: new Date(),
        },
      });
    }

    // Seed demo user's workouts (always refresh for demo)
    await seedDemoWorkouts(user.id);

    // Create a session for the demo user
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Delete any existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    // Set cookies via response headers for better control
    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });
    
    // NextAuth v5 beta uses "authjs.session-token" without __Secure- prefix by default
    // But we need to set both to be safe
    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}${isProduction ? "; Secure" : ""}`;
    
    // Set multiple cookie variations to ensure compatibility
    response.headers.append("Set-Cookie", `authjs.session-token=${sessionToken}; ${cookieOptions}`);
    if (isProduction) {
      response.headers.append("Set-Cookie", `__Secure-authjs.session-token=${sessionToken}; ${cookieOptions}`);
    }

    return response;
  } catch (error) {
    console.error("Demo setup error:", error);
    return NextResponse.json({ error: "Failed to setup demo", details: String(error) }, { status: 500 });
  }
}

async function seedDemoWorkouts(userId: string) {
  // Ensure locations exist
  const locations = [
    { id: "pure-yoga", name: "Pure Yoga", type: "studio" },
    { id: "the-foundry", name: "The Foundry", type: "studio" },
    { id: "gain-station", name: "Gain Station", type: "box" },
    { id: "crossfit-kerosene", name: "CrossFit Kerosene", type: "box" },
    { id: "headstrong", name: "Headstrong", type: "box" },
    { id: "local-trails", name: "Local Trails", type: "trail" },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: {},
      create: loc,
    });
  }

  // Clear existing workouts for this user
  await prisma.workout.deleteMany({ where: { userId } });

  // Create 3 weeks of realistic workout data
  const today = new Date();
  const workouts = [
    // Week 1 (current week)
    { daysAgo: 0, type: "pilates", classType: "sculpt", locationId: "pure-yoga", duration: 55 },
    { daysAgo: 2, type: "crossfit", tags: ["push", "upper", "cardio"], locationId: "gain-station", duration: 60 },
    { daysAgo: 3, type: "pilates", classType: "hiit", locationId: "pure-yoga", duration: 45 },
    { daysAgo: 5, type: "crossfit", tags: ["pull", "lower"], locationId: "gain-station", duration: 55 },
    { daysAgo: 6, type: "pilates", classType: "pilates", locationId: "the-foundry", duration: 50 },

    // Week 2
    { daysAgo: 8, type: "pilates", classType: "sculpt", locationId: "pure-yoga", duration: 55 },
    { daysAgo: 9, type: "crossfit", tags: ["push", "pull", "cardio"], locationId: "gain-station", duration: 60 },
    { daysAgo: 11, type: "pilates", classType: "hiit", locationId: "pure-yoga", duration: 45 },
    { daysAgo: 12, type: "mtb", distance: 12.5, elevation: 1800, calories: 650, duration: 90, locationId: "local-trails" },
    { daysAgo: 14, type: "crossfit", tags: ["lower", "cardio"], locationId: "crossfit-kerosene", duration: 50 },

    // Week 3
    { daysAgo: 15, type: "pilates", classType: "sculpt", locationId: "pure-yoga", duration: 55 },
    { daysAgo: 17, type: "crossfit", tags: ["push", "upper"], locationId: "gain-station", duration: 60 },
    { daysAgo: 18, type: "pilates", classType: "hiit", locationId: "the-foundry", duration: 45 },
    { daysAgo: 20, type: "crossfit", tags: ["pull", "lower", "cardio"], locationId: "headstrong", duration: 55 },
    { daysAgo: 21, type: "pilates", classType: "pilates", locationId: "pure-yoga", duration: 50 },
  ];

  for (const w of workouts) {
    const date = new Date(today);
    date.setDate(date.getDate() - w.daysAgo);
    date.setHours(9, 0, 0, 0);

    await prisma.workout.create({
      data: {
        userId,
        type: w.type,
        date,
        locationId: w.locationId,
        duration: w.duration,
        classType: (w as { classType?: string }).classType || null,
        tags: (w as { tags?: string[] }).tags ? JSON.stringify((w as { tags?: string[] }).tags) : null,
        distance: (w as { distance?: number }).distance || null,
        elevation: (w as { elevation?: number }).elevation || null,
        calories: (w as { calories?: number }).calories || null,
      },
    });
  }
}
