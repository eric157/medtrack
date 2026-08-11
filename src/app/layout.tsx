import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { InstallPrompt } from '@/components/InstallPrompt';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'MedTrack | Smart Family Medication & Refill PWA',
  description: 'Multi-user, real-time medication tracking and automated inventory management app for parents and caregivers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MedTrack',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <QueryProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <InstallPrompt />
          <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <p>MedTrack PWA &copy; {new Date().getFullYear()} &bull; Accessible Smart Family Healthcare</p>
          <p>
            <a href="/#install" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
              Install on your device
            </a>
            {' · '}
            <a href="/setup" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
              Setup status
            </a>
          </p>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
