import { z } from "zod";

export type WorkoutType = "running" | "cycling" | "swimming";

export type WorkoutStatus = "planned" | "completed" | "skipped";

export type StepType = "warmup" | "run" | "recovery" | "cooldown" | "rest" | "other";

export type TargetType = "pace" | "hr" | "hr_zone";

export type EndCondition = "distance" | "time" | "manual";

export type BikeType = "road" | "mountain" | "indoor" | "gravel";

export type Stroke = "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "mixed";

export interface Workout {
  id: string;
  user_id: string;
  workout_type: WorkoutType;
  title: string;
  scheduled_date: string | null; // DATE from Postgres — keep as ISO string, not Date
  notes: string | null;          // nullable in DB
  status: WorkoutStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkoutDetailsRunning {
  id: string;
  workout_id: string;
  target_distance_meters: number | null;
  target_duration_seconds: number | null;
  target_pace_sec_per_m: number | null;
}

export interface WorkoutDetailsCycling {
  id: string;
  workout_id: string;
  target_distance_meters: number | null;
  target_duration_seconds: number | null;
  target_pace_sec_per_m: number | null;
  bike_type: BikeType | null;
}

export interface WorkoutDetailsSwimming {
  id: string;
  workout_id: string;
  target_distance_meters: number | null;
  target_duration_seconds: number | null;
  target_pace_sec_per_m: number | null;
  pool_length_meters: number | null;
  stroke: Stroke | null;
}

export interface WorkoutStep {
  id: string;
  workout_id: string;
  step_order: number;
  step_type: StepType;
  end_condition: EndCondition;
  end_condition_value: number | null; // null when end_condition is 'manual'
  target_type: TargetType | null;
  target_value: number | null;
  notes: string | null;
}

// --- Composed types ---

/** A workout with its type-specific details and ordered steps, as returned by GET /workouts/:id */
export type WorkoutWithDetails =
  | (Workout & { workout_type: "running";  details: WorkoutDetailsRunning;  steps: WorkoutStep[] })
  | (Workout & { workout_type: "cycling";  details: WorkoutDetailsCycling;  steps: WorkoutStep[] })
  | (Workout & { workout_type: "swimming"; details: WorkoutDetailsSwimming; steps: WorkoutStep[] });

// --- Zod schemas ---

const workoutStepSchema = z.object({
  step_order: z.number().int().positive(),
  step_type: z.enum(["warmup", "active", "interval", "recovery", "cooldown", "rest"]),
  end_condition: z.enum(["distance", "time", "manual"]),
  end_condition_value: z.number().int().positive().nullable(),
  target_type: z.enum(['pace', "hr", "hr_zone"]).nullable(),
  target_value: z.number().int().positive().nullable(),
  notes: z.string().nullable(),
}).refine(
  (s) => s.end_condition === "manual" ? s.end_condition_value === null : s.end_condition_value !== null,
  { message: "end_condition_value must be null for manual steps and set for distance/time steps" }
).refine(
  (s) => !(s.target_type !== null && s.target_value === null),
  { message: "target_value is required when target_type is set" }
);

const workoutDetailsRunningSchema = z.object({
  target_distance_meters: z.number().int().positive().nullable(),
  target_duration_seconds: z.number().int().positive().nullable(),
  target_pace_sec_per_m: z.number().int().positive().nullable(),
});

const workoutDetailsCyclingSchema = z.object({
  target_distance_meters: z.number().int().positive().nullable(),
  target_duration_seconds: z.number().int().positive().nullable(),
  target_pace_sec_per_m: z.number().int().positive().nullable(),
  bike_type: z.enum(["road", "mountain", "indoor", "gravel"]).nullable(),
});

const workoutDetailsSwimmingSchema = z.object({
  target_distance_meters: z.number().int().positive().nullable(),
  target_duration_seconds: z.number().int().positive().nullable(),
  target_pace_sec_per_m: z.number().int().positive().nullable(),
  pool_length_meters: z.number().nullable(),
  stroke: z.enum(["freestyle", "backstroke", "breaststroke", "butterfly", "mixed"]).nullable(),
});

/** Discriminated union — the details shape is enforced based on workout_type */
export const createWorkoutSchema = z.discriminatedUnion("workout_type", [
  z.object({
    workout_type: z.literal("running"),
    title: z.string().min(1),
    scheduled_date: z.string().date().nullable(),
    notes: z.string().nullable(),
    status: z.enum(["planned", "completed", "skipped"]),
    details: workoutDetailsRunningSchema,
    steps: z.array(workoutStepSchema),
  }),
  z.object({
    workout_type: z.literal("cycling"),
    title: z.string().min(1),
    scheduled_date: z.string().date().nullable(),
    notes: z.string().nullable(),
    status: z.enum(["planned", "completed", "skipped"]),
    details: workoutDetailsCyclingSchema,
    steps: z.array(workoutStepSchema),
  }),
  z.object({
    workout_type: z.literal("swimming"),
    title: z.string().min(1),
    scheduled_date: z.string().date().nullable(),
    notes: z.string().nullable(),
    status: z.enum(["planned", "completed", "skipped"]),
    details: workoutDetailsSwimmingSchema,
    steps: z.array(workoutStepSchema),
  }),
]);

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export const updateWorkoutStepsSchema = z.object({
  steps: z.array(workoutStepSchema),
});

export type UpdateWorkoutStepsInput = z.infer<typeof updateWorkoutStepsSchema>;