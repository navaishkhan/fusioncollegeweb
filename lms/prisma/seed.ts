import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fusioncollege.edu.pk';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'FusionAdmin@2026';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user in Supabase Auth
    console.log(`Creating Supabase auth user: ${adminEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      // If user already exists, try to get them
      if (authError.message.includes('already registered')) {
        console.log('User already exists in Supabase, fetching existing user...');
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(adminEmail);
        if (existingUser?.user) {
          console.log('Using existing Supabase user:', existingUser.user.id);
        } else {
          throw authError;
        }
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Supabase auth user created:', authData.user.id);
    }

    // Get the auth user ID
    const { data: userByEmail } = await supabase.auth.admin.getUserByEmail(adminEmail);
    const authId = userByEmail.user?.id;

    if (!authId) {
      throw new Error('Failed to get auth user ID');
    }

    // Create or update User in Prisma
    console.log('Creating/updating user in Prisma...');
    const user = await prisma.user.upsert({
      where: { authId },
      update: {
        email: adminEmail,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        authId,
        email: adminEmail,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('✅ User created/updated in Prisma:', user.id);

    // Create or update Admin profile
    console.log('Creating/updating admin profile...');
    const admin = await prisma.admin.upsert({
      where: { userId: user.id },
      update: {
        name: 'Fusion College Admin',
      },
      create: {
        userId: user.id,
        name: 'Fusion College Admin',
      },
    });

    console.log('✅ Admin profile created/updated:', admin.id);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Admin credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  Please change the password after first login!\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
