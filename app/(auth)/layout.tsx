import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <img src="/logo.png" alt="Fusion College" width={56} height={56} className="rounded-full" />
        <div>
          <div className="font-bold text-[var(--navy)]">Fusion College</div>
          <div className="text-sm text-[var(--muted)]">of Sciences · Narowal</div>
        </div>
      </Link>
      {children}
    </div>
  );
}
