// lms/scripts/create-default-admin.js
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL or Service Key not set in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@fusioncollege.com";
const ADMIN_PASSWORD = "AdminPass123!";

async function main() {
  // Check if admin already exists in Supabase Auth
  const { data: existingUser, error: getError } = await supabase.auth.admin.getUserByEmail(ADMIN_EMAIL);
  if (existingUser) {
    console.log("Admin already exists:\nID:", existingUser.id);
    return;
  }

  // Create user via Supabase Admin API
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (createError) {
    console.error("Supabase createUser error:", createError);
    process.exit(1);
  }

  // Insert admin role into Prisma DB (User table assumed to have role field)
  await prisma.user.upsert({
    where: { id: newUser.id },
    update: { role: "ADMIN" },
    create: {
      id: newUser.id,
      email: ADMIN_EMAIL,
      role: "ADMIN",
    },
  });

  console.log("✅ Default admin created\nID:", newUser.id, "\nPassword:", ADMIN_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
