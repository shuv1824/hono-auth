import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { signupValidator } from "./schemas/signup-schema";
import { getUserByEmail, getUserById, insertUser } from "./db/queries";
import { dbConn } from "./db/db";
import { cookieOpts, genenrateToken } from "./helper";
import { csrf } from "hono/csrf";
import { jwt } from "hono/jwt";
import { email } from "zod/v4";
import { use } from "hono/jsx";

const app = new Hono();

app
  .use("/api/*", csrf())
  .use(
    "/api/auth/*",
    jwt({ secret: process.env.JWT_SECRET!, cookie: "authToken" }),
  )
  .post("/api/signup", signupValidator, async (c) => {
    const db = dbConn();
    const { email, password } = c.req.valid("json");

    try {
      const userId = await insertUser(db, email, password);

      const token = await genenrateToken(userId);

      setCookie(c, "authToken", token, cookieOpts);

      return c.json({
        message: "User registered successfully",
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
  })
  .post("/api/login", signupValidator, async (c) => {
    const db = dbConn();
    const { email, password } = c.req.valid("json");

    try {
      const user = getUserByEmail(db, email);
      if (!user) {
        return c.json({ errors: ["Invalid credentials"] }, 401);
      }

      const passwordMatch = await Bun.password.verify(
        password,
        user.password_hash,
      );
      if (!passwordMatch) {
        return c.json({ errors: ["Invalid credentials"] }, 401);
      }

      const token = await genenrateToken(user.id);

      setCookie(c, "authToken", token, cookieOpts);

      return c.json({
        message: "Login successful",
        user: { id: user.id, email: email },
      });
    } catch (error) {
      console.log(error);
      return c.json({ errors: ["Internal server error"] }, 500);
    }
  })
  .post("/api/logout", async (c) => {
    deleteCookie(c, "authToken", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      httpOnly: true,
    });

    return c.json({ message: "Logout successful" });
  })
  .get("/api/auth/me", async (c) => {
    const db = dbConn();
    const payload = c.get("jwtPayload");

    try {
      const user = getUserById(db, payload.sub);
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json(
        {
          id: user.id,
          email: user.email,
        },
        200,
      );
    } catch (error) {
      console.log("Error fetching user data: ", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default app;
