import { type DotenvConfigOutput, config } from "dotenv";

export function loadEnvironmentVariable() {
  const result: DotenvConfigOutput = config();
  if (result.error) {
    console.error(`Failed to load .env file: ${result.error}`);
    process.exit(1);
  }
}
