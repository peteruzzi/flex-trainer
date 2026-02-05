import { MuscleGroup } from "./muscle-mapping";

export type BodyArea = 
  | "shoulder" 
  | "knee" 
  | "back" 
  | "wrist" 
  | "ankle" 
  | "hip" 
  | "neck" 
  | "elbow"
  | "custom";

export type InjurySeverity = "mild" | "moderate" | "severe";
export type InjuryStatus = "active" | "recovering" | "resolved";

export const BODY_AREAS: { value: BodyArea; label: string; emoji: string }[] = [
  { value: "shoulder", label: "Shoulder", emoji: "🦾" },
  { value: "knee", label: "Knee", emoji: "🦵" },
  { value: "back", label: "Back", emoji: "🔙" },
  { value: "wrist", label: "Wrist", emoji: "✋" },
  { value: "ankle", label: "Ankle", emoji: "🦶" },
  { value: "hip", label: "Hip", emoji: "🦴" },
  { value: "neck", label: "Neck", emoji: "🦒" },
  { value: "elbow", label: "Elbow", emoji: "💪" },
  { value: "custom", label: "Other", emoji: "➕" },
];

export const COMMON_INJURIES: { bodyArea: BodyArea; name: string }[] = [
  { bodyArea: "shoulder", name: "Rotator cuff strain" },
  { bodyArea: "shoulder", name: "Shoulder impingement" },
  { bodyArea: "shoulder", name: "AC joint pain" },
  { bodyArea: "knee", name: "Patellar tendinitis" },
  { bodyArea: "knee", name: "IT band syndrome" },
  { bodyArea: "knee", name: "Meniscus issue" },
  { bodyArea: "back", name: "Lower back strain" },
  { bodyArea: "back", name: "Upper back tightness" },
  { bodyArea: "back", name: "Disc issue" },
  { bodyArea: "wrist", name: "Wrist strain" },
  { bodyArea: "wrist", name: "Carpal tunnel" },
  { bodyArea: "ankle", name: "Ankle sprain" },
  { bodyArea: "ankle", name: "Achilles tendinitis" },
  { bodyArea: "hip", name: "Hip flexor strain" },
  { bodyArea: "hip", name: "Hip bursitis" },
  { bodyArea: "neck", name: "Neck strain" },
  { bodyArea: "neck", name: "Cervical tension" },
  { bodyArea: "elbow", name: "Tennis elbow" },
  { bodyArea: "elbow", name: "Golfer's elbow" },
];

// Map body areas to affected muscle groups and movements
export const BODY_AREA_IMPACTS: Record<BodyArea, {
  affectedGroups: MuscleGroup[];
  avoidMovements: string[];
  alternatives: string[];
}> = {
  shoulder: {
    affectedGroups: ["push", "pull", "upper"],
    avoidMovements: ["Overhead press", "Bench press", "Pull-ups", "Dips", "Push-ups", "Lateral raises"],
    alternatives: ["Lower body focus", "Core work", "Light resistance bands", "Cardio (bike/walking)"],
  },
  knee: {
    affectedGroups: ["lower", "cardio"],
    avoidMovements: ["Squats", "Lunges", "Box jumps", "Running", "Leg press", "Jump rope"],
    alternatives: ["Upper body strength", "Swimming", "Seated exercises", "Core work"],
  },
  back: {
    affectedGroups: ["pull", "core", "lower"],
    avoidMovements: ["Deadlifts", "Rows", "Good mornings", "Heavy squats", "Sit-ups"],
    alternatives: ["Light stretching", "Swimming", "Walking", "Upper body (light)", "Bird dogs"],
  },
  wrist: {
    affectedGroups: ["push", "pull", "upper"],
    avoidMovements: ["Push-ups", "Front rack positions", "Cleans", "Snatches", "Planks on hands"],
    alternatives: ["Lower body work", "Cardio", "Machines", "Fist push-ups", "Forearm planks"],
  },
  ankle: {
    affectedGroups: ["lower", "cardio"],
    avoidMovements: ["Running", "Jumping", "Box jumps", "Calf raises", "Lunges"],
    alternatives: ["Upper body strength", "Swimming", "Cycling", "Seated exercises"],
  },
  hip: {
    affectedGroups: ["lower", "core"],
    avoidMovements: ["Squats", "Lunges", "Hip hinges", "Running", "Leg raises"],
    alternatives: ["Upper body work", "Swimming", "Gentle stretching", "Core (modified)"],
  },
  neck: {
    affectedGroups: ["upper", "core"],
    avoidMovements: ["Overhead press", "Shrugs", "Sit-ups", "Heavy carries"],
    alternatives: ["Lower body work", "Light cardio", "Gentle mobility", "Massage"],
  },
  elbow: {
    affectedGroups: ["push", "pull", "upper"],
    avoidMovements: ["Curls", "Tricep extensions", "Pull-ups", "Push-ups", "Rows"],
    alternatives: ["Lower body focus", "Cardio", "Core work", "Light resistance bands"],
  },
  custom: {
    affectedGroups: [],
    avoidMovements: [],
    alternatives: ["Consult with a professional", "Listen to your body"],
  },
};

