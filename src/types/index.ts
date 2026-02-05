export type WorkoutType = "pilates" | "crossfit" | "strength" | "mtb";

export type PilatesClassType = "hiit" | "pilates" | "sculpt";

export type CrossFitTag = "push" | "pull" | "upper" | "lower" | "cardio";

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  maxWeight?: number;      // Personal record / 1RM for this exercise
  percentageUsed?: number; // Percentage of max used (100, 90, 80, etc.)
  isMax?: boolean;         // Whether this was a max attempt
}

export interface WorkoutFormData {
  type: WorkoutType;
  date: Date;
  locationId?: string;
  duration?: number;
  notes?: string;
  // Pilates
  classType?: PilatesClassType;
  // CrossFit
  tags?: CrossFitTag[];
  // Strength
  exercises?: Exercise[];
  // MTB
  distance?: number;
  elevation?: number;
  calories?: number;
}

export interface Location {
  id: string;
  name: string;
  type: "studio" | "box" | "trail";
}

export interface Workout {
  id: string;
  userId: string;
  locationId?: string | null;
  date: Date;
  type: string;
  duration?: number | null;
  notes?: string | null;
  classType?: string | null;
  tags?: string | null;
  exercises?: string | null;
  distance?: number | null;
  elevation?: number | null;
  calories?: number | null;
  createdAt: Date;
  location?: Location | null;
}
