import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { envSchema } from "../src/config/env.js";

const app = createApp();
test("health and security headers", async () => {
  const res = await request(app).get("/health").expect(200);
  assert.equal(res.body.status, "ok");
  assert.ok(res.headers["x-request-id"]);
  assert.equal(res.headers["x-content-type-options"], "nosniff");
  assert.equal(res.headers["x-powered-by"], undefined);
});
test("chat is explicitly mocked and trims input", async () => {
  const res = await request(app)
    .post("/api/chat")
    .send({ message: " Hello " })
    .expect(200);
  assert.equal(res.body.mode, "mock");
  assert.match(res.body.reply, /"Hello"/);
});
test("rejects invalid messages", async () => {
  for (const body of [
    {},
    { message: " " },
    { message: 123 },
    { message: "a".repeat(2001) },
    { message: "Hi", extra: true },
  ]) {
    const res = await request(app).post("/api/chat").send(body).expect(400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  }
});
test("malformed JSON has a safe response", async () => {
  const res = await request(app)
    .post("/api/chat")
    .set("Content-Type", "application/json")
    .send("{broken")
    .expect(400);
  assert.equal(res.body.error.code, "INVALID_JSON");
});
test("oversized body is rejected", async () => {
  await request(app)
    .post("/api/chat")
    .send({ message: "x".repeat(17000) })
    .expect(413);
});
test("unknown route returns JSON 404", async () => {
  const res = await request(app).get("/missing").expect(404);
  assert.equal(res.body.error.code, "NOT_FOUND");
});
test("rate limit allows 30 requests then rejects; health stays available", async () => {
  const limitedApp = createApp();
  for (let i = 0; i < 30; i++)
    await request(limitedApp)
      .post("/api/chat")
      .send({ message: "hi" })
      .expect(200);
  await request(limitedApp)
    .post("/api/chat")
    .send({ message: "hi" })
    .expect(429);
  await request(limitedApp).get("/health").expect(200);
});
test("environment defaults and invalid port", () => {
  assert.equal(envSchema.parse({}).PORT, 3000);
  assert.equal(envSchema.safeParse({ PORT: "invalid" }).success, false);
  assert.equal(envSchema.safeParse({ PORT: 70000 }).success, false);
});
