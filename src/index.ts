import { Hono } from "hono";
import { signupValidator } from "./schemas/signup-schema";
// import { dbConn } from "./db/db";

const app = new Hono();

app.post("/api/signup", signupValidator, (c) => {
  const { email, password } = c.req.valid("json");
  return c.text("Hello Hono!");
});

export default app;
