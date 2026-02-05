import { MuscleGroup, MUSCLE_GROUPS, findImbalances, calculateMuscleBalance, getWorkoutIntensities } from "./muscle-mapping";
import { getInjuryModifications, getRecommendedWorkoutsForInjuries, getRecommendedPercentage, type Injury } from "./injury-mapping";

type Workout = {
  type: string;
  classType?: string | null;
  tags?: string | null;
  date: Date;
};

type Location = {
  id: string;
  name: string;
  type: string;
};

export interface AIRecommendation {
  type: "workout" | "rest" | "insight";
  title: string;
  description: string;
  suggestedWorkout?: {
    type: string;
    location?: string;
    focus?: string[];
    exercises?: string[];
  };
  insights?: {
    totalIntensity: number;
    balanceScore: number;
    strongestAreas: string[];
    weakestAreas: string[];
  };
  injuryWarnings?: string[];
  injuryAlternatives?: string[];
  weightRecommendation?: {
    percentage: number;
    reason: string;
  };
}

// Calculate overall training intensity score
function calculateTotalIntensity(balance: Record<MuscleGroup, number>): number {
  return Object.values(balance).reduce((sum, val) => sum + val, 0);
}

// Calculate balance score (0-100, higher = more balanced)
function calculateBalanceScore(balance: Record<MuscleGroup, number>): number {
  const values = Object.values(balance);
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  if (max === 0) return 100; // No training = "balanced" at zero
  
  // Score based on how close min is to max
  const ratio = min / max;
  return Math.round(ratio * 100);
}

// Get sorted areas by intensity
function getAreasByIntensity(balance: Record<MuscleGroup, number>): { strongest: MuscleGroup[]; weakest: MuscleGroup[] } {
  const sorted = (Object.entries(balance) as [MuscleGroup, number][])
    .sort((a, b) => b[1] - a[1]);
  
  const strongest = sorted.slice(0, 2).filter(([, v]) => v > 0).map(([k]) => k);
  const weakest = sorted.slice(-2).filter(([, v]) => v < sorted[0][1] * 0.5).map(([k]) => k);
  
  return { strongest, weakest };
}

// Format intensity value for display
function formatIntensity(value: number): string {
  if (value === 0) return "none";
  if (value < 1) return "minimal";
  if (value < 2) return "light";
  if (value < 3) return "moderate";
  if (value < 4) return "solid";
  return "heavy";
}

