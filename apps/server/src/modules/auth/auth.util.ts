import crypto from "crypto";

export const authUtil = {
  generateToken() {
    return crypto.randomBytes(32).toString("hex");
  },
  hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  },
};
