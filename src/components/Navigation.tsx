'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pill, LayoutDashboard, HeartHandshake, Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { useMedTrackStore } from '@/lib/store';
import { calculateDepletionForecast } from '@/lib/forecasting';

export function Navigation() {
  const pathname = usePathname();
  const { medications, patients, loadState, isLoaded } = useMedTrackStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      loadState();
    }
  }, [isLoaded, loadState]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowAndroidGuide(true);
    }
  };

  // Count low stock items across all patients
  const lowStockCount = medications.filter(med => {
    const patient = patients.find(p => p.id === med.patient_id);
    const forecast = calculateDepletionForecast(med, patient ? patient.name : '');
    return forecast.isLowStock;
  }).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  MedTrack
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                  PWA
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/kiosk"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                  pathname.startsWith('/kiosk')
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HeartHandshake className="w-5 h-5" />
                <span className="text-base sm:text-lg">Parent View</span>
              </Link>

              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                  pathname.startsWith('/dashboard')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-base sm:text-lg hidden sm:inline">Caregiver Dashboard</span>
                <span className="sm:hidden">Dashboard</span>

                {lowStockCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full animate-pulse">
                    {lowStockCount}
                  </span>
                )}
              </Link>

              <button
                onClick={handleInstallClick}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition-colors"
                title="Install MedTrack PWA App on Android/Mobile"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Install on Android</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Android Chrome PWA Install Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Install MedTrack on Android
                </h3>
              </div>
              <button onClick={() => setShowAndroidGuide(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              You can install MedTrack directly onto your Android home screen as a standalone application via Chrome:
            </p>

            <ol className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Open this website in <strong>Google Chrome on Android</strong>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Tap the <strong>Three Dots (⋮)</strong> menu icon in the top right corner.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Select <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong>.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
