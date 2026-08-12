# MedTrack — SMS & Email Notifications Setup

Follow these steps after deploying the notification code. You already have Resend, cron-job.org, and SMSMobileAPI accounts.

---

## Step 1: Run the database migration (1 min)

In **Supabase → SQL Editor**, run:

`supabase/migrations/20260812000001_notification_log.sql`

This creates the deduplication table so cron retries don’t send duplicate SMS.

---

## Step 2: Add environment variables

Add these in **Vercel → Project → Settings → Environment Variables** (and in local `.env.local`):

| Variable | Value | Where to get it |
|---|---|---|
| `SMSMOBILEAPI_KEY` | Your API key | SMSMobileAPI app / dashboard |
| `RESEND_API_KEY` | `re_...` | [Resend → API Keys](https://resend.com/api-keys) |
| `NOTIFICATION_FROM_EMAIL` | `MedTrack <onboarding@resend.dev>` | Use Resend test sender until domain verified |
| `CRON_SECRET` | Random string | Run `npm run setup` or any long random password |
| `NEXT_PUBLIC_MEDTRACK_TIMEZONE` | `Asia/Kolkata` | Already set in `.env.example` |

**Redeploy** Vercel after adding variables.

---

## Step 3: Set up your Android SMS gateway (5 min)

1. Install **SMSMobileAPI** on your spare Android phone (SIM with SMS pack).
2. Log in and copy your **API key**.
3. Keep the phone:
   - Plugged in 24/7
   - Connected to Wi‑Fi/mobile data
   - App running (disable battery optimization for SMSMobileAPI)
4. Paste the API key into `SMSMOBILEAPI_KEY` in Vercel.

**Test SMS + email together** (recommended first):

```
https://YOUR-SITE.vercel.app/api/notifications/test?secret=YOUR_CRON_SECRET
```

The JSON response shows exactly what failed (`missingEnvVars`, `sms.error`, `email.error`).

**Test morning reminders** (add `&force=1` to bypass dedupe on repeat tests):

```
https://YOUR-SITE.vercel.app/api/cron/reminders?block=morning&secret=YOUR_CRON_SECRET&force=1
```

---

## Step 4: Configure Resend email (5 min)

1. Go to [resend.com](https://resend.com) → **API Keys** → create key → paste into `RESEND_API_KEY`.
2. For testing, use: `NOTIFICATION_FROM_EMAIL=MedTrack <onboarding@resend.dev>`
3. To send from your own domain later:
   - Add domain in Resend → verify DNS records
   - Change to: `MedTrack <notifications@yourdomain.com>`

**Test email** — open in browser:

```
https://YOUR-SITE.vercel.app/api/cron/daily-digest?secret=YOUR_CRON_SECRET
```

Eric should get an email at `ericpeterthomas15@gmail.com` and both caregivers get an SMS summary.

---

## Step 5: Set up cron-job.org schedules (10 min)

Go to [cron-job.org](https://console.cron-job.org) → **Create cronjob** for each row:

Replace `YOUR-SITE` and `YOUR_CRON_SECRET` with your values.

| Title | Schedule (IST) | URL |
|---|---|---|
| MedTrack Morning Reminder | Daily 7:00 AM | `https://YOUR-SITE.vercel.app/api/cron/reminders?block=morning&secret=YOUR_CRON_SECRET` |
| MedTrack Afternoon Reminder | Daily 12:00 PM | `https://YOUR-SITE.vercel.app/api/cron/reminders?block=afternoon&secret=YOUR_CRON_SECRET` |
| MedTrack Evening Reminder | Daily 5:00 PM | `https://YOUR-SITE.vercel.app/api/cron/reminders?block=evening&secret=YOUR_CRON_SECRET` |
| MedTrack Night Reminder | Daily 9:00 PM | `https://YOUR-SITE.vercel.app/api/cron/reminders?block=night&secret=YOUR_CRON_SECRET` |
| MedTrack Low Stock Check | Daily 8:00 AM | `https://YOUR-SITE.vercel.app/api/cron/low-stock?secret=YOUR_CRON_SECRET` |

**cron-job.org settings for each job:**
- Request method: **GET**
- Timezone: **Asia/Kolkata**
- Enable job: **ON**

**Vercel cron (automatic, once/day):** runs `/api/cron/daily-digest` at 6:00 PM UTC (~11:30 PM IST) — end-of-day summary + auto-taken catch-up.

---

## Who gets what

| Event | Peter | Leena | Eric | Erron |
|---|---|---|---|---|
| Medication reminder (4× daily) | SMS | SMS | — | — |
| Auto-marked dose (window ended) | — | — | SMS | SMS |
| Low stock alert (daily) | — | — | SMS + Email | SMS |
| Daily summary | — | — | SMS + Email | SMS |

Phone numbers and email are hardcoded in `src/lib/notifications/recipients.ts` (allowlist only).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **404 on test URL** | Notification code not deployed — push latest code to GitHub and wait for Vercel redeploy |
| **`missingEnvVars` in JSON** | Add those keys in Vercel → Settings → Environment Variables → **Redeploy** |
| No SMS received | Check Android app is running; verify `SMSMOBILEAPI_KEY`; hit `/api/notifications/test` |
| `SMSMOBILEAPI_KEY not set` | Add key in Vercel env vars, redeploy (local `.env.local` alone is not enough for production URL) |
| SMS API error in JSON | Keep SMSMobileAPI app open; phone needs network; check API key |
| No email | Check spam; hit `/api/notifications/test` for exact Resend error |
| Resend 403 / validation | With `onboarding@resend.dev`, recipient must be the email on your Resend account |
| 401 Unauthorized | Add `?secret=YOUR_CRON_SECRET` matching Vercel `CRON_SECRET` exactly |
| `already sent (dedupe)` | Add `&force=1` to reminder URL for testing |
| Wrong reminder time | Set cron-job.org timezone to **Asia/Kolkata** |
| Duplicate SMS | `notification_log` table dedupes — run migration from Step 1 |

---

## API routes reference

| Route | Purpose |
|---|---|
| `/api/cron/reminders?block=morning\|afternoon\|evening\|night` | Patient medication reminders |
| `/api/cron/low-stock` | Caregiver low-stock alert |
| `/api/cron/daily-digest` | End-of-day summary + auto-taken |
| `/api/cron/auto-taken-doses` | Auto-mark only (no digest) |

All routes accept `Authorization: Bearer CRON_SECRET` or `?secret=CRON_SECRET`.
