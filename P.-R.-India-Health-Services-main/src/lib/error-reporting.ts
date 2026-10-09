/**
 * Application Error Reporting Utility
 * Standard client-side runtime error handler for TanStack Router boundary.
 */

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  if (import.meta.env?.DEV) {
    console.error("[Runtime Error]", message, context);
  }
}
