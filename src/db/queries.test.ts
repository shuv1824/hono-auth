import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { getUserByEmail, insertUser } from "./queries";
import { createTestDb } from "../test/test-db";

let db: Database;

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

describe("insertUser", () => {
  it("should insert a user into the database", async () => {
    const email = "j6E5t@example.com";
    const password = "password123";
    const userId = await insertUser(db, email, password);
    // console.log(userId);
    expect(userId).toBeDefined();
  });

  it("should throw an error if the user is already in the database", async () => {
    const email = "test@example.com";
    const password = "password123";
    await insertUser(db, email, password);

    try {
      await insertUser(db, email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-ignore
      expect(error.message).toMatch(/UNIQUE constraint failed/);
    }
  });

  it("should throw an error if the password is empty", async () => {
    const email = "test@example.com";
    const password = "";

    try {
      await insertUser(db, email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-ignore
      expect(error.message).toMatch(/password must not be empty/);
    }
  });
});

describe("getUserById", () => {
  it("returns a user by a given email", async () => {
    const email = "test@example.com";
    const password = "password123";
    await insertUser(db, email, password);

    const user = getUserByEmail(db, email);
    expect(user).toBeDefined();
  });

  it("returns null when there is no user by the email", async () => {
    const email = "test@example.com";

    const user = getUserByEmail(db, email);
    expect(user).toBeNull();
  });
});
