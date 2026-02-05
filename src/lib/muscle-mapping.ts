export type MuscleGroup = "push" | "pull" | "upper" | "lower" | "cardio" | "core";

export const MUSCLE_GROUPS: MuscleGroup[] = ["push", "pull", "upper", "lower", "cardio", "core"];

export const CROSSFIT_TAGS = ["push", "pull", "upper", "lower", "cardio"] as const;

export const PILATES_CLASS_TYPES = ["hiit", "pilates", "sculpt"] as const;

// Intensity weights: 0 = none, 0.25 = light, 0.5 = moderate, 0.75 = heavy, 1.0 = very heavy
type IntensityWeights = Record<MuscleGroup, number>;

// Workout intensity profiles
const WORKOUT_INTENSITIES: Record<string, IntensityWeights | ((tags?: string[]) => IntensityWeights)> = {
  // Pilates (default): light push/pull, moderate core, light-moderate lower
  pilates: {
    push: 0.25,
    pull: 0.25,
    upper: 0.25,
    lower: 0.5,
    cardio: 0.25,
    core: 0.75,
  },
  
  // HIIT: very high cardio, moderate core, light weights
  hiit: {
    push: 0.25,
    pull: 0.25,
    upper: 0.25,
    lower: 0.5,
    cardio: 1.0,
    core: 0.5,
  },
  
  // Sculpt: moderate weights, moderate core
  sculpt: {
    push: 0.5,
    pull: 0.5,
    upper: 0.5,
    lower: 0.5,
    cardio: 0.25,
    core: 0.5,
  },
  
  // CrossFit: heavy intensity based on selected tags, always high cardio
  crossfit: (tags?: string[]) => {
    const weights: IntensityWeights = {
      push: 0,
      pull: 0,
      upper: 0,
      lower: 0,
      cardio: 0.75, // CrossFit always has cardio component
      core: 0.5,    // CrossFit always engages core
    };
    
    if (tags) {
      for (const tag of tags) {
        if (tag in weights) {
          weights[tag as MuscleGroup] = 0.75; // Heavy intensity for selected tags
        }
      }
      // If cardio is explicitly selected, make it very high
      if (tags.includes("cardio")) {
        weights.cardio = 1.0;
      }
    }
    
    return weights;
  },
  
  // Strength/Weight Training: very heavy weights, no cardio
  strength: {
    push: 1.0,
    pull: 1.0,
    upper: 0.75,
    lower: 0.75,
    cardio: 0,
    core: 0.5,
  },
  
  // Mountain Biking: very high cardio, moderate-heavy lower, light upper
  mtb: {
    push: 0.25,
    pull: 0.25,
    upper: 0.25,
    lower: 0.75,
    cardio: 1.0,
    core: 0.5,
  },
};

// Get weighted intensity for a workout
export function getWorkoutIntensities(
  type: string,
  classType?: string,
  tags?: string[]
): IntensityWeights {
  // For pilates, use class type if available
  if (type === "pilates" && classType) {
    const profile = WORKOUT_INTENSITIES[classType];
    if (profile && typeof profile !== "function") {
      return profile;
    }
  }
  
  const profile = WORKOUT_INTENSITIES[type];
  
  if (!profile) {
    // Default: light everything
    return { push: 0.25, pull: 0.25, upper: 0.25, lower: 0.25, cardio: 0.25, core: 0.25 };
  }
  
  if (typeof profile === "function") {
    return profile(tags);
  }
  
  return profile;
}

// Legacy function for backwards compatibility - returns muscle groups hit
export function getWorkoutMuscleGroups(
  type: string,
  classType?: string,
  tags?: string[]
): MuscleGroup[] {
  const intensities = getWorkoutIntensities(type, classType, tags);
  // Return groups with any intensity > 0
  return (Object.entries(intensities) as [MuscleGroup, number][])
    .filter(([, intensity]) => intensity > 0)
    .map(([group]) => group);
}

// Calculate weighted muscle group balance from workouts
export function calculateMuscleBalance(
  workouts: Array<{
    type: string;
    classType?: string | null;
    tags?: string | null;
  }>
): Record<MuscleGroup, number> {
  const totals: Record<MuscleGroup, number> = {
    push: 0,
    pull: 0,
    upper: 0,
    lower: 0,
    cardio: 0,
    core: 0,
  };

  for (const workout of workouts) {
    const tags = workout.tags ? JSON.parse(workout.tags) : undefined;
    const intensities = getWorkoutIntensities(
      workout.type,
      workout.classType || undefined,
      tags
    );
    
    for (const group of MUSCLE_GROUPS) {
      totals[group] += intensities[group];
    }
  }

  // Round to 1 decimal place for cleaner display
  for (const group of MUSCLE_GROUPS) {
    totals[group] = Math.round(totals[group] * 10) / 10;
  }

  return totals;
}

// Find imbalanced muscle groups
export function findImbalances(
  balance: Record<MuscleGroup, number>
): { neglected: MuscleGroup[]; overtrained: MuscleGroup[] } {
  const values = Object.values(balance);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  const neglected: MuscleGroup[] = [];
  const overtrained: MuscleGroup[] = [];
  
  for (const [group, count] of Object.entries(balance) as [MuscleGroup, number][]) {
    if (count < avg * 0.5 && avg > 0) {
      neglected.push(group);
    } else if (count > avg * 1.5 && avg > 0) {
      overtrained.push(group);
    }
  }
  
  return { neglected, overtrained };
}
