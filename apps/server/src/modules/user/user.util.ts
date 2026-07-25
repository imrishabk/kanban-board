import bcrypt from "bcrypt";
import { FailedHash } from "../../common/errors/AppError";

export const userUtil = {
  async hashPassword(password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (err) {
      throw new FailedHash();
    }
  },
  async validateHash(hashedPassword: string, password: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
      throw new FailedHash();
    }
  },
};
