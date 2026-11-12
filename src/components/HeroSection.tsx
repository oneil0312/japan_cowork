import React, { useState, useEffect } from 'react';
import { Plane, Edit2, Clock, Calendar, CheckSquare, Star, X, Cloud } from 'lucide-react';
import { User } from 'firebase/auth';
import { TripPlan, FlightInfo } from '../types';

interface HeroSectionProps {
  trip: TripPlan;
  currentUser?: User | null;
  onEditTrip: () => void;
  onUpdateFlights: (flights: FlightInfo[]) => void;
  onOpenCloud?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  trip,
  currentUser,
  onEditTrip,
  onUpdateFlights,
  onOpenCloud
}) => {
  const [countdownText, setCountdownText] = useState('');
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightInfo | null>(null);
  const [flightLabel, setFlightLabel] = useState('');
  const [flightRoute, setFlightRoute] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [flightNotes, setFlightNotes] = useState('');

  // Countdown timer effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const depDate = new Date(trip.departureTime || `${trip.startDate}T12:00:00+09:00`);
      const arrDate = new Date(trip.arrivalTime || `${trip.startDate}T23:59:59+09:00`);

      if (isNaN(depDate.getTime())) {
        setCountdownText(`預定旅程：${trip.dateRange}`);
        return;
      }

      if (now < depDate) {
        const diffMs = depDate.getTime() - now.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdownText(`距出發 ${days} 天 ${hours} 小時`);
      } else if (now <= arrDate) {
        const startMs = depDate.getTime();
        const dayNum = Math.min(
          trip.days.length,
          Math.max(1, Math.floor((now.getTime() - startMs) / (1000 * 60 * 60 * 24)) + 1)
        );
        setCountdownText(`旅行進行中・第 ${dayNum} 天`);
      } else {
        setCountdownText('旅程圓滿完成，珍藏美好回憶');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [trip.departureTime, trip.arrivalTime, trip.startDate, trip.days.length, trip.dateRange]);

  // Total metrics
  const totalStops = trip.days.reduce((acc, d) => acc + d.stops.length, 0);
  const totalMust = trip.days.reduce(
    (acc, d) => acc + d.stops.filter((s) => s.isMustVisit).length,
    0
  );
  const checkedItems = trip.checklist.filter((c) => c.checked).length;

  // Flight editing
  const handleOpenEditFlight = (flight: FlightInfo) => {
    setEditingFlight(flight);
    setFlightLabel(flight.label);
    setFlightRoute(flight.route);
    setFlightNumber(flight.flightNumber);
    setFlightNotes(flight.notes || '');
    setIsFlightModalOpen(true);
  };

  const handleSaveFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlight) return;

    const updated = trip.flights.map((f) =>
      f.id === editingFlight.id
        ? {
            ...f,
            label: flightLabel.trim(),
            route: flightRoute.trim(),
            flightNumber: flightNumber.trim(),
            notes: flightNotes.trim()
          }
        : f
    );
    onUpdateFlights(updated);
    setIsFlightModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with SVG Mountain & Journal Typography */}
      <header
        id="home"
        className="relative overflow-hidden bg-[#f3efe4] border border-[#d9d3c8] p-6 sm:p-10 md:p-12 min-h-[360px] flex items-center shadow-xs"
      >
        {/* Mountain Scenic Artwork SVG (Responsive background) */}
        <svg
          className="absolute right-0 bottom-0 w-[85%] md:w-[65%] h-full pointer-events-none select-none opacity-85"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMaxYMax slice"
          aria-hidden="true"
        >
          <defs>
            <filter id="hero-bl">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {/* Winter Sun / Vermilion Seal Sun */}
          <circle cx="590" cy="120" r="40" fill="#bc553b" opacity="0.88" />
          {/* Distant Snowy Peaks */}
          <path
            d="M200 300 L330 150 L400 220 L470 120 L610 300 Z"
            fill="#cbd8da"
            opacity="0.7"
            filter="url(#hero-bl)"
          />
          <path
            d="M330 330 L470 190 L540 250 L650 140 L800 300 V400 H330 Z"
            fill="#9db6bd"
            opacity="0.85"
          />
          {/* Snow Tops */}
          <path
            d="M470 190 L500 222 L470 214 L450 226 Z M650 140 L690 188 L660 180 L640 196 Z"
            fill="#fffdf8"
          />
          {/* Forefront Ridge */}
          <path
            d="M120 400 L420 290 L800 330 V400 Z"
            fill="#6c91a3"
            opacity="0.85"
          />
          {/* Drifting Mist */}
          <ellipse
            cx="450"
            cy="285"
            rx="260"
            ry="20"
            fill="#fffdf8"
            opacity="0.75"
            filter="url(#hero-bl)"
          />
          {/* Winter Pine Trees */}
          <g fill="#242824" opacity="0.85">
            <path d="M700 332 L685 358 H715 Z" />
            <path d="M700 352 L681 380 H719 Z" />
            <rect x="698" y="378" width="4" height="22" />
            <path d="M745 352 L735 372 H755 Z" />
            <path d="M745 366 L732 390 H758 Z" />
            <rect x="743" y="388" width="4" height="12" />
          </g>
        </svg>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-xl">
          <div className="text-[11px] font-sans-tc tracking-[0.25em] text-[#777a74] uppercase">
            {trip.eyebrow}
          </div>

          <div className="flex items-baseline gap-4 mt-2">
            <h1 className="font-serif-tc text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#242824] leading-tight">
              {trip.title}
            </h1>
            <span
              className="text-[#6c91a3] font-serif-tc text-2xl sm:text-3xl font-bold"
              style={{ writingMode: 'vertical-rl' }}
            >
              旅
            </span>
          </div>

          <div className="font-serif-tc text-base sm:text-lg text-[#242824] tracking-wide mt-3">
            {trip.poem}
          </div>

          <div className="font-serif-tc text-sm tracking-widest text-[#777a74] mt-2 font-medium">
            {trip.dateRange}
          </div>

          <p className="font-sans-tc text-xs sm:text-sm text-[#555c59] mt-3 whitespace-pre-line leading-relaxed max-w-md">
            {trip.description}
          </p>

          {/* Countdown & Quick Edit Button & Cloud Sync */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="font-serif-tc text-sm sm:text-base font-semibold text-[#bc553b] tracking-wider flex items-center gap-1.5 bg-[#f5f1e8]/80 backdrop-blur-xs px-3 py-1 border border-[#e8e3d8]">
              <Clock className="w-4 h-4 text-[#bc553b]" />
              <span>{countdownText}</span>
            </div>

            {onOpenCloud && (
              <button
                onClick={onOpenCloud}
                type="button"
                className="inline-flex items-center gap-1 text-xs font-serif-tc text-[#6c91a3] hover:text-[#242824] border border-[#6c91a3]/60 hover:border-[#6c91a3] bg-white/80 px-2.5 py-1 transition-colors"
                title="儲存至 Firestore 雲端或切換行程"
              >
                <Cloud className="w-3.5 h-3.5 text-[#6c91a3]" />
                <span>{currentUser ? '雲端已就緒' : '雲端儲存'}</span>
              </button>
            )}

            <button
              onClick={onEditTrip}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-serif-tc text-[#777a74] hover:text-[#bc553b] border border-[#d9d3c8] hover:border-[#bc553b] bg-white/80 px-2.5 py-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>編輯封面資訊</span>
            </button>
          </div>
        </div>

        {/* Vermilion Traditional Seal Stamp */}
        <div
          className="hidden sm:block absolute right-8 top-8 z-10 border border-[#bc553b] text-[#bc553b] font-serif-tc text-sm px-2 py-3 select-none tracking-[0.25em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          {trip.sealText}
        </div>
      </header>

      {/* Flight Information Strip */}
      <section id="flights" className="bg-[#fffdf8] border border-[#d9d3c8] p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#d9d3c8]">
          {trip.flights.map((f) => (
            <div key={f.id} className="relative group pt-2 md:pt-0 md:px-4 first:md:pl-0 last:md:pr-0">
              <div className="flex items-center justify-between">
                <small className="text-[11px] font-serif-tc tracking-widest text-[#777a74] uppercase flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 text-[#6c91a3]" />
                  {f.label}
                </small>
                <button
                  onClick={() => handleOpenEditFlight(f)}
                  className="opacity-0 group-hover:opacity-100 text-[11px] font-serif-tc text-[#bc553b] hover:underline flex items-center gap-1 transition-opacity"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>修改</span>
                </button>
              </div>

              <b className="block font-serif-tc text-base sm:text-lg text-[#242824] my-1">
                {f.route}
              </b>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#bc553b] font-mono">{f.flightNumber}</span>
                {f.notes && (
                  <>
                    <span className="text-[#d9d3c8]">|</span>
                    <span className="text-[#777a74] truncate">{f.notes}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flight Edit Modal */}
      {isFlightModalOpen && editingFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#fffdf8] border border-[#d9d3c8] shadow-2xl p-6 relative">
            <button
              onClick={() => setIsFlightModalOpen(false)}
              className="absolute top-4 right-4 text-[#777a74] hover:text-[#bc553b]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-serif-tc text-lg font-semibold mb-4 text-[#242824]">
              修改航班資訊
            </h3>
            <form onSubmit={handleSaveFlight} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#777a74] font-serif-tc mb-1">標籤名稱</label>
                <input
                  type="text"
                  value={flightLabel}
                  onChange={(e) => setFlightLabel(e.target.value)}
                  placeholder="例如：去程 · 1/2 SAT"
                  className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-[#777a74] font-serif-tc mb-1">路線與時間</label>
                <input
                  type="text"
                  value={flightRoute}
                  onChange={(e) => setFlightRoute(e.target.value)}
                  placeholder="例如：桃園 12:15 → 花卷 16:45"
                  className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-[#777a74] font-serif-tc mb-1">航班編號 / 備註資訊</label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="例如：CI 104、航班號碼待補"
                  className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[#777a74] font-serif-tc mb-1">詳細說明 / 還車預留</label>
                <input
                  type="text"
                  value={flightNotes}
                  onChange={(e) => setFlightNotes(e.target.value)}
                  placeholder="例如：預留 2 小時還車、託運行李限制等"
                  className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#d9d3c8]">
                <button
                  type="button"
                  onClick={() => setIsFlightModalOpen(false)}
                  className="px-3 py-1.5 text-[#777a74] hover:text-[#242824]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#bc553b] text-white font-serif-tc hover:bg-[#a64730]"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