export interface Injury {
  id: string;
  userId: string;
  bodyArea: string;
  name: string;
  severity: string;
  status: string;
  notes?: string | null;
  startDate: Date;
  endDate?: Date | null;
}

// Get workout modifications based on active injuries
export function getInjuryModifications(injuries: Injury[]): {
  avoidGroups: MuscleGroup[];
  avoidMovements: string[];
  alternatives: string[];
  warnings: string[];
} {
  const activeInjuries = injuries.filter(i => i.status === "active" || i.status === "recovering");
  
  const avoidGroups = new Set<MuscleGroup>();
  const avoidMovements = new Set<string>();
  const alternatives = new Set<string>();
  const warnings: string[] = [];
  
  for (const injury of activeInjuries) {
    const impact = BODY_AREA_IMPACTS[injury.bodyArea as BodyArea];
    if (impact) {
      // Severe injuries: avoid all affected groups
      // Moderate: warn but allow with caution
      // Mild: just note it
      if (injury.severity === "severe") {
        impact.affectedGroups.forEach(g => avoidGroups.add(g));
        impact.avoidMovements.forEach(m => avoidMovements.add(m));
        warnings.push(`⚠️ ${injury.name}: Avoid ${impact.affectedGroups.join(", ")} work`);
      } else if (injury.severity === "moderate") {
        impact.avoidMovements.forEach(m => avoidMovements.add(m));
        warnings.push(`⚡ ${injury.name}: Modify or avoid: ${impact.avoidMovements.slice(0, 3).join(", ")}`);
      } else {
        warnings.push(`💡 ${injury.name}: Be mindful during ${impact.affectedGroups.join(", ")} movements`);
      }
      
      impact.alternatives.forEach(a => alternatives.add(a));
    }
  }
  
  return {
    avoidGroups: Array.from(avoidGroups),
    avoidMovements: Array.from(avoidMovements),
    alternatives: Array.from(alternatives),
    warnings,
  };
}

// Get recommended workout types based on injuries
export function getRecommendedWorkoutsForInjuries(injuries: Injury[]): {
  recommended: string[];
  avoid: string[];
  modifications: string[];
} {
  const mods = getInjuryModifications(injuries);
  const recommended: string[] = [];
  const avoid: string[] = [];
  const modifications: string[] = [];
  
  // Check each workout type against injury restrictions
  if (mods.avoidGroups.includes("push") || mods.avoidGroups.includes("pull") || mods.avoidGroups.includes("upper")) {
    avoid.push("Heavy strength training (upper body)");
    modifications.push("Focus on lower body and core for strength work");
  }
  
  if (mods.avoidGroups.includes("lower")) {
    avoid.push("Running, jumping, heavy squats/lunges");
    modifications.push("Swimming, cycling, or upper body focus");
    recommended.push("Upper body strength", "Swimming");
  }
  
  if (mods.avoidGroups.includes("cardio")) {
    avoid.push("High-impact cardio (running, jumping)");
    modifications.push("Low-impact: cycling, swimming, walking");
    recommended.push("Strength training", "Swimming");
  }
  
  if (!mods.avoidGroups.includes("core")) {
    recommended.push("Core work (modified as needed)");
  }
  
  if (!mods.avoidGroups.includes("lower") && !mods.avoidGroups.includes("cardio")) {
    recommended.push("Pilates", "Walking", "Light cycling");
  }
  
  return { recommended, avoid, modifications };
}

