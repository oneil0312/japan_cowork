import React, { useState } from 'react';
import { X, Settings, Calendar, Globe, Bookmark } from 'lucide-react';
import { TripPlan } from '../types';

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
  onSave: (updated: Partial<TripPlan>) => void;
}

export const TripSettingsModal: React.FC<TripSettingsModalProps> = ({
  isOpen,
  onClose,
  trip,
  onSave
}) => {
  const [title, setTitle] = useState(trip.title);
  const [subtitle, setSubtitle] = useState(trip.subtitle);
  const [eyebrow, setEyebrow] = useState(trip.eyebrow);
  const [poem, setPoem] = useState(trip.poem);
  const [dateRange, setDateRange] = useState(trip.dateRange);
  const [departureTime, setDepartureTime] = useState(trip.departureTime);
  const [description, setDescription] = useState(trip.description);
  const [sealText, setSealText] = useState(trip.sealText);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || '我的旅行計畫',
      subtitle: subtitle.trim(),
      eyebrow: eyebrow.trim(),
      poem: poem.trim(),
      dateRange: dateRange.trim(),
      departureTime: departureTime.trim(),
      description: description.trim(),
      sealText: sealText.trim() || '旅行 · 手帳'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#fffdf8] border border-[#d9d3c8] shadow-2xl p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto"
        style={{ color: '#242824' }}
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="關閉視窗"
          className="absolute top-5 right-5 p-1.5 text-[#777a74] hover:text-[#bc553b] hover:bg-[#f5f1e8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pr-8">
          <span className="text-[11px] tracking-widest text-[#777a74] font-serif-tc uppercase">
            TRIP PREFERENCES
          </span>
          <h3 className="text-xl font-serif-tc font-semibold tracking-wide mt-0.5">
            旅程設定與手帳封面
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans-tc">
          {/* Trip Title */}
          <div>
            <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
              旅行名稱（例如：日本青森行、京都秋楓散策）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm font-serif-tc font-semibold"
              required
            />
          </div>

          {/* Subtitle & Seal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                副標題 / 季節標語
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="例如：雪と余白・2027 冬季旅行"
                className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                右側紅色印章文字（Seal）
              </label>
              <input
                type="text"
                value={sealText}
                onChange={(e) => setSealText(e.target.value)}
                placeholder="例如：青森 · 雪國"
                className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-serif-tc"
              />
            </div>
          </div>

          {/* Poem */}
          <div>
            <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
              詩意題字（Poem）
            </label>
            <input
              type="text"
              value={poem}
              onChange={(e) => setPoem(e.target.value)}
              placeholder="例如：雪的盡頭，是更寬廣的風景。"
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-serif-tc"
            />
          </div>

          {/* Date range & Countdown Timestamp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                旅行日期區間字串
              </label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="例如：2027.01.02 — 01.09"
                className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                啟程時間（倒數計時基準）
              </label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="例如：2027-01-02T16:45:00+09:00"
                className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
              旅程概述 / 核心意境
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="神社、城跡、樹冰、溪流與湖泊..."
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#d9d3c8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif-tc text-[#777a74] hover:text-[#242824]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-serif-tc text-white bg-[#bc553b] hover:bg-[#a64730] transition-colors tracking-widest shadow-xs"
            >
              儲存設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
