import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import app from ".";
import { createTestDb } from "./test/test-db";
import { Database } from "bun:sqlite";
import {
  loginRequest,
  logoutRequest,
  signupRequest,
} from "./test/test-helpers";
import { error } from "console";

let db: Database;

mock.module("../src/db/db.ts", () => {
  return {
    dbConn: () => db,
  };
});

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

describe("signup endpoint", () => {
  it("should sign up a user", async () => {
    const request = signupRequest();
    const response = await app.fetch(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      message: "User registered successfully",
      user: { id: expect.any(String), email: "test@test.com" },
    });

    const cookies = response.headers.get("set-cookie");
    expect(cookies).toMatch(/authToken=/);
  });

  it("should return 409 if user already exists", async () => {
    const request = signupRequest();
    const response = await app.fetch(request);

    expect(response.status).toBe(200);

    const request2 = signupRequest();
    const response2 = await app.fetch(request2);
    const json = await response2.json();

    expect(response2.status).toBe(409);
    expect(json).toEqual({
      errors: ["User already exists"],
    });
  });

  it("should return error if missing email and/or password", async () => {
    const request = signupRequest("", "");
    const response = await app.fetch(request);

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      errors: ["Invalid email", "Password must be at least 10 characters"],
    });
  });
});

describe("login endpoint", () => {
  it("should login a user", async () => {
    const request = signupRequest();
    await app.fetch(request);

    const request2 = loginRequest();
    const response2 = await app.fetch(request2);
    const json = await response2.json();

    expect(response2.status).toBe(200);
    expect(json).toEqual({
      message: "Login successful",
      user: { id: expect.any(String), email: "test@test.com" },
    });

    const cookies = response2.headers.get("set-cookie");
    expect(cookies).toMatch(/authToken=/);
  });

  it("should return 400 if email and/or password is missing", async () => {
    const request = loginRequest("", "");
    const response = await app.fetch(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      errors: ["Invalid email", "Password must be at least 10 characters"],
    });
  });

  it("should return 401 if password is incorrect", async () => {
    const request = signupRequest();
    await app.fetch(request);

    const request2 = loginRequest("test@test.com", "password456");
    const response2 = await app.fetch(request2);
    const json = await response2.json();

    expect(response2.status).toBe(401);
    expect(json).toEqual({
      errors: ["Invalid credentials"],
    });
  });
});

describe("logout endpoint", () => {
  it("should logout a user", async () => {
    const request = logoutRequest();
    const response = await app.fetch(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ message: "Logout successful" });

    const cookies = response.headers.get("set-cookie");
    expect(cookies).toMatch(/authToken=;/);
  });
});
