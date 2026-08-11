'use client';

import React from 'react';
import { DoseLog } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, Activity, AlertTriangle } from 'lucide-react';

interface ComplianceFeedProps {
  doseLogs: DoseLog[];
}

export function ComplianceFeed({ doseLogs }: ComplianceFeedProps) {
  if (doseLogs.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
        <Activity className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="font-semibold text-lg">No dose logs recorded today yet.</p>
        <p className="text-sm text-slate-400">Activity will appear here live as doses are logged in Parent View.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Live Compliance Feed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Timestamped dose completion stream
            </p>
          </div>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time</span>
        </span>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {doseLogs.map(log => {
          const logDate = new Date(log.logged_at);
          const timeFormatted = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = logDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

          const isTaken = log.status === 'taken';
          const isMissed = log.status === 'missed';

          return (
            <div
              key={log.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                isTaken
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                  : isMissed
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                {isTaken ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : isMissed ? (
                  <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0" />
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      {log.medication_name || 'Medication'}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                      {log.patient_name || 'Patient'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 capitalize">
                    {log.scheduled_time_of_day} Dose &bull; Status:{' '}
                    <strong className={
                      isTaken
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isMissed
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-rose-700 dark:text-rose-300'
                    }>
                      {log.status.toUpperCase()}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-bold text-slate-500">
                <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{timeFormatted}</span>
                </div>
                <span className="text-[11px] text-slate-400">{dateFormatted}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