// Mock AI recommendation engine
export function generateRecommendation(
  workouts: Workout[],
  locations: Location[],
  injuries: Injury[] = []
): AIRecommendation {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter to last 7 days
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= sevenDaysAgo);
  
  // Calculate weighted balance
  const balance = calculateMuscleBalance(recentWorkouts);
  const totalIntensity = calculateTotalIntensity(balance);
  const balanceScore = calculateBalanceScore(balance);
  const { strongest, weakest } = getAreasByIntensity(balance);
  
  // Get injury modifications
  const injuryMods = getInjuryModifications(injuries);
  const injuryRecs = getRecommendedWorkoutsForInjuries(injuries);
  const hasActiveInjuries = injuryMods.warnings.length > 0;
  
  const insights = {
    totalIntensity: Math.round(totalIntensity * 10) / 10,
    balanceScore,
    strongestAreas: strongest,
    weakestAreas: weakest,
  };
  
  // Get weight percentage recommendation for injuries
  const weightRec = hasActiveInjuries ? getRecommendedPercentage(injuries) : null;
  
  // If there are severe injuries, prioritize injury-aware recommendations
  if (hasActiveInjuries && injuryMods.avoidGroups.length > 0) {
    const safeWorkout = getSafeWorkoutRecommendation(injuryMods, injuryRecs, locations);
    return {
      type: "workout",
      title: "Injury-aware recommendation",
      description: `With your current injuries, focus on ${injuryRecs.recommended.slice(0, 2).join(" or ")}. ${injuryMods.warnings[0]}`,
      suggestedWorkout: safeWorkout,
      insights,
      injuryWarnings: injuryMods.warnings,
      injuryAlternatives: injuryMods.alternatives,
      weightRecommendation: weightRec ? {
        percentage: weightRec.percentage,
        reason: weightRec.reason,
      } : undefined,
    };
  }
  
  // Check for rest recommendation
  const lastWorkout = workouts[0];
  if (lastWorkout) {
    const daysSinceLastWorkout = Math.floor(
      (now.getTime() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // If no workout in 5+ days
    if (daysSinceLastWorkout >= 5) {
      return {
        type: "insight",
        title: "Welcome back!",
        description: `It's been ${daysSinceLastWorkout} days since your last workout. A light Sculpt class at Pure Yoga could be a good way to ease back in with moderate full-body intensity.`,
        suggestedWorkout: {
          type: "pilates",
          location: "Pure Yoga",
          focus: ["core", "lower"],
        },
        insights,
      };
    }
    
    // If total intensity is very high (training hard)
    if (totalIntensity > 12) {
      const consecutiveDays = countConsecutiveWorkoutDays(workouts);
      if (consecutiveDays >= 3) {
        return {
          type: "rest",
          title: "High training load detected",
          description: `You've accumulated ${formatIntensity(totalIntensity)} training intensity over ${recentWorkouts.length} sessions in the past week. Consider active recovery to optimize gains.`,
          insights,
        };
      }
    }
  }
  
  // Analyze imbalances using weighted values
  const { neglected, overtrained } = findImbalances(balance);
  
  // Generate recommendation based on imbalances
  if (neglected.length > 0) {
    return generateNeglectedRecommendation(neglected, locations, balance, insights);
  }
  
  if (overtrained.length > 0) {
    const overtrainedIntensities = overtrained.map(g => `${g} (${balance[g].toFixed(1)})`);
    return {
      type: "insight",
      title: "Training balance check",
      description: `Your ${overtrained.join(" and ")} training is significantly higher than other areas. Consider a session focusing on ${getOppositeGroups(overtrained).join(" or ")} to balance your overall load.`,
      insights,
    };
  }
  
  // Check if cardio vs strength is imbalanced
  const cardioIntensity = balance.cardio;
  const strengthIntensity = (balance.push + balance.pull) / 2;
  
  if (cardioIntensity > strengthIntensity * 2 && strengthIntensity < 2) {
    return {
      type: "workout",
      title: "Add some strength work",
      description: `Your cardio conditioning is strong (${cardioIntensity.toFixed(1)} intensity), but your pushing/pulling work is light. A CrossFit or strength session would round out your training.`,
      suggestedWorkout: {
        type: "crossfit",
        location: locations.find(l => l.type === "box")?.name || "Gain Station",
        focus: ["push", "pull"],
      },
      insights,
    };
  }
  
  if (strengthIntensity > cardioIntensity * 2 && cardioIntensity < 1.5) {
    return {
      type: "workout",
      title: "Cardio boost recommended",
      description: `You've been hitting the weights hard, but cardio is lagging. A HIIT class or mountain bike ride would improve your overall conditioning.`,
      suggestedWorkout: {
        type: "pilates",
        location: "Pure Yoga",
        focus: ["cardio"],
      },
      insights,
    };
  }
  
  // Default: well-balanced training
  return {
    type: "workout",
    title: "Well-balanced training!",
    description: `Your training balance score is ${balanceScore}%. You're hitting all muscle groups with good intensity distribution. Keep up the variety!`,
    suggestedWorkout: {
      type: "crossfit",
      location: locations.find(l => l.type === "box")?.name || "Gain Station",
      focus: ["push", "pull"],
    },
    insights,
  };
}

function generateNeglectedRecommendation(
  neglected: MuscleGroup[],
  locations: Location[],
  balance: Record<MuscleGroup, number>,
  insights: AIRecommendation["insights"]
): AIRecommendation {
  const primary = neglected[0];
  const intensity = balance[primary];
  const intensityDesc = formatIntensity(intensity);
  
  // Recommend based on neglected group with intensity context
  if (primary === "pull") {
    return {
      type: "workout",
      title: "Pull movements needed",
      description: `Your pull intensity is ${intensityDesc} (${intensity.toFixed(1)}). A pull-focused CrossFit session would significantly improve your balance.`,
      suggestedWorkout: {
        type: "crossfit",
        location: locations.find(l => l.type === "box")?.name || "Gain Station",
        focus: ["pull"],
        exercises: ["Pull-ups", "Rows", "Deadlifts", "Face pulls"],
      },
      insights,
    };
  }
  
  if (primary === "push") {
    return {
      type: "workout",
      title: "Push movements needed",
      description: `Your push intensity is ${intensityDesc} (${intensity.toFixed(1)}). Time to add some pressing movements to balance your pulling work.`,
      suggestedWorkout: {
        type: "crossfit",
        location: locations.find(l => l.type === "box")?.name || "Gain Station",
        focus: ["push"],
        exercises: ["Bench press", "Overhead press", "Push-ups", "Dips"],
      },
      insights,
    };
  }
  
  if (primary === "cardio") {
    return {
      type: "workout",
      title: "Cardio conditioning gap",
      description: `Your cardio intensity is ${intensityDesc} (${intensity.toFixed(1)}). A HIIT class or mountain bike ride would significantly boost your conditioning.`,
      suggestedWorkout: {
        type: "mtb",
        location: "Local Trails",
        focus: ["cardio", "lower"],
      },
      insights,
    };
  }
  
  if (primary === "core") {
    return {
      type: "workout",
      title: "Core strength gap",
      description: `Your core intensity is ${intensityDesc} (${intensity.toFixed(1)}). A Pilates class would strengthen your foundation and improve performance in all other movements.`,
      suggestedWorkout: {
        type: "pilates",
        location: locations.find(l => l.type === "studio")?.name || "Pure Yoga",
        focus: ["core"],
      },
      insights,
    };
  }
  
  // Default for lower/upper
  return {
    type: "workout",
    title: `${primary.charAt(0).toUpperCase() + primary.slice(1)} body focus needed`,
    description: `Your ${primary} body intensity is ${intensityDesc} (${intensity.toFixed(1)}). Consider a session targeting this area.`,
    suggestedWorkout: {
      type: primary === "lower" ? "pilates" : "strength",
      location: primary === "lower" 
        ? locations.find(l => l.type === "studio")?.name 
        : locations.find(l => l.type === "box")?.name,
      focus: [primary],
    },
    insights,
  };
}

function countConsecutiveWorkoutDays(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i - 1].date);
    const previous = new Date(sorted[i].date);
    const diffDays = Math.floor(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays <= 1) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}

