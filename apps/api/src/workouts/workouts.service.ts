import { pool } from "../db/pool.js";
import type { CreateWorkoutInput, WorkoutWithDetails } from "./workouts.schema.js";

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