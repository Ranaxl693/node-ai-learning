import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: error.issues.map(({ path, message }) => ({ path, message })),
      },
    });
    return;
  }
  const type =
    typeof error === "object" && error !== null && "type" in error
      ? error.type
      : undefined;
  if (type === "entity.parse.failed") {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON",
      },
    });
    return;
  }
  if (type === "entity.too.large") {
    res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body exceeds 16 KB",
      },
    });
    return;
  }
  // Do not log prompts, request bodies, credentials, or arbitrary upstream errors.
  req.log.error({ requestId: req.id }, "Unhandled request error");
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
};
