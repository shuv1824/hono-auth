import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { signupValidator } from "./schemas/signup-schema";
import { insertUser } from "./db/queries";
import { dbConn } from "./db/db";
import { cookieOpts, genenrateToken } from "./helper";

const app = new Hono();

app.post("/api/signup", signupValidator, async (c) => {
  const db = dbConn();
  const { email, password } = c.req.valid("json");

  try {
    const userId = await insertUser(db, email, password);

    const token = await genenrateToken(userId);

    setCookie(c, "authToken", token, cookieOpts);

    return c.json({
      message: "User registerd successfully",
      user: { id: userId, email },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return c.json({ errors: ["User already exists"] }, 409);
    }

    console.log("signup error: ", error);
    return c.json({ errors: ["Internal server error"] }, 500);
  }
});

export default app;
