import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit3, MapPin, Tag } from 'lucide-react';
import { DayPlan, MapNode } from '../types';

interface DayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDay: DayPlan) => void;
  day: DayPlan | null;
  dayIndex: number;
  availableNodes: Record<string, MapNode>;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  day,
  dayIndex,
  availableNodes
}) => {
  const [date, setDate] = useState('');
  const [week, setWeek] = useState('SAT');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [stamp, setStamp] = useState('');
  const [mapRegions, setMapRegions] = useState<string[]>([]);

  useEffect(() => {
    if (day) {
      setDate(day.date || '');
      setWeek(day.week || 'SAT');
      setTitle(day.title || '');
      setDesc(day.desc || '');
      setStamp(day.stamp || `青森冬旅 · DAY ${dayIndex + 1}`);
      setMapRegions(day.mapRegions || []);
    }
  }, [day, dayIndex, isOpen]);

  if (!isOpen || !day) return null;

  const handleToggleRegion = (key: string) => {
    setMapRegions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...day,
      date: date.trim() || '1/1',
      week: week.trim() || 'MON',
      title: title.trim(),
      desc: desc.trim(),
      stamp: stamp.trim() || `青森冬旅 · DAY ${dayIndex + 1}`,
      mapRegions
    });
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
            DAY {dayIndex + 1} SETTINGS
          </span>
          <h3 className="text-xl font-serif-tc font-semibold tracking-wide mt-0.5">
            編輯第 {dayIndex + 1} 天概況
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Date & Week */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6c91a3]" />
                日期簡稱
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="例如：1/3 或 01.03"
                className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm font-serif-tc font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-serif-tc text-[#777a74] mb-1.5">
                星期標籤
              </label>
              <input
                type="text"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="例如：SUN、週日"
                className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm uppercase tracking-wider"
                required
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#bc553b]" />
              本日主題標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：神社、在地美食與藝術文化"
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm font-serif-tc font-semibold"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-serif-tc text-[#777a74] mb-1.5">
              本日概覽描述 / 重點提醒
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="概括這天的移動計畫、節奏或冬季天候注意事項..."
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm resize-none leading-relaxed"
            />
          </div>

          {/* Stamp */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-1.5">
              <Tag className="w-3.5 h-3.5 text-[#bc553b]" />
              日誌印章文字（Stamp）
            </label>
            <input
              type="text"
              value={stamp}
              onChange={(e) => setStamp(e.target.value)}
              placeholder={`例如：青森冬旅 · DAY ${dayIndex + 1}`}
              className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden text-sm font-serif-tc"
            />
          </div>

          {/* Map Region Association */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif-tc text-[#777a74] mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#6c91a3]" />
              地圖點位關聯（選取後會在旅行地圖上點亮紅點）
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(availableNodes).map(([key, node]) => {
                const isSelected = mapRegions.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleRegion(key)}
                    className={`px-3 py-1.5 text-xs font-serif-tc border transition-colors ${
                      isSelected
                        ? 'bg-[#bc553b] text-white border-[#bc553b]'
                        : 'bg-white text-[#777a74] border-[#d9d3c8] hover:border-[#bc553b]'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{node.label}
                  </button>
                );
              })}
            </div>
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
              儲存變更
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
