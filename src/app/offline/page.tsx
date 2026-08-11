export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">You&apos;re offline</h1>
        <p className="text-slate-600">MedTrack will sync when your connection returns.</p>
        <a href="/kiosk" className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl">
          Open Kiosk (Cached)
        </a>
      </div>
    </div>
  );
}
