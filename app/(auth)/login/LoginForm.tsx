'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>LMS Portal</CardTitle>
        <CardDescription>Sign in to Fusion College Narowal</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signIn} className="space-y-4">
          {redirect && <input type="hidden" name="redirect" value={redirect} />}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/reset-password" className="text-[var(--cyan)]">Forgot password?</Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="text-[var(--muted)]">← Back to website</Link>
        </p>
      </CardContent>
    </Card>
  );
}
