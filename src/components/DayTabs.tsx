import React, { useState } from 'react';
import { Plus, MoreVertical, Copy, Trash2, ArrowLeft, ArrowRight, Edit3 } from 'lucide-react';
import { DayPlan } from '../types';

interface DayTabsProps {
  days: DayPlan[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
  onAddDay: () => void;
  onDeleteDay: (index: number) => void;
  onDuplicateDay: (index: number) => void;
  onMoveDay: (fromIndex: number, toIndex: number) => void;
  onEditDayInfo: (index: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({
  days,
  activeDayIndex,
  onSelectDay,
  onAddDay,
  onDeleteDay,
  onDuplicateDay,
  onMoveDay,
  onEditDayInfo
}) => {
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);

  return (
    <div className="relative border-b border-[#d9d3c8] pb-3 mb-6">
      <div 
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin select-none"
        role="tablist"
        aria-label="選擇旅行日期"
      >
        {days.map((day, idx) => {
          const isActive = activeDayIndex === idx;
          const mustCount = day.stops.filter((s) => s.isMustVisit).length;

          return (
            <div key={day.id} className="relative group shrink-0">
              <button
                type="button"
                role="tab"
                id={`tab-${idx}`}
                aria-selected={isActive}
                onClick={() => onSelectDay(idx)}
                className={`relative px-4 py-2 min-w-[68px] sm:min-w-[76px] text-center transition-all cursor-pointer ${
                  isActive ? 'text-white' : 'text-[#242824] hover:text-[#bc553b]'
                }`}
              >
                {/* Active Japanese Blue Stamp Background */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-[#6c91a3] shadow-xs"
                    style={{
                      borderRadius: '50% 50% 46% 52%',
                      transform: 'rotate(-4deg) scale(0.96)'
                    }}
                  />
                )}

                <strong className="block font-serif-tc text-lg sm:text-xl font-medium leading-none">
                  {day.date}
                </strong>
                <small className={`block text-[11px] tracking-wider mt-1 font-sans-tc ${
                  isActive ? 'text-white/90' : 'text-[#777a74]'
                }`}>
                  {day.week}
                </small>

                {/* Must-go indicator or stop count */}
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className={`text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-[#9aa099]'}`}>
                    {day.stops.length}點
                  </span>
                  {mustCount > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-[#fffdf8]' : 'bg-[#bc553b]'
                      }`}
                      title={`${mustCount} 個必去重點`}
                    />
                  )}
                </div>
              </button>

              {/* Day options trigger (visible and accessible) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenIndex(menuOpenIndex === idx ? null : idx);
                }}
                className={`absolute top-0 right-0 p-1 opacity-70 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-pointer ${
                  isActive ? 'text-white' : 'text-[#777a74] hover:text-[#bc553b]'
                }`}
                title="天數操作選單"
                aria-label={`Day ${idx + 1} 選單`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* Day Options Dropdown */}
              {menuOpenIndex === idx && (
                <div 
                  className="absolute left-0 top-full mt-1 w-36 bg-[#fffdf8] border border-[#d9d3c8] shadow-lg z-30 p-1 text-xs font-serif-tc"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onEditDayInfo(idx);
                      setMenuOpenIndex(null);
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#f5f1e8] flex items-center gap-1.5 text-[#242824]"
                  >
                    <Edit3 className="w-3 h-3 text-[#6c91a3]" />
                    <span>編輯標題資訊</span>
                  </button>

                  <button
                    onClick={() => {
                      onDuplicateDay(idx);
                      setMenuOpenIndex(null);
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#f5f1e8] flex items-center gap-1.5 text-[#242824]"
                  >
                    <Copy className="w-3 h-3 text-[#6c91a3]" />
                    <span>複製這一天</span>
                  </button>

                  {idx > 0 && (
                    <button
                      onClick={() => {
                        onMoveDay(idx, idx - 1);
                        setMenuOpenIndex(null);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-[#f5f1e8] flex items-center gap-1.5 text-[#242824]"
                    >
                      <ArrowLeft className="w-3 h-3 text-[#777a74]" />
                      <span>往前移動</span>
                    </button>
                  )}

                  {idx < days.length - 1 && (
                    <button
                      onClick={() => {
                        onMoveDay(idx, idx + 1);
                        setMenuOpenIndex(null);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-[#f5f1e8] flex items-center gap-1.5 text-[#242824]"
                    >
                      <ArrowRight className="w-3 h-3 text-[#777a74]" />
                      <span>往後移動</span>
                    </button>
                  )}

                  {days.length > 1 && (
                    <button
                      onClick={() => {
                        setMenuOpenIndex(null);
                        onDeleteDay(idx);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-[#fbf0f0] flex items-center gap-1.5 text-[#bc553b] border-t border-[#e8e3d8]"
                    >
                      <Trash2 className="w-3 h-3 text-[#bc553b]" />
                      <span>刪除這一天</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Day Button */}
        <button
          onClick={onAddDay}
          type="button"
          className="shrink-0 px-3 py-2 text-xs font-serif-tc text-[#777a74] hover:text-[#bc553b] hover:bg-[#fffdf8] border border-dashed border-[#d9d3c8] hover:border-[#bc553b] flex items-center gap-1 transition-colors h-[58px]"
          title="新增旅行天數"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新增天數</span>
        </button>
      </div>

      {/* Close dropdown backdrop */}
      {menuOpenIndex !== null && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setMenuOpenIndex(null)}
        />
      )}
    </div>
  );
};
