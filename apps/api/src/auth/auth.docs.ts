import { registerSchema, loginSchema } from "./auth.schema.js";

/*
 * OpenAPI documentation for the /v1/auth route.
 */
export const authDocs = {
  "/v1/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Get the currently authenticated user",

      responses: {
        200: {
          description: "Authenticated user returned successfully",
        },
        401: {
          description: "User is not authenticated",
        },
      },
    },
  },

  "/v1/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a new account",

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: registerSchema,
          },
        },
      },

      responses: {
        201: {
          description: "Account created successfully",
        },
        400: {
          description: "Validation failed",
        },
        409: {
          description: "User already exists",
        },
        500: {
          description: "Failed to create account",
        },
      },
    },
  },

  "/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Log in with email and password",

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: loginSchema,
          },
        },
      },

      responses: {
        200: {
          description: "Login successful",
        },
        400: {
          description: "Validation failed",
        },
        401: {
          description: "Invalid email or password",
        },
      },
    },
  },

  "/v1/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Log out the current user",

      responses: {
        200: {
          description: "Logout successful",
        },
        401: {
          description: "User is not authenticated",
        },
      },
    },
  },
};