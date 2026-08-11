import React from 'react';
import { Monitor, Smartphone, Share } from 'lucide-react';

const platforms = [
  {
    id: 'android',
    title: 'Android',
    icon: Smartphone,
    color: 'emerald',
    steps: [
      'Open MedTrack in Chrome on your phone.',
      'Tap the menu (⋮) in the top-right corner.',
      'Choose "Install app" or "Add to Home screen".',
    ],
  },
  {
    id: 'ios',
    title: 'iPhone & iPad',
    icon: Share,
    color: 'sky',
    steps: [
      'Open MedTrack in Safari (not Chrome).',
      'Tap the Share button at the bottom of the screen.',
      'Scroll down and tap "Add to Home Screen", then Add.',
    ],
  },
  {
    id: 'desktop',
    title: 'Desktop',
    icon: Monitor,
    color: 'indigo',
    steps: [
      'Open MedTrack in Chrome, Edge, or Brave.',
      'Look for the install icon in the address bar (⊕ or computer icon).',
      'Click Install — or use the browser menu → "Install MedTrack".',
    ],
  },
];

const colorClasses: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'bg-emerald-500 text-white',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-800',
    icon: 'bg-sky-500 text-white',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'bg-indigo-500 text-white',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  },
};

export function InstallGuide() {
  return (
    <section id="install" className="mt-16 scroll-mt-24">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 rounded-full border border-emerald-200 dark:border-emerald-800 mb-3">
          Progressive Web App
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Install MedTrack on Any Device
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          No app store needed. Install directly from your browser for offline access, a home-screen icon, and full-screen experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const colors = colorClasses[platform.color];
          const Icon = platform.icon;

          return (
            <div
              key={platform.id}
              className={`p-6 rounded-2xl border ${colors.border} ${colors.bg}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${colors.badge}`}>
                  {platform.title}
                </span>
              </div>
              <ol className="space-y-3">
                {platform.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 text-slate-600 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        On supported browsers, a one-tap install banner may appear automatically at the bottom of the screen.
      </p>
    </section>
  );
}