// Get recommended percentage of max weight based on injury status
export function getRecommendedPercentage(injuries: Injury[], bodyArea?: BodyArea): {
  percentage: number;
  reason: string;
} {
  const activeInjuries = injuries.filter(i => 
    i.status === "active" || i.status === "recovering"
  );
  
  // Check if any active injury affects the given body area
  const relevantInjury = bodyArea 
    ? activeInjuries.find(i => i.bodyArea === bodyArea)
    : activeInjuries[0];
  
  if (!relevantInjury) {
    return { percentage: 100, reason: "No active injuries - train at full capacity" };
  }
  
  // Recommend percentages based on severity and status
  if (relevantInjury.severity === "severe") {
    if (relevantInjury.status === "active") {
      return { percentage: 0, reason: `Avoid loading - ${relevantInjury.name} is severe and active` };
    }
    // Recovering from severe
    return { percentage: 30, reason: `Start light at 30% - recovering from severe ${relevantInjury.name}` };
  }
  
  if (relevantInjury.severity === "moderate") {
    if (relevantInjury.status === "active") {
      return { percentage: 50, reason: `Stay at 50% - ${relevantInjury.name} is still active` };
    }
    // Recovering from moderate
    return { percentage: 70, reason: `Progress to 70% - ${relevantInjury.name} is recovering well` };
  }
  
  // Mild injury
  if (relevantInjury.status === "active") {
    return { percentage: 70, reason: `Train at 70% - mild ${relevantInjury.name}, listen to your body` };
  }
  
  return { percentage: 90, reason: `Almost there! 90% - ${relevantInjury.name} is nearly resolved` };
}

// Map exercises to body areas they primarily stress
export const EXERCISE_BODY_AREAS: Record<string, BodyArea[]> = {
  "bench press": ["shoulder", "elbow", "wrist"],
  "overhead press": ["shoulder", "back", "wrist"],
  "push press": ["shoulder", "back", "wrist"],
  "squat": ["knee", "back", "hip"],
  "back squat": ["knee", "back", "hip"],
  "front squat": ["knee", "back", "wrist"],
  "deadlift": ["back", "hip", "knee"],
  "romanian deadlift": ["back", "hip"],
  "clean": ["wrist", "shoulder", "back", "knee"],
  "snatch": ["wrist", "shoulder", "back"],
  "clean & jerk": ["wrist", "shoulder", "back", "knee"],
  "pull-ups": ["shoulder", "elbow"],
  "barbell row": ["back", "shoulder"],
  "lunges": ["knee", "hip", "ankle"],
  "leg press": ["knee", "hip"],
  "dips": ["shoulder", "elbow"],
  "thruster": ["shoulder", "knee", "back"],
};

// Get exercise-specific recommendation based on injuries
export function getExerciseRecommendation(
  exerciseName: string,
  injuries: Injury[]
): {
  canPerform: boolean;
  recommendedPercentage: number;
  warning?: string;
  alternative?: string;
} {
  const normalizedName = exerciseName.toLowerCase();
  const bodyAreas = EXERCISE_BODY_AREAS[normalizedName] || [];
  
  const activeInjuries = injuries.filter(i => 
    i.status === "active" || i.status === "recovering"
  );
  
  // Check if any injury affects this exercise
  const relevantInjury = activeInjuries.find(i => 
    bodyAreas.includes(i.bodyArea as BodyArea)
  );
  
  if (!relevantInjury) {
    return { canPerform: true, recommendedPercentage: 100 };
  }
  
  const impact = BODY_AREA_IMPACTS[relevantInjury.bodyArea as BodyArea];
  const { percentage, reason } = getRecommendedPercentage([relevantInjury], relevantInjury.bodyArea as BodyArea);
  
  return {
    canPerform: percentage > 0,
    recommendedPercentage: percentage,
    warning: reason,
    alternative: impact?.alternatives[0],
  };
}
