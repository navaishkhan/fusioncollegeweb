// lms/scripts/create-default-admin.js
// This script creates a default admin user using Supabase Admin REST API and Prisma.
// Run with: npm run create-admin

import { PrismaClient } from "@prisma/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL or Service Key not set in env");
  process.exit(1);
}

const ADMIN_EMAIL = "admin@fusioncollege.com";
const ADMIN_PASSWORD = "AdminPass123!";

async function createSupabaseUser() {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseServiceKey,
      "Authorization": `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase createUser failed: ${response.status} ${err}`);
  }
  const data = await response.json();
      },
    });
    // Create Admin record linked to User
    await prisma.admin.create({
      data: {
        id: supaUser.id,
        userId: supaUser.id,
        name: "Default Admin",
        email: ADMIN_EMAIL,
      },
    });
    console.log("✅ Default admin created\nID:", supaUser.id, "\nPassword:", ADMIN_PASSWORD);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
