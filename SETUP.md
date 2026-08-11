# MedTrack — Simple Setup Guide

Everything except Supabase account creation is automated. Follow these 5 steps.

---

## Step 1: Create free Supabase project (2 min)

1. Go to **[supabase.com/dashboard](https://supabase.com/dashboard)** and sign in (GitHub login works)
2. Click **New Project**
3. Name: `medtrack` → set a database password → pick region → **Create**
4. Wait until status shows **Active**

---

## Step 2: Run database script (1 min)

1. In Supabase: **SQL Editor** → **New query**
2. Open the file `supabase/SETUP-ALL-IN-ONE.sql` from this repo
3. Copy **everything** → paste into SQL Editor → **Run**
4. You should see "Success" with no errors

Then enable login:
- **Authentication** → **Providers** → **Email** → turn **Enable Email provider** ON
- **Authentication** → **URL Configuration**:
  - **Site URL:** `https://medtrack-flame.vercel.app` (not localhost — or magic links go to localhost)
  - **Redirect URLs** (add both):
    ```
    https://medtrack-flame.vercel.app/auth/callback
    http://localhost:3000/auth/callback
    ```

---

## Step 3: Auto-generate local config (30 sec)

In your project folder, run:

```bash
npm run setup
```

This creates `.env.local` with push notification keys and secrets already filled in.

Then open `.env.local` and replace these 3 placeholders from **Supabase → Settings → API**:

| Variable | Where to copy |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (click Reveal) |

---

## Step 4: Add keys to Vercel (2 min)

1. Go to **[vercel.com](https://vercel.com)** → your **medtrack** project
2. **Settings** → **Environment Variables**
3. Add **every line** from your `.env.local` (skip comment lines starting with `#`)
4. Click **Redeploy** on the latest deployment

---

## Step 5: Test

```bash
npm run dev
```

| Page | URL | Notes |
|------|-----|-------|
| Parent Kiosk | http://localhost:3000/kiosk | PIN: **1234** |
| Caregiver Login | http://localhost:3000/login | Magic link to your email |
| Dashboard | http://localhost:3000/dashboard | After login |

---

## What's already configured for you

- Kiosk PIN: `1234` (change via `KIOSK_PIN` in `.env.local`)
- Push notification VAPID keys (auto-generated)
- Cron secret for daily low-stock alerts
- Site URL: `https://medtrack-flame.vercel.app`

---

## Optional: Google Tasks (later)

1. [Google Cloud Console](https://console.cloud.google.com/) → Create project → Enable **Google Tasks API**
2. **Credentials** → OAuth 2.0 Client → Web application
3. Redirect URI: `https://medtrack-flame.vercel.app/api/auth/google/callback`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to Vercel + `.env.local`
5. In dashboard click **Connect Google Tasks**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Kiosk shows "Supabase not configured" | Fill in the 3 Supabase keys in `.env.local` |
| Magic link goes to localhost | Supabase **Site URL** → set to `https://medtrack-flame.vercel.app`; add `NEXT_PUBLIC_SITE_URL` on Vercel; request a **new** magic link |
| Magic link doesn't arrive | Check spam; verify Email provider enabled in Supabase |
| Dashboard redirects to login | Expected — sign in with magic link first |
| Dose not syncing to dashboard | Confirm Realtime enabled; check Supabase keys on Vercel |
