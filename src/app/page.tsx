import React from 'react';
import Link from 'next/link';
import { HeartHandshake, LayoutDashboard, ShieldCheck, Zap, Bell, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-full border border-emerald-300 dark:border-emerald-700">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Real-time Medication Sync & Inventory Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">MedTrack</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
          Seamlessly bridging accessible, ultra-large touch controls for parents with intelligent inventory forecasting and automated Google Tasks sync for caregivers.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Parent Kiosk Mode Card */}
        <Link href="/kiosk" className="group">
          <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-amber-950/40 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6 group-hover:rotate-6 transition-transform">
                <HeartHandshake className="w-10 h-10" />
              </div>
              <span className="inline-block text-xs font-black tracking-widest text-amber-700 dark:text-amber-300 uppercase mb-2">
                Ultra Accessible Interface
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                Parent View (Kiosk Mode)
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-base mb-6 leading-relaxed">
                Designed for minimum cognitive load. Features 4 color-coded time blocks (Morning, Afternoon, Evening, Night), 64px+ high-contrast buttons, and instant checkmark confirmations.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Toggle between Father & Mother profiles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>WCAG AAA extra-large touch targets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Real-time instant dose logging</span>
                </li>
              </ul>
            </div>
            <div className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center text-lg shadow-md transition-colors">
              Launch Parent Kiosk View &rarr;
            </div>
          </div>
        </Link>

        {/* Caregiver Dashboard Card */}
        <Link href="/dashboard" className="group">
          <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-indigo-950/40 border-2 border-indigo-300/80 dark:border-indigo-700/60 shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-6 group-hover:-rotate-6 transition-transform">
                <LayoutDashboard className="w-10 h-10" />
              </div>
              <span className="inline-block text-xs font-black tracking-widest text-indigo-700 dark:text-indigo-300 uppercase mb-2">
                Full Caregiver Control Center
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                Caregiver Dashboard
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-base mb-6 leading-relaxed">
                Live compliance stream, remaining pill counts with depletion forecasting math, low-stock threshold alerts, and one-click Google Tasks refill sync.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Live compliance feed & timestamp logs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Depletion date calculation & alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Google Tasks API refill integration</span>
                </li>
              </ul>
            </div>
            <div className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center text-lg shadow-md transition-colors">
              Open Caregiver Dashboard &rarr;
            </div>
          </div>
        </Link>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Offline PWA Support
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Works reliably even when internet connectivity drops. Dose logs sync automatically upon reconnection.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Bell className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Auto Stock Decrement
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Every "Mark Taken" tap updates inventory levels in real-time, warning caregivers before medications run out.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Zap className="w-8 h-8 text-indigo-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Google Tasks Sync
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Automatically calculates 30-day top-up supply requirements and pushes tasks directly to Google Tasks.
          </p>
        </div>
      </div>
    </div>
  );
}
