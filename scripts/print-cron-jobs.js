#!/usr/bin/env node
/**
 * Print cron-job.org URLs for copy-paste setup.
 * Usage: npm run cron:urls
 * Reads NEXT_PUBLIC_SITE_URL and CRON_SECRET from .env.local if present.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'cron-jobs.config.json'), 'utf8'),
);

const site = (process.env.NEXT_PUBLIC_SITE_URL || config.defaultSiteUrl).replace(/\/$/, '');
const secret = process.env.CRON_SECRET;

if (!secret || secret.includes('PASTE')) {
  console.error('ERROR: Set CRON_SECRET in .env.local or environment (same value as Vercel).');
  process.exit(1);
}

console.log('\n=== MedTrack cron-job.org setup ===\n');
console.log(`Site:     ${site}`);
console.log(`Timezone: ${config.timezone}`);
console.log(`Method:   ${config.method}\n`);
console.log('Create each job at https://console.cron-job.org → Create cronjob\n');
console.log('─'.repeat(72));

for (const job of config.jobs) {
  const url = `${site}${job.path}${job.path.includes('?') ? '&' : '?'}secret=${secret}`;
  console.log(`\nTitle:    ${job.title}`);
  console.log(`Schedule: ${job.scheduleLabel}`);
  console.log(`Cron:     ${job.schedule}`);
  if (job.note) console.log(`Note:     ${job.note}`);
  console.log(`URL:      ${url}`);
}

console.log('\n' + '─'.repeat(72));
console.log('\ncron-job.org settings for EVERY job:');
console.log('  • Request method: GET');
console.log('  • Timezone: Asia/Kolkata');
console.log('  • Enabled: ON');
console.log('\nSMS delay: 30 seconds – 2 minutes is normal (SMSMobileAPI routes via your Android phone).\n');
