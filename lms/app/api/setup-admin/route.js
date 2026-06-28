import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Simple secret check to prevent unauthorized access
    if (secret !== 'fusion-setup-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fusioncollege.edu.pk';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'FusionAdmin@2026';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    let authId;
    if (authError) {
      if (authError.message.includes('already registered')) {
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(adminEmail);
        if (existingUser?.user) {
          authId = existingUser.user.id;
        } else {
          return NextResponse.json({ error: authError.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    } else {
      authId = authData.user.id;
    }

    // Create or update User in Prisma
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

    // Create or update Admin profile
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

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
