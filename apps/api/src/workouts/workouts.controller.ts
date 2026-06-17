import { Request, Response } from "express";
import { createWorkoutSchema, updateWorkoutStepsSchema, WorkoutStatus, WorkoutType, WorkoutWithDetails } from "./workouts.schema.js";
import * as workoutsService from "./workouts.service.js";

const VALID_WORKOUT_TYPES = ["running", "cycling", "swimming"] as const;
const VALID_STATUSES = ["planned", "completed", "skipped"] as const;

export async function createWorkout(req: Request, res: Response) {
  try {
    /* Validate the request body against the user schema */
    const input = createWorkoutSchema.safeParse(req.body);

    // Reject the request if validation fails
    if (!input.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: input.error,
      });
    }

    /* Insert the validated user into the database */
    const workout = await workoutsService.createWorkout(input.data, req.session.userId);

    res.status(201).json({
      data: workout,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to create workout",
      debugMessage: err.message
    });
  }
}

export async function getWorkouts(req: Request, res: Response) {
  console.log("[getWorkouts] Request received");
  console.log("[getWorkouts] query:", req.query);
  
  const userId = req.session.userId;

  try {
    let workouts
    
    const rawStatus = req.query.status as string | undefined;
    const rawWorkoutType = req.query.workout_type as string | undefined;
    const earliestDate = req.query.earliest_date
      ? new Date(req.query.earliest_date as string)
      : undefined;
    const latestDate = req.query.latest_date
      ? new Date(req.query.latest_date as string)
      : undefined;

    // Validate status if provided
    if (rawStatus && !VALID_STATUSES.includes(rawStatus as WorkoutStatus)) {
      return res.status(400).json({ error: `Invalid status: ${rawStatus}` });
    }

    // Validate workout type if provided
    if (rawWorkoutType && !VALID_WORKOUT_TYPES.includes(rawWorkoutType as WorkoutType)) {
      return res.status(400).json({ error: `Invalid workout type: ${rawWorkoutType}` });
    }

    const status = rawStatus as WorkoutStatus | undefined;
    const workoutType = rawWorkoutType as WorkoutType | undefined;
    
    if (status) {
      workouts = await workoutsService.getAllUserWorkoutsByStatus(userId, status);
    } else if (workoutType) {
      workouts = await workoutsService.getAllUserWorkoutsByType(userId, workoutType);
    } else if (earliestDate || latestDate) {
      workouts = await workoutsService.getAllUserWorkoutsByDateRange(userId, earliestDate, latestDate);
    } else {
      workouts = await workoutsService.getAllUserWorkouts(userId);
    }
    return res.status(200).json({
      data: workouts
    });
  } catch (err) {
    console.error(err);
    
    res.status(500).json({
      error: "Failed to fetch workouts",
    });
  }
}

export async function getWorkoutInformation(req: Request, res: Response) {  
  try {
    let workoutId = req.params.id;
    if (Array.isArray(workoutId)) {
      workoutId = workoutId[0];
    }

    const workout = await workoutsService.getWorkoutById(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    const workoutDetails = await workoutsService.getWorkoutDetailsById(workoutId, workout.workout_type);
    const workoutSteps = await workoutsService.getWorkoutStepsById(workoutId);

    return res.status(200).json({
      data: {
        ...workout,
        details: workoutDetails,
        steps: workoutSteps,
      }
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to fetch workout",
    });
  }
}

export async function updateWorkout(req: Request, res: Response) {
  try {
    /* Validate the request body against the user schema */
    const input = createWorkoutSchema.safeParse(req.body);
    const userId = req.session.userId;
    let workoutId = req.params.id;
    
    if (Array.isArray(workoutId)) {
      workoutId = workoutId[0];
    }

    // Reject the request if validation fails
    if (!input.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: input.error,
      });
    }

    const existing = await workoutsService.getWorkoutById(workoutId);

    if (!existing) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (existing.workout_type !== input.data.workout_type) {
      return res.status(400).json({ error: "Workout type cannot be changed. Create a new workout instead." });
    }

    const workout = await workoutsService.updateWorkout(workoutId, userId, input.data);

    res.status(200).json({
      data: workout,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to update workout",
    });
  }
}

export async function updateWorkoutStatus(req: Request, res: Response) {
  try {
    const rawStatus = req.body.status as string | undefined;
    if (!rawStatus) {
      return res.status(400).json({ error: "status is required" });
    }
    if (!VALID_STATUSES.includes(rawStatus as WorkoutStatus)) {
      return res.status(400).json({ error: `Invalid status: ${rawStatus}` });
    }
    const newStatus = rawStatus as WorkoutStatus;
    const userId = req.session.userId;
    let workoutId = req.params.id;
    
    if (Array.isArray(workoutId)) {
      workoutId = workoutId[0];
    }

    const existing = await workoutsService.getWorkoutById(workoutId);

    if (!existing) {
      return res.status(404).json({ error: "Workout not found" });
    }

    const workout = await workoutsService.updateWorkoutStatus(workoutId, userId, newStatus);

    res.status(200).json({
      data: workout,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to update workout status",
    });
  }
}

export async function deleteWorkout(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    let workoutId = req.params.id;
    if (Array.isArray(workoutId)) {
      workoutId = workoutId[0];
    }

    await workoutsService.deleteWorkout(workoutId, userId);

    return res.status(204).send();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to delete workout",
    });
  }
}

export async function updateWorkoutSteps(req: Request, res: Response) {
  try {
    const input = updateWorkoutStepsSchema.safeParse(req.body);
    const userId = req.session.userId;
    let workoutId = req.params.id;

    if (Array.isArray(workoutId)) {
      workoutId = workoutId[0];
    }

    if (!input.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: input.error,
      });
    }

    const steps = await workoutsService.updateWorkoutSteps(workoutId, userId, input.data.steps);

    return res.status(200).json({
      data: steps,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to update workout steps",
    });
  }
}