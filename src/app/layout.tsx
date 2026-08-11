import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/manifest.json" />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
          MedTrack PWA &copy; {new Date().getFullYear()} &bull; Accessible Smart Family Healthcare
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('MedTrack SW registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('MedTrack SW registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
