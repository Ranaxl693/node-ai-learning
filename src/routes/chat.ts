import { Router } from "express";
import { z } from "zod";

const bodySchema = z
  .object({ message: z.string().trim().min(1).max(2000) })
  .strict();
export const chatRouter = Router();
chatRouter.post("/", async (req, res) => {
  const { message } = bodySchema.parse(req.body);
  // Learning stub: replace with a provider service when adding an LLM.
  res.json({
    mode: "mock",
    reply: `Mock response: you said "${message}". No AI provider is connected.`,
  });
});
