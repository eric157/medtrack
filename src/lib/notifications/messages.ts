import type { TimeOfDay } from '@/lib/types';
import { TIME_BLOCK_WINDOWS } from '@/lib/time-blocks';

export function buildReminderSms(
  patientFirstName: string,
  block: TimeOfDay,
  medicationNames: string[],
): string {
  const window = TIME_BLOCK_WINDOWS[block];
  const meds = medicationNames.slice(0, 6).join(', ');
  const extra = medicationNames.length > 6 ? ` +${medicationNames.length - 6} more` : '';
  return (
    `MedTrack: Hi ${patientFirstName}, time for your ${window.label.toLowerCase()} ` +
    `medications (${window.timeRange}): ${meds}${extra}. Please mark taken on the kiosk.`
  );
}

export function buildCaregiverAlertSms(title: string, detail: string): string {
  const text = `MedTrack: ${title}. ${detail}`;
  return text.length > 320 ? `${text.slice(0, 317)}...` : text;
}

export function buildDailyDigestHtml(summary: {
  dateLabel: string;
  dosesTaken: number;
  totalScheduled: number;
  autoTaken: number;
  lowStock: string[];
  compliancePercent: number;
}): string {
  const lowStockBlock = summary.lowStock.length
    ? `<ul>${summary.lowStock.map(m => `<li>${m}</li>`).join('')}</ul>`
    : '<p>All medications adequately stocked.</p>';

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2>MedTrack Daily Summary — ${summary.dateLabel}</h2>
      <p><strong>Compliance:</strong> ${summary.compliancePercent}% (${summary.dosesTaken}/${summary.totalScheduled} doses taken)</p>
      <p><strong>Auto-marked taken:</strong> ${summary.autoTaken}</p>
      <h3>Low stock</h3>
      ${lowStockBlock}
      <p style="color:#64748b;font-size:12px;margin-top:24px">
        Sent by MedTrack · <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/dashboard">Open dashboard</a>
      </p>
    </div>
  `;
}

export function buildDailyDigestSms(summary: {
  dosesTaken: number;
  totalScheduled: number;
  compliancePercent: number;
  lowStockCount: number;
}): string {
  return (
    `MedTrack daily: ${summary.compliancePercent}% compliance ` +
    `(${summary.dosesTaken}/${summary.totalScheduled} doses). ` +
    `${summary.lowStockCount} low-stock item(s). Check dashboard.`
  );
}
