import { pool } from "../db/pool.js";
import type { CreateWorkoutInput, WorkoutWithDetails, WorkoutStatus, WorkoutType, Workout } from "./workouts.schema.js";

export async function createWorkout(input: CreateWorkoutInput, userId: string): Promise<WorkoutWithDetails> {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const workoutResult = await client.query(
      `
        INSERT INTO workouts
        (user_id, workout_type, title, scheduled_date, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
      [userId, input.workout_type, input.title, input.scheduled_date, input.notes, input.status]
    )
    const workout = workoutResult.rows[0]

    let details;
    if (input.workout_type === "running") {
      const r = await client.query(
        `
          INSERT INTO workout_details_running
          (workout_id, target_distance_meters, target_duration_seconds, target_pace_sec_per_m)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `,
        [workout.id, input.details.target_distance_meters, input.details.target_duration_seconds, input.details.target_pace_sec_per_m]
      )
      details = r.rows[0];
    } else if (input.workout_type === "cycling") {
      const r = await client.query(
        `
          INSERT INTO workout_details_cycling
          (workout_id, target_distance_meters, target_duration_seconds, target_pace_sec_per_m, bike_type)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `,
        [workout.id, input.details.target_distance_meters, input.details.target_duration_seconds, input.details.target_pace_sec_per_m, input.details.bike_type]
      );
      details = r.rows[0];
    } else if (input.workout_type === "swimming") {
      const r = await client.query(
        `
          INSERT INTO workout_details_swimming
          (workout_id, target_distance_meters, target_duration_seconds, target_pace_sec_per_m, pool_length_meters, stroke)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
        [workout.id, input.details.target_distance_meters, input.details.target_duration_seconds, input.details.target_pace_sec_per_m, input.details.pool_length_meters, input.details.stroke]
      );
      details = r.rows[0];
    }

    let steps = []
    if (input.steps.length > 0) {
      for (const step of input.steps) {
        const r = await client.query(
          `
            INSERT INTO workout_steps
            (workout_id, step_order, step_type, end_condition, end_condition_value, target_type, target_value, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `,
          [workout.id, step.step_order, step.step_type, step.end_condition, step.end_condition_value, step.target_type, step.target_value, step.notes]
        );
        steps.push(r.rows[0]);
      }
    }

    await client.query("COMMIT");

    return {...workout, details, steps}

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getAllUserWorkouts(user_id: string) {
  const result = await pool.query(
    `
      SELECT id, user_id, title, workout_type, scheduled_date, notes, status, created_at, updated_at
      FROM workouts
      WHERE user_id = $1
    `,
    [user_id]
  )
  return result.rows ?? null;
}

export async function getAllUserWorkoutsByStatus(user_id: string, status: WorkoutStatus) {
  const result = await pool.query(
    `
      SELECT id, user_id, title, workout_type, scheduled_date, notes, status, created_at, updated_at
      FROM workouts
      WHERE user_id = $1
      AND status = $2;
    `,
    [user_id, status]
  )
  return result.rows ?? null;
}

export async function getAllUserWorkoutsByType(user_id: string, workout_type: WorkoutType) {
  const result = await pool.query(
    `
      SELECT id, user_id, title, workout_type, scheduled_date, notes, status, created_at, updated_at
      FROM workouts
      WHERE user_id = $1
      AND workout_type = $2
    `,
    [user_id, workout_type]
  )

  return result.rows ?? null;
}

export async function getAllUserWorkoutsByDateRange(user_id: string, earliest_date: Date = new Date(0), latest_date: Date = new Date()) {
  const result = await pool.query(
    `
      SELECT id, user_id, title, workout_type, scheduled_date, notes, status, created_at, updated_at
      FROM workouts
      WHERE user_id = $1
      AND created_at BETWEEN $2 AND $3
    `,
    [user_id, earliest_date, latest_date]
  )

  return result.rows ?? null;
}

export async function getWorkoutById(workoutid: string) {
  const result = await pool.query(
    `
      SELECT id, user_id, title, workout_type, scheduled_date, notes, status, created_at, updated_at
      FROM workouts
      WHERE id = $1
    `,
    [workoutid]
  )

  return result.rows[0] ?? null;
}

