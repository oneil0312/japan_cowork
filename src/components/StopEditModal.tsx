import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Tag, FileText, Star, Compass } from 'lucide-react';
import { ItineraryItem, ItemCategory, DayPlan } from '../types';
import { CATEGORY_LABELS } from '../initialData';

interface StopEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ItineraryItem, targetDayId: string) => void;
  initialItem?: ItineraryItem | null;
  currentDayId: string;
  allDays: DayPlan[];
}

const TIME_PRESETS = [
  '08:30', '09:00', '10:30', '12:00', '13:30',
  '15:00', '16:30', '18:00', '19:30', '早上', '上午', '中午', '下午', '傍晚', '晚上', '退房', '入住'
];

export const StopEditModal: React.FC<StopEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  currentDayId,
  allDays
}) => {
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ItemCategory>('spot');
  const [isMustVisit, setIsMustVisit] = useState(false);
  const [mapQuery, setMapQuery] = useState('');
  const [targetDayId, setTargetDayId] = useState(currentDayId);

  useEffect(() => {
    if (initialItem) {
      setTime(initialItem.time || '');
      setLocation(initialItem.location || '');
      setNotes(initialItem.notes || '');
      setCategory(initialItem.category || 'spot');
      setIsMustVisit(!!initialItem.isMustVisit);
      setMapQuery(initialItem.mapQuery || '');
      setTargetDayId(currentDayId);
    } else {
      setTime('09:00');
      setLocation('');
      setNotes('');
      setCategory('spot');
      setIsMustVisit(false);
      setMapQuery('');
      setTargetDayId(currentDayId);
    }
  }, [initialItem, currentDayId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    const itemToSave: ItineraryItem = {
      id: initialItem?.id || `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: time.trim() || '上午',
      location: location.trim(),
      notes: notes.trim(),
      category,
      isMustVisit,
      mapQuery: mapQuery.trim() || undefined,
      completed: initialItem?.completed || false
    };

    onSave(itemToSave, targetDayId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#fffdf8] border border-[#d9d3c8] shadow-2xl p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto"
        style={{ color: '#242824' }}
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="關閉視窗"
          className="absolute top-5 right-5 p-1.5 text-[#777a74] hover:text-[#bc553b] hover:bg-[#f5f1e8] rounded-xs transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pr-8">
          <span className="text-[11px] tracking-widest text-[#777a74] font-serif-tc uppercase">
            {initialItem ? 'EDIT STOP' : 'NEW STOP'}
          </span>
          <h3 className="text-xl font-serif-tc font-semibold tracking-wide mt-0.5">
            {initialItem ? '編輯行程項目' : '新增行程項目'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Day Selector */}
          <div>
            <label className="block text-xs font-serif-tc text-[#777a74] mb-1.5">
              所屬日程
            </label>
            <select
              value={targetDayId}
              onChange={(e) => setTargetDayId(e.target.value)}
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-serif-tc text-sm"
            >
              {allDays.map((d, idx) => (
                <option key={d.id} value={d.id}>
                  Day {idx + 1} ({d.date} {d.week}) — {d.title}
                </option>
              ))}
            </select>
          </div>

          {/* Time Input & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74]">
                <Clock className="w-3.5 h-3.5 text-[#6c91a3]" />
                時間 / 時段
              </label>
              <span className="text-[11px] text-[#777a74]">可填具體時間或時段（如 09:30、下午）</span>
            </div>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="例如：09:00 或 上午"
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm"
              required
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTime(p)}
                  className={`text-[11px] px-2 py-0.5 border transition-colors ${
                    time === p
                      ? 'bg-[#6c91a3] text-white border-[#6c91a3]'
                      : 'bg-white text-[#777a74] border-[#d9d3c8] hover:border-[#6c91a3]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#bc553b]" />
              地點 / 項目名稱 <span className="text-[#bc553b]">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：八甲田樹冰纜車、古川市場（午餐）"
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm font-serif-tc font-medium"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-1.5">
              <Tag className="w-3.5 h-3.5 text-[#6c91a3]" />
              分類標籤
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((cat) => {
                const info = CATEGORY_LABELS[cat];
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-1.5 text-xs text-center border transition-all ${
                      active
                        ? 'border-[#242824] font-medium shadow-xs'
                        : 'border-[#d9d3c8] hover:border-[#777a74]'
                    }`}
                    style={{
                      backgroundColor: active ? info.bg : '#fffdf8',
                      color: active ? info.text : '#777a74'
                    }}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Details */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-1.5">
              <FileText className="w-3.5 h-3.5 text-[#777a74]" />
              備註說明（開放時間、預約資訊、交通提醒等）
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：視纜車營運、風勢與能見度決定是否前往；山頂極冷約零下10度以下。"
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm resize-none leading-relaxed"
            />
          </div>

          {/* Custom Map Search Query */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-1.5">
              <Compass className="w-3.5 h-3.5 text-[#6c91a3]" />
              自訂 Google 地圖搜尋關鍵字（選填）
            </label>
            <input
              type="text"
              value={mapQuery}
              onChange={(e) => setMapQuery(e.target.value)}
              placeholder={location ? `${location} 日本` : '自訂地標或景點日文名稱'}
              className="w-full px-3 py-1.5 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-xs"
            />
            <p className="text-[11px] text-[#777a74] mt-1">
              若未填寫，點擊「↗ 地圖」時將預設以地點名稱搜尋 Google Maps
            </p>
          </div>

          {/* Must-Visit Checkbox */}
          <div className="pt-2 border-t border-[#e8e3d8]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMustVisit}
                onChange={(e) => setIsMustVisit(e.target.checked)}
                className="w-4 h-4 accent-[#bc553b] rounded-xs cursor-pointer"
              />
              <span className="flex items-center gap-1 text-sm font-serif-tc text-[#bc553b] font-medium">
                <Star className="w-4 h-4 fill-[#bc553b]" />
                標記為「必去景點」（將以紅色印章標註重點行程）
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d9d3c8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif-tc text-[#777a74] hover:text-[#242824] hover:bg-[#f5f1e8] border border-transparent transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-serif-tc text-white bg-[#bc553b] hover:bg-[#a64730] transition-colors tracking-widest shadow-xs"
            >
              {initialItem ? '儲存變更' : '新增項目'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
