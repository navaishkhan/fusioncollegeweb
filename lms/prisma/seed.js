import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ---------------------------------------------------
   UPDATE THESE VALUES BEFORE RUNNING THE SCRIPT
   --------------------------------------------------- */
const ADMIN_USER_ID = "00249e96-8b8a-4200-addb-6f71cc9c572b"; // Supabase "auth.users.id"
const ADMIN_EMAIL = "navaishkhan55@gmail.com";
const ADMIN_NAME = "Fusion College Admin";
/* --------------------------------------------------- */

async function main() {
  // Ensure a User row exists (supabase auth webhook should have created it,
  // but we upsert just in case)
  await prisma.user.upsert({
    where: { id: ADMIN_USER_ID },
    update: { email: ADMIN_EMAIL, role: "ADMIN" },
    create: {
      id: ADMIN_USER_ID,
      authId: ADMIN_USER_ID,
      email: ADMIN_EMAIL,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Insert (or update) the Admin profile linked to that user
  await prisma.admin.upsert({
    where: { userId: ADMIN_USER_ID },
    update: { name: ADMIN_NAME },
    create: {
      id: crypto.randomUUID(),
      userId: ADMIN_USER_ID,
      name: ADMIN_NAME,
    },
  });

  console.log("✅ Default admin record created/updated");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