export async function getWorkoutDetailsById(workoutid: string, workout_type: WorkoutType) {
  let result;
  switch(workout_type) {
    case "running":
      result = await pool.query(
        `
          SELECT id, workout_id, target_distance_meters, target_duration_seconds, target_pace_per_m
          FROM workout_details_running
          WHERE workout_id = $1
        `,
        [workoutid]
      );
      break;
    case "cycling":
      result = await pool.query(
        `
          SELECT id, workout_id, target_distance_meters, target_duration_seconds, target_pace_per_m, bike_type
          FROM workout_details_cycling
          WHERE workout_id = $1
        `,
        [workoutid]
      );
      break;
    case "swimming":
      result = await pool.query(
        `
          SELECT id, workout_id, target_distance_meters, target_duration_seconds, target_pace_per_m, pool_length_meters, stroke
          FROM workout_details_swimming
          WHERE workout_id = $1
        `,
        [workoutid]
      );
      break;
  }
  return result.rows[0] ?? null;
}

export async function getWorkoutStepsById(workoutid: string) {
  const result = await pool.query(
    `
      SELECT id, workout_id, step_order, step_type, end_condition, end_condition_value, target_type, target_value, notes
      FROM workout_steps
      WHERE workout_id = $1
    `,
    [workoutid]
  );

  return result.rows ?? null;
}

export async function updateWorkout(workoutId: string, userId: string, newWorkout: CreateWorkoutInput): Promise<WorkoutWithDetails> {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const workoutResult = await client.query(
      `
        UPDATE workouts
        SET workout_type = $1, title = $2, scheduled_date = $3, notes = $4, status = $5, updated_at = NOW()
        WHERE id = $6 AND user_id = $7
        RETURNING *;
      `,
      [newWorkout.workout_type, newWorkout.title, newWorkout.scheduled_date, newWorkout.notes, newWorkout.status, workoutId, userId]
    )

    if (workoutResult.rowCount === 0) {
      throw new Error("Workout not found or unauthorized");
    }

    const workout = workoutResult.rows[0];

    let details;
    if (newWorkout.workout_type === "running") {
      const r = await client.query(
        `
          UPDATE workout_details_running
          SET target_distance_meters = $1, target_duration_seconds = $2, target_pace_sec_per_m = $3
          WHERE workout_id = $4
          RETURNING *
        `,
        [newWorkout.details.target_distance_meters, newWorkout.details.target_duration_seconds, newWorkout.details.target_pace_sec_per_m, workout.id]
      )
      details = r.rows[0];
    } else if (newWorkout.workout_type === "cycling") {
      const r = await client.query(
        `
          UPDATE workout_details_cycling
          SET target_distance_meters = $1, target_duration_seconds = $2, target_pace_sec_per_m = $3, bike_type = $4
          WHERE workout_id = $5
          RETURNING *
        `,
        [newWorkout.details.target_distance_meters, newWorkout.details.target_duration_seconds, newWorkout.details.target_pace_sec_per_m, newWorkout.details.bike_type, workout.id]
      );
      details = r.rows[0];
    } else if (newWorkout.workout_type === "swimming") {
      const r = await client.query(
        `
          UPDATE workout_details_swimming
          SET target_distance_meters = $1, target_duration_seconds = $2, target_pace_sec_per_m = $3, pool_length_meters = $4, stroke = $5
          WHERE workout_id = $6
          RETURNING *
        `,
        [newWorkout.details.target_distance_meters, newWorkout.details.target_duration_seconds, newWorkout.details.target_pace_sec_per_m, newWorkout.details.pool_length_meters, newWorkout.details.stroke, workout.id]
      );
      details = r.rows[0];
    }

    await client.query(`DELETE FROM workout_steps WHERE workout_id = $1`, [workout.id]);

    let steps = []

    if (newWorkout.steps.length > 0) {
      for (const step of newWorkout.steps) {
        const r = await client.query(`
          INSERT INTO workout_steps
          (workout_id, step_order, step_type, end_condition, end_condition_value, target_type, target_value, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [workout.id, step.step_order, step.step_type, step.end_condition, step.end_condition_value, step.target_type, step.target_value, step.notes]);
        steps.push(r.rows[0]);
      }
    }
    await client.query("COMMIT");

    return {...workout, details, steps}

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateWorkoutStatus(workoutId: string, userId: string, newStatus: WorkoutStatus) {
  const workoutResult = await pool.query(
    `
      UPDATE workouts
      SET status = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `,
    [newStatus, workoutId, userId]
  )

  if (workoutResult.rowCount === 0) {
    throw new Error("Workout not found or unauthorized");
  }

  const workout = workoutResult.rows[0];

  return workout
}

export async function deleteWorkout(workoutId: string, userId: string): Promise<string> {
  await pool.query(
    `DELETE FROM workouts WHERE id = $1 AND user_id = $2`,
    [workoutId, userId]
  );

  return workoutId;
}