// workouts.docs.ts
import { createWorkoutSchema } from "./workouts.schema.js";

/*
 * OpenAPI documentation for the /v1/workouts route.
 */
export const workoutsDocs = {
  "/v1/workouts/": {
    get: {
      tags: ["Workouts"],
      summary: "Get all user's workouts or search by status, type, or date range",

      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          description: "Filter workouts by status",
          schema: {
            type: "string",
            enum: ["planned", "completed", "skipped"],
            example: "planned",
          },
        },
        {
          name: "workout_type",
          in: "query",
          required: false,
          description: "Filter workouts by workout type",
          schema: {
            type: "string",
            enum: ["running", "cycling", "swimming"],
            example: "running",
          },
        },
        {
          name: "earliest_date",
          in: "query",
          required: false,
          description: "Filter workouts by earliest date",
          schema: {
            type: "string",
            format: "date",
            example: "2026-01-23",
          },
        },
        {
          name: "latest_date",
          in: "query",
          required: false,
          description: "Filter workouts by latest date",
          schema: {
            type: "string",
            format: "date",
            example: "2026-06-01",
          },
        },
      ],

      responses: {
        200: {
          description: "Workouts returned successfully",
        },
        400: {
          description: "Invalid status or workout type",
        },
        500: {
          description: "Failed to fetch workouts",
        },
      },
    },

    post: {
      tags: ["Workouts"],
      summary: "Create a new workout",

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: createWorkoutSchema,
          },
        },
      },

      responses: {
        201: {
          description: "Workout created successfully",
        },
        400: {
          description: "Validation failed",
        },
        500: {
          description: "Failed to create workout",
        },
      },
    },
  },

  "/v1/workouts/{id}": {
    get: {
      tags: ["Workouts"],
      summary: "Get a specific workout by ID",

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Workout UUID",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],

      responses: {
        200: {
          description: "Workout returned successfully",
        },
        404: {
          description: "Workout not found",
        },
        500: {
          description: "Failed to fetch workout",
        },
      },
    },
    put: {
      tags: ["Workouts"],
      summary: "Update an existing workout by ID",

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Workout UUID",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: createWorkoutSchema,
          },
        },
      },

      responses: {
        200: {
          description: "Workout updated successfully",
        },
        400: {
          description: "Validation failed, or workout type mismatch",
        },
        404: {
          description: "Workout not found",
        },
        500: {
          description: "Failed to update workout",
        },
      },
    },
    patch: {
      tags: ["Workouts"],
      summary: "Update the status of a workout by ID",

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Workout UUID",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["planned", "completed", "skipped"],
                  example: "completed",
                },
              },
            },
          },
        },
      },

      responses: {
        200: {
          description: "Workout status updated successfully",
        },
        400: {
          description: "Missing or invalid status",
        },
        404: {
          description: "Workout not found",
        },
        500: {
          description: "Failed to update workout status",
        },
      },
    },
    delete: {
      tags: ["Workouts"],
      summary: "Delete a workout by ID",

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Workout UUID",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],

      responses: {
        204: {
          description: "Workout deleted successfully",
        },
        404: {
          description: "Workout not found",
        },
        500: {
          description: "Failed to delete workout",
        },
      },
    },
  },
  "/v1/workouts/{id}/steps": {
    put: {
      tags: ["Workouts"],
      summary: "Replace all steps for a workout",

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Workout UUID",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["steps"],
              properties: {
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["step_order", "step_type", "end_condition"],
                    properties: {
                      step_order: { type: "integer", minimum: 1 },
                      step_type: {
                        type: "string",
                        enum: ["warmup", "run", "recovery", "cooldown", "rest", "other"],
                      },
                      end_condition: {
                        type: "string",
                        enum: ["distance", "time", "manual"],
                      },
                      end_condition_value: {
                        type: "integer",
                        nullable: true,
                        description: "Meters if distance, seconds if time, null if manual",
                      },
                      target_type: {
                        type: "string",
                        enum: ["pace", "hr", "hr_zone"],
                        nullable: true,
                      },
                      target_value: { type: "integer", nullable: true },
                      notes: { type: "string", nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },

      responses: {
        200: {
          description: "Workout steps replaced successfully",
        },
        400: {
          description: "Validation failed",
        },
        404: {
          description: "Workout not found",
        },
        500: {
          description: "Failed to update workout steps",
        },
      },
    },
  },
};