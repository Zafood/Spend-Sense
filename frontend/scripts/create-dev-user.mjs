// For LOCAL DEVELOPMENT ONLY. No real accounts or password credentials are created.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const user = await prisma.user.upsert({
    where: { email: "dev-only@spend-sense.invalid" },
    create: { email: "dev-only@spend-sense.invalid" },
    update: {},
  });
  console.log(`Add DEV_USER_ID=${user.id} to frontend/.env.local`);
} finally {
  await prisma.$disconnect();
}
