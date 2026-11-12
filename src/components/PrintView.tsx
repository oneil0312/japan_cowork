import React from 'react';
import { Printer, X } from 'lucide-react';
import { TripPlan } from '../types';

interface PrintViewProps {
  trip: TripPlan;
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ trip, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-[#fffdf8] text-[#242824] shadow-2xl p-8 sm:p-12 relative my-auto">
        {/* Floating Print Actions (Hidden in actual print) */}
        <div className="no-print sticky top-4 right-4 z-20 flex justify-end gap-3 mb-6 bg-[#fffdf8]/95 p-2 border border-[#d9d3c8]">
          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-serif-tc text-white bg-[#bc553b] hover:bg-[#a64730] transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>列印手帳 / 另存為 PDF</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-[#777a74] hover:text-[#bc553b] border border-[#d9d3c8]"
            title="關閉預覽"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Journal Booklet Content */}
        <div className="print-content space-y-8 font-sans-tc text-sm">
          {/* Cover Header */}
          <div className="border-b-2 border-[#242824] pb-6 flex items-start justify-between">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#777a74] uppercase block mb-1">
                {trip.eyebrow}
              </span>
              <h1 className="font-serif-tc text-3xl sm:text-4xl font-black tracking-wide text-[#242824]">
                {trip.title}
              </h1>
              <p className="font-serif-tc text-base text-[#bc553b] mt-1">
                {trip.poem}
              </p>
              <div className="text-xs font-serif-tc text-[#777a74] mt-2">
                旅行日程：{trip.dateRange}
              </div>
            </div>

            <div
              className="border-2 border-[#bc553b] text-[#bc553b] font-serif-tc text-sm p-3 font-semibold select-none tracking-[0.2em]"
              style={{ writingMode: 'vertical-rl' }}
            >
              {trip.sealText}
            </div>
          </div>

          {/* Flights & Accommodations Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside-avoid">
            {/* Flights */}
            <div className="border border-[#d9d3c8] p-4 bg-[#fbf9f4]">
              <h3 className="font-serif-tc font-semibold text-sm border-b border-[#d9d3c8] pb-1.5 mb-2 text-[#242824]">
                ✈ 航班資訊
              </h3>
              <div className="space-y-2 text-xs">
                {trip.flights.map((f) => (
                  <div key={f.id}>
                    <span className="font-serif-tc font-medium text-[#777a74]">{f.label}：</span>
                    <strong className="font-serif-tc ml-1">{f.route}</strong>
                    <div className="text-[#bc553b] font-mono text-[11px] mt-0.5">
                      {f.flightNumber} {f.notes ? `(${f.notes})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stays */}
            <div className="border border-[#d9d3c8] p-4 bg-[#fbf9f4]">
              <h3 className="font-serif-tc font-semibold text-sm border-b border-[#d9d3c8] pb-1.5 mb-2 text-[#242824]">
                ▰ 住宿安排
              </h3>
              <div className="space-y-2 text-xs">
                {trip.stays.map((s) => (
                  <div key={s.id} className="flex items-baseline justify-between gap-2">
                    <div>
                      <strong className="font-serif-tc">{s.name}</strong>
                      <span className="text-[#777a74] text-[11px] ml-2 font-sans-tc">{s.dates}</span>
                    </div>
                    <span className="text-[#555c59] text-[11px] shrink-0">{s.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Days Chronological Detail */}
          <div className="space-y-6">
            <h2 className="font-serif-tc text-lg font-bold border-b border-[#d9d3c8] pb-2 text-[#242824]">
              每日行程手帳
            </h2>

            {trip.days.map((day, idx) => (
              <div
                key={day.id}
                className="border border-[#d9d3c8] p-5 bg-[#fffdf8] print-break-inside-avoid"
              >
                {/* Day Header */}
                <div className="flex items-baseline justify-between border-b border-[#e8e3d8] pb-2 mb-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif-tc text-2xl font-bold text-[#bc553b]">
                      Day {idx + 1}
                    </span>
                    <span className="font-serif-tc text-sm text-[#777a74]">
                      {day.date} ({day.week})
                    </span>
                    <span className="font-serif-tc text-base font-semibold text-[#242824]">
                      {day.title}
                    </span>
                  </div>
                </div>

                {day.desc && (
                  <p className="text-xs text-[#777a74] mb-3 leading-relaxed">
                    {day.desc}
                  </p>
                )}

                {/* Stops Timeline Table */}
                <div className="space-y-2 text-xs">
                  {day.stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="grid grid-cols-[70px_1fr] sm:grid-cols-[90px_1fr] gap-3 py-1.5 border-b border-dashed border-[#e8e3d8] last:border-b-0"
                    >
                      <div className="font-serif-tc font-medium text-[#777a74]">
                        {stop.time}
                      </div>
                      <div>
                        <div className="font-serif-tc font-semibold text-[#242824] flex items-center gap-2">
                          <span>{stop.location}</span>
                          {stop.isMustVisit && (
                            <span className="text-[10px] text-[#bc553b] border border-[#bc553b] px-1">
                              必訪
                            </span>
                          )}
                        </div>
                        {stop.notes && (
                          <div className="text-[11px] text-[#555c59] mt-0.5 leading-relaxed font-sans-tc">
                            {stop.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Packing Checklist */}
          <div className="border border-[#d9d3c8] p-5 bg-[#fbf9f4] print-break-inside-avoid">
            <h3 className="font-serif-tc font-semibold text-sm border-b border-[#d9d3c8] pb-1.5 mb-3 text-[#242824]">
              ☑ 出發前準備清單
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {trip.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border border-[#777a74] rounded-xs shrink-0" />
                  <span className="text-[#555c59]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#d9d3c8] pt-4 text-xs text-[#777a74] flex justify-between font-serif-tc">
            <span>{trip.title} · 旅行計畫隨行手帳</span>
            <span>靜謐雪國，平安順行</span>
          </div>
        </div>
      </div>
    </div>
  );
};
