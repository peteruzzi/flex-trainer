import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create locations
  const pureYoga = await prisma.location.upsert({
    where: { id: "pure-yoga" },
    update: {},
    create: {
      id: "pure-yoga",
      name: "Pure Yoga",
      type: "studio",
    },
  });

  const foundry = await prisma.location.upsert({
    where: { id: "the-foundry" },
    update: {},
    create: {
      id: "the-foundry",
      name: "The Foundry",
      type: "studio",
    },
  });

  const gainStation = await prisma.location.upsert({
    where: { id: "gain-station" },
    update: {},
    create: {
      id: "gain-station",
      name: "Gain Station",
      type: "box",
    },
  });

  const kerosene = await prisma.location.upsert({
    where: { id: "crossfit-kerosene" },
    update: {},
    create: {
      id: "crossfit-kerosene",
      name: "CrossFit Kerosene",
      type: "box",
    },
  });

  const headstrong = await prisma.location.upsert({
    where: { id: "headstrong" },
    update: {},
    create: {
      id: "headstrong",
      name: "Headstrong",
      type: "box",
    },
  });

  await prisma.location.upsert({
    where: { id: "local-trails" },
    update: {},
    create: {
      id: "local-trails",
      name: "Local Trails",
      type: "trail",
    },
  });

  console.log("Locations created!");

  // Create demo user (Peter)
  const user = await prisma.user.upsert({
    where: { email: "peter@example.com" },
    update: {},
    create: {
      id: "demo-user",
      name: "Peter",
      email: "peter@example.com",
      emailVerified: new Date(),
    },
  });

  console.log("Demo user created!");

  // Create 3 weeks of realistic workout data
  const today = new Date();
  const workouts = [
    // Week 1 (current week)
    { daysAgo: 0, type: "pilates", classType: "sculpt", locationId: pureYoga.id, duration: 55 },
    { daysAgo: 2, type: "crossfit", tags: ["push", "upper", "cardio"], locationId: gainStation.id, duration: 60 },
    { daysAgo: 3, type: "pilates", classType: "hiit", locationId: pureYoga.id, duration: 45 },
    { daysAgo: 5, type: "crossfit", tags: ["pull", "lower"], locationId: gainStation.id, duration: 55 },
    { daysAgo: 6, type: "pilates", classType: "pilates", locationId: foundry.id, duration: 50 },

    // Week 2
    { daysAgo: 8, type: "pilates", classType: "sculpt", locationId: pureYoga.id, duration: 55 },
    { daysAgo: 9, type: "crossfit", tags: ["push", "pull", "cardio"], locationId: gainStation.id, duration: 60 },
    { daysAgo: 11, type: "pilates", classType: "hiit", locationId: pureYoga.id, duration: 45 },
    { daysAgo: 12, type: "mtb", distance: 12.5, elevation: 1800, calories: 650, duration: 90 },
    { daysAgo: 14, type: "crossfit", tags: ["lower", "cardio"], locationId: kerosene.id, duration: 50 },

    // Week 3
    { daysAgo: 15, type: "pilates", classType: "sculpt", locationId: pureYoga.id, duration: 55 },
    { daysAgo: 17, type: "crossfit", tags: ["push", "upper"], locationId: gainStation.id, duration: 60 },
    { daysAgo: 18, type: "pilates", classType: "hiit", locationId: foundry.id, duration: 45 },
    { daysAgo: 20, type: "crossfit", tags: ["pull", "lower", "cardio"], locationId: headstrong.id, duration: 55 },
    { daysAgo: 21, type: "pilates", classType: "pilates", locationId: pureYoga.id, duration: 50 },
  ];

  // Clear existing workouts for demo user
  await prisma.workout.deleteMany({
    where: { userId: user.id },
  });

  // Create workouts
  for (const w of workouts) {
    const date = new Date(today);
    date.setDate(date.getDate() - w.daysAgo);
    date.setHours(9, 0, 0, 0); // Morning workout

    await prisma.workout.create({
      data: {
        userId: user.id,
        type: w.type,
        date,
        locationId: w.locationId,
        duration: w.duration,
        classType: w.classType || null,
        tags: w.tags ? JSON.stringify(w.tags) : null,
        distance: w.distance || null,
        elevation: w.elevation || null,
        calories: w.calories || null,
      },
    });
  }

  console.log(`Created ${workouts.length} workouts!`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
