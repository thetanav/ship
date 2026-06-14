import { isDevelopment } from "@/lib/env";

export function log(event: string, meta?: Record<string, unknown>): void {
  const entry = {
    event,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (isDevelopment()) {
    console.log(JSON.stringify(entry, null, 2));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export function logError(
  event: string,
  error: unknown,
  meta?: Record<string, unknown>,
): void {
  const entry = {
    event,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...meta,
  };

  if (isDevelopment()) {
    console.error(JSON.stringify(entry, null, 2));
  } else {
    console.error(JSON.stringify(entry));
  }
}
