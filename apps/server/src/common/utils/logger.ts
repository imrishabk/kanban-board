const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info(data: unknown, message?: string) {
    if (isDev) {
      console.info(message ? `[INFO] ${message}` : (data ?? ""));
    }
  },
  warn(data: unknown, message?: string) {
    if (isDev) {
      console.warn(message ? `[WARN] ${message}` : (data ?? ""));
    }
  },
  error(data: unknown, message?: string) {
    if (isDev) {
      console.error(message ? `[ERROR] ${message}` : (data ?? ""));
    }
  },
};
