'use client';

import Link from 'next/link';
import { requestPasswordReset } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>We will email you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={requestPasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-[var(--cyan)]">← Back to login</Link>
        </p>
      </CardContent>
    </Card>
  );
}
