import { createDocument } from "zod-openapi";
import {usersDocs} from "../users/users.docs.js";
import {authDocs} from "../auth/auth.docs.js";
import { workoutsDocs } from "../workouts/workouts.docs.js";

export const openApiDocument = createDocument({
  openapi: "3.1.0",

  info: {
    title: "Workout API",
    version: "1.0.0",
    description: "Workout recommendation platform API",
  },

  paths: {
    ...usersDocs,
    ...authDocs,
    ...workoutsDocs,
  },
});