function getOppositeGroups(groups: MuscleGroup[]): MuscleGroup[] {
  const opposites: Record<MuscleGroup, MuscleGroup[]> = {
    push: ["pull"],
    pull: ["push"],
    upper: ["lower"],
    lower: ["upper"],
    cardio: ["core"],
    core: ["cardio"],
  };
  
  const result: MuscleGroup[] = [];
  for (const group of groups) {
    result.push(...opposites[group]);
  }
  return [...new Set(result)];
}

// Get a safe workout recommendation based on injuries
function getSafeWorkoutRecommendation(
  injuryMods: { avoidGroups: MuscleGroup[]; alternatives: string[] },
  injuryRecs: { recommended: string[]; avoid: string[]; modifications: string[] },
  locations: Location[]
): { type: string; location?: string; focus?: string[]; exercises?: string[] } {
  const avoidGroups = new Set(injuryMods.avoidGroups);
  
  // If lower body is affected, recommend upper body
  if (avoidGroups.has("lower") || avoidGroups.has("cardio")) {
    return {
      type: "strength",
      location: locations.find(l => l.type === "box")?.name || "Gain Station",
      focus: ["upper", "push", "pull"].filter(g => !avoidGroups.has(g as MuscleGroup)),
      exercises: ["Upper body focus", "Seated exercises", "Core work"],
    };
  }
  
  // If upper body is affected, recommend lower body or cardio
  if (avoidGroups.has("push") || avoidGroups.has("pull") || avoidGroups.has("upper")) {
    return {
      type: "pilates",
      location: locations.find(l => l.type === "studio")?.name || "Pure Yoga",
      focus: ["lower", "core"].filter(g => !avoidGroups.has(g as MuscleGroup)),
      exercises: ["Lower body focus", "Light cardio", "Core work"],
    };
  }
  
  // Default: light activity
  return {
    type: "pilates",
    location: locations.find(l => l.type === "studio")?.name,
    focus: ["core"],
    exercises: ["Light stretching", "Gentle movement", "Recovery focus"],
  };
}
