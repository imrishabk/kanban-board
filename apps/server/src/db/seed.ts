import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URI });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create SERVER user
  const serverUser = await prisma.users.upsert({
    where: { username: "SERVER" },
    update: {},
    create: {
      username: "SERVER",
      email: "server@kanban.local",
      password: "SERVER_NO_PASSWORD", // This user should never be able to login
      displayName: "System",
      role: Role.SERVER,
      isActive: true,
    },
  });

  console.log("SERVER user created/updated:", serverUser.id);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
