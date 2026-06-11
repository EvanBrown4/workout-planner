export const registerSchema = {
  type: "object",
  required: ["email", "username", "first_name", "password"],
  properties: {
    email:      { type: "string", format: "email" },
    username:   { type: "string" },
    first_name: { type: "string" },
    last_name:  { type: "string" },
    password:   { type: "string", format: "password" },
  },
};

export const loginSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email:    { type: "string", format: "email" },
    password: { type: "string", format: "password" },
  },
};