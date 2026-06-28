import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fusioncollege.edu.pk';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'FusionAdmin@2026';
  const adminName = 'Fusion Admin';

  let authId = 'seed-admin-auth-id';

  if (supabaseUrl && serviceKey) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const existing = await supabase.auth.admin.listUsers();
    const found = existing.data.users.find((u) => u.email === adminEmail);

    if (found) {
      authId = found.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      if (error) throw error;
      authId = data.user!.id;
      console.log('Created Supabase admin:', adminEmail);
    }
  } else {
    console.warn('Supabase env missing — using placeholder authId. Configure Supabase before production.');
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: { authId, name: adminName, email: adminEmail, role: 'ADMIN' },
    update: { authId, name: adminName, role: 'ADMIN', status: 'ACTIVE' },
  });

  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English', 'Urdu'];
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  const cls = await prisma.class.upsert({
    where: { id: 'seed-class-fsc1' },
    create: { id: 'seed-class-fsc1', name: 'FSC-I-A', group: 'Pre-Medical', academicYear: '2026' },
    update: {},
  });

  console.log('Seed complete. Admin user id:', admin.id);
  console.log('Sample class:', cls.name);
  if (supabaseUrl && serviceKey) {
    console.log('Login:', adminEmail, '/', adminPassword);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
