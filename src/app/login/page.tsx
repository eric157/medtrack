import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 space-y-8">
      <Link href="/">
        <Logo size="lg" />
      </Link>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        Parent kiosk does not require login.{' '}
        <Link href="/kiosk" className="text-emerald-600 hover:underline font-semibold">
          Open Parent View →
        </Link>
      </p>
    </div>
  );
}
