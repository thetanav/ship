type LogData = Record<string, unknown>;

export function log(event: string, data: LogData = {}): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  console.info(JSON.stringify({ event, ...data }));
}
