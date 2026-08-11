import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export default function SetupPage() {
  const checks = [
    {
      name: 'Supabase URL & Keys',
      ok: isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      fix: 'Run npm run setup, then paste 3 keys from Supabase Dashboard → Settings → API into .env.local (and Vercel)',
    },
    {
      name: 'Site URL',
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      fix: 'Set NEXT_PUBLIC_SITE_URL=https://medtrack-flame.vercel.app in .env.local',
    },
    {
      name: 'Kiosk PIN',
      ok: Boolean(process.env.KIOSK_PIN),
      fix: 'Default is 1234 — set KIOSK_PIN in .env.local',
    },
    {
      name: 'Push Notifications (VAPID)',
      ok: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      fix: 'Run npm run setup — keys are auto-generated',
    },
    {
      name: 'Cron Secret',
      ok: Boolean(process.env.CRON_SECRET),
      fix: 'Run npm run setup — auto-generated',
    },
    {
      name: 'Google Tasks',
      ok: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      optional: true,
      fix: 'Optional — enables refill sync to Google Tasks from the dashboard',
    },
  ];

  const allRequired = checks.filter(c => !c.optional).every(c => c.ok);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold">MedTrack Setup Status</h1>
        <p className="text-muted-foreground">
          {allRequired
            ? 'All required services are configured!'
            : 'Complete the steps below to enable full features.'}
        </p>
        {allRequired && (
          <Badge className="bg-emerald-600">Ready to go</Badge>
        )}
      </div>

      <div className="space-y-3">
        {checks.map(check => {
          const status = check.ok
            ? 'OK'
            : check.optional
              ? 'Optional'
              : 'Missing';
          const badgeVariant = check.ok
            ? 'default'
            : check.optional
              ? 'secondary'
              : 'destructive';

          return (
            <Card
              key={check.name}
              className={
                check.ok
                  ? 'border-emerald-300'
                  : check.optional
                    ? 'border-slate-200'
                    : 'border-amber-300'
              }
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {check.name}
                    {check.optional && !check.ok && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
                    )}
                  </CardTitle>
                  <Badge variant={badgeVariant}>{status}</Badge>
                </div>
                {!check.ok && (
                  <CardDescription className="text-sm">{check.fix}</CardDescription>
                )}
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <a href="https://supabase.com/dashboard/new/new-project" className="text-emerald-600 hover:underline font-semibold" target="_blank" rel="noreferrer">
              → Create Supabase project
            </a>
          </p>
          <p>
            <a href="https://supabase.com/dashboard" className="text-emerald-600 hover:underline font-semibold" target="_blank" rel="noreferrer">
              → Supabase Dashboard (SQL Editor + API keys)
            </a>
          </p>
          <p>
            <a href="https://vercel.com/dashboard" className="text-emerald-600 hover:underline font-semibold" target="_blank" rel="noreferrer">
              → Vercel Dashboard (Environment Variables)
            </a>
          </p>
          <p className="pt-2 text-muted-foreground">
            Full guide: open <code className="bg-muted px-1 rounded">SETUP.md</code> in the project folder
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Link href="/kiosk" className="text-emerald-600 font-semibold hover:underline">Test Kiosk →</Link>
        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Caregiver Login →</Link>
        <Link href="/" className="text-slate-600 font-semibold hover:underline">Home</Link>
      </div>
    </div>
  );
}
