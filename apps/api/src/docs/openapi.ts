import { createDocument } from "zod-openapi";

export const openApiDocument = createDocument({
  openapi: "3.1.0",

  info: {
    title: "Workout API",
    version: "1.0.0",
    description: "Workout recommendation platform API",
  },

  paths: {
    
  },
});