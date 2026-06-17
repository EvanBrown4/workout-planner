// web/src/api/workouts.ts
import { CreateWorkoutInput, UpdateWorkoutStepsInput } from "../../../api/src/workouts/workouts.schema";
import { request } from "./api";

const API_BASE = import.meta.env.VITE_API_URL;

// GET /v1/workouts/
export function getWorkouts(params?: {
  status?: "planned" | "completed" | "skipped";
  workout_type?: "running" | "cycling" | "swimming";
  earliest_date?: string;
  latest_date?: string;
}) {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();
  return request(`/v1/workouts/${query ? `?${query}` : ""}`);
}

// GET /v1/workouts/:id
export function getWorkout(workoutId: string) {
  return request(`/v1/workouts/${workoutId}`);
}

// POST /v1/workouts/
export function createWorkout(input: CreateWorkoutInput) {
  return request("/v1/workouts/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PUT /v1/workouts/:id
export function updateWorkout(workoutId: string, input: CreateWorkoutInput) {
  return request(`/v1/workouts/${workoutId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// PATCH /v1/workouts/:id
export function updateWorkoutStatus(workoutId: string, status: "planned" | "completed" | "skipped") {
  return request(`/v1/workouts/${workoutId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// PUT /v1/workouts/:id/steps
export function updateWorkoutSteps(workoutId: string, input: UpdateWorkoutStepsInput) {
  return request(`/v1/workouts/${workoutId}/steps`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// DELETE /v1/workouts/:id
export function deleteWorkout(workoutId: string) {
  return request(`/v1/workouts/${workoutId}`, {
    method: "DELETE",
  });
}