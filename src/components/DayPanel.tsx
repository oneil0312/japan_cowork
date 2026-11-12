import React, { useState } from 'react';
import { 
  GripVertical, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Star, 
  Check, 
  Search,
  Filter,
  Calendar,
  Share2
} from 'lucide-react';
import { DayPlan, ItineraryItem, ItemCategory } from '../types';
import { CATEGORY_LABELS, mapsUrl } from '../initialData';

interface DayPanelProps {
  day: DayPlan;
  dayIndex: number;
  totalDays: number;
  allDays: DayPlan[];
  onAddStop: () => void;
  onEditStop: (item: ItineraryItem) => void;
  onDeleteStop: (stopId: string) => void;
  onReorderStops: (dayId: string, startIndex: number, endIndex: number) => void;
  onToggleComplete: (stopId: string) => void;
  onEditDay: () => void;
  onMoveStopToDay: (stopId: string, targetDayId: string) => void;
}

export const DayPanel: React.FC<DayPanelProps> = ({
  day,
  dayIndex,
  totalDays,
  allDays,
  onAddStop,
  onEditStop,
  onDeleteStop,
  onReorderStops,
  onToggleComplete,
  onEditDay,
  onMoveStopToDay
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMustOnly, setFilterMustOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [movingStopId, setMovingStopId] = useState<string | null>(null);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // leave
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex !== targetIndex) {
      onReorderStops(day.id, draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move Up / Down button handlers
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorderStops(day.id, index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < day.stops.length - 1) {
      onReorderStops(day.id, index, index + 1);
    }
  };

  // Filtered stops
  const filteredStops = day.stops.filter((s) => {
    if (filterMustOnly && !s.isMustVisit) return false;
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLoc = s.location.toLowerCase().includes(q);
      const matchNote = s.notes.toLowerCase().includes(q);
      const matchTime = s.time.toLowerCase().includes(q);
      if (!matchLoc && !matchNote && !matchTime) return false;
    }
    return true;
  });

  const isFiltering = searchQuery.trim() !== '' || filterMustOnly || selectedCategory !== 'all';

  return (
    <div className="w-full">
      {/* Day Overview Intro */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start pb-6 mb-6 border-b border-[#d9d3c8]">
        {/* Big Date Display */}
        <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-0">
          <div className="font-serif-tc text-5xl md:text-6xl font-medium tracking-tight text-[#242824] leading-none">
            {day.date}
          </div>
          <div className="font-serif-tc text-sm tracking-widest text-[#777a74] md:mt-2">
            {day.week}
          </div>
          <div className="mt-2 text-[11px] font-serif-tc text-[#bc553b] border border-[#bc553b] px-2 py-0.5 inline-block">
            {day.stamp || `青森冬旅 · DAY ${dayIndex + 1}`}
          </div>
        </div>

        {/* Title, description and controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif-tc text-xl sm:text-2xl font-semibold tracking-wide text-[#242824]">
              {day.title}
            </h3>
            <button
              onClick={onEditDay}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif-tc text-[#777a74] hover:text-[#bc553b] border border-[#d9d3c8] hover:border-[#bc553b] bg-[#fffdf8] transition-colors shrink-0"
              title="編輯本日標題與描述"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>編輯本天</span>
            </button>
          </div>

          <p className="font-sans-tc text-sm text-[#555c59] mt-2.5 leading-relaxed">
            {day.desc || '尚未填寫本日備忘描述。'}
          </p>

          {/* Quick Stats & Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#e8e3d8]">
            <div className="flex items-center gap-3 text-xs text-[#777a74]">
              <span>共 {day.stops.length} 個行程項目</span>
              <span aria-hidden="true">·</span>
              <span>{day.stops.filter((s) => s.isMustVisit).length} 個必訪重點</span>
              {day.stops.some((s) => s.completed) && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#3c5a4f]">
                    已完成 {day.stops.filter((s) => s.completed).length} 項
                  </span>
                </>
              )}
            </div>

            <button
              onClick={onAddStop}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-serif-tc text-white bg-[#bc553b] hover:bg-[#a64730] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增行程項目</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#fffdf8] border border-[#d9d3c8] p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#777a74]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋本日景點、備註或時間..."
            className="w-full bg-transparent border-0 focus:outline-hidden text-xs text-[#242824] placeholder:text-[#9aa099]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#777a74] hover:text-[#bc553b] text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Must Visit Toggle */}
          <button
            onClick={() => setFilterMustOnly(!filterMustOnly)}
            type="button"
            className={`inline-flex items-center gap-1 px-2.5 py-1 border transition-colors ${
              filterMustOnly
                ? 'bg-[#bc553b] text-white border-[#bc553b]'
                : 'bg-white text-[#777a74] border-[#d9d3c8] hover:border-[#bc553b]'
            }`}
          >
            <Star className={`w-3 h-3 ${filterMustOnly ? 'fill-white' : ''}`} />
            <span>僅看必去</span>
          </button>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ItemCategory | 'all')}
            className="px-2.5 py-1 bg-white border border-[#d9d3c8] text-[#777a74] focus:outline-hidden"
          >
            <option value="all">全部分類</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {isFiltering && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterMustOnly(false);
                setSelectedCategory('all');
              }}
              className="text-[#bc553b] hover:underline ml-1"
            >
              重設
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Hint */}
      {day.stops.length > 1 && !isFiltering && (
        <div className="flex items-center justify-between text-[11px] text-[#777a74] mb-4 px-1">
          <span className="flex items-center gap-1">
            <GripVertical className="w-3.5 h-3.5 text-[#6c91a3]" />
            提示：可拖曳項目左側圖示進行上下排序，或使用右側箭頭微調
          </span>
          <span className="hidden sm:inline">拖曳即時儲存</span>
        </div>
      )}

      {/* Itinerary Timeline */}
      {day.stops.length === 0 ? (
        <div className="text-center py-14 px-4 bg-[#fffdf8] border border-dashed border-[#d9d3c8]">
          <Calendar className="w-10 h-10 mx-auto text-[#6c91a3] mb-3 stroke-1" />
          <h4 className="font-serif-tc text-base font-semibold text-[#242824]">
            這一天目前還沒有安排行程
          </h4>
          <p className="font-sans-tc text-xs text-[#777a74] mt-1 max-w-sm mx-auto">
            點擊下方按鈕開始新增時間、景點或餐廳，為這天添上第一筆精彩記錄。
          </p>
          <button
            onClick={onAddStop}
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-xs font-serif-tc text-white bg-[#bc553b] hover:bg-[#a64730] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>新增第一個行程項目</span>
          </button>
        </div>
      ) : filteredStops.length === 0 ? (
        <div className="text-center py-10 px-4 bg-[#fffdf8] border border-[#d9d3c8] text-[#777a74] text-xs">
          沒有符合篩選條件的行程項目。
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterMustOnly(false);
              setSelectedCategory('all');
            }}
            className="text-[#bc553b] hover:underline ml-2"
          >
            清除篩選條件
          </button>
        </div>
      ) : (
        <div className="relative border-l border-[#c7c9c2] ml-3.5 sm:ml-4 pl-6 sm:pl-7 space-y-4">
          {filteredStops.map((stop) => {
            const originalIndex = day.stops.findIndex((s) => s.id === stop.id);
            const isDragging = draggedIndex === originalIndex;
            const isDragOver = dragOverIndex === originalIndex;
            const catInfo = stop.category ? CATEGORY_LABELS[stop.category] : null;

            return (
              <article
                key={stop.id}
                draggable={!isFiltering}
                onDragStart={(e) => handleDragStart(e, originalIndex)}
                onDragOver={(e) => handleDragOver(e, originalIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, originalIndex)}
                onDragEnd={handleDragEnd}
                className={`relative group bg-[#fffdf8] border transition-all duration-150 p-4 sm:p-5 ${
                  isDragging
                    ? 'opacity-40 border-dashed border-[#bc553b]'
                    : isDragOver
                    ? 'border-t-2 border-t-[#bc553b] border-[#d9d3c8]'
                    : stop.completed
                    ? 'border-[#d9d3c8] opacity-75 bg-[#fbf9f4]'
                    : 'border-[#d9d3c8] hover:border-[#6c91a3]'
                }`}
              >
                {/* Timeline Dot on left line */}
                <div
                  className={`absolute -left-[31px] sm:-left-[35px] top-6 w-3 h-3 rounded-full border-2 border-[#f5f1e8] transition-colors ${
                    stop.isMustVisit
                      ? 'bg-[#bc553b]'
                      : stop.completed
                      ? 'bg-[#3c5a4f]'
                      : 'bg-[#6c91a3]'
                  }`}
                  aria-hidden="true"
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Column: Drag handle + Time + Content */}
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {/* Drag Handle */}
                    {!isFiltering && (
                      <div
                        className="cursor-grab active:cursor-grabbing text-[#9aa099] hover:text-[#242824] pt-0.5 select-none touch-none shrink-0"
                        title="拖曳上下排序"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}

                    {/* Main stop info */}
                    <div className="flex-1 min-w-0">
                      {/* Time and Category Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#777a74] mb-1 font-sans-tc">
                        <span className="font-serif-tc font-medium text-[#242824] bg-[#f5f1e8] px-2 py-0.5 border border-[#e8e3d8]">
                          {stop.time}
                        </span>

                        {catInfo && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span
                              className="text-[11px] px-1.5 py-0.5"
                              style={{ color: catInfo.text, backgroundColor: catInfo.bg }}
                            >
                              {catInfo.label}
                            </span>
                          </>
                        )}

                        {stop.isMustVisit && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[11px] font-serif-tc text-[#bc553b] border border-[#bc553b] px-1.5 py-0.2 tracking-widest">
                              必去
                            </span>
                          </>
                        )}
                      </div>

                      {/* Stop Location Name */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-serif-tc text-base sm:text-lg font-semibold tracking-wide text-[#242824] ${
                            stop.completed ? 'line-through text-[#777a74]' : ''
                          }`}
                        >
                          {stop.location}
                        </h4>

                        {/* Google Maps External Link */}
                        <a
                          href={mapsUrl(stop.location, stop.mapQuery)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#bc553b] hover:text-[#a64730] border-b border-[#d8a99c] hover:border-[#bc553b] transition-colors py-0.5"
                          title={`在 Google 地圖搜尋「${stop.mapQuery || stop.location}」`}
                        >
                          <span>↗ 地圖</span>
                        </a>
                      </div>

                      {/* Notes / Remarks */}
                      {stop.notes && (
                        <p className="font-sans-tc text-xs sm:text-sm text-[#5b5f59] mt-2 leading-relaxed">
                          {stop.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions (Edit, Move Up/Down, Move Day, Delete, Check) */}
                  <div className="flex items-center gap-1 sm:self-start border-t sm:border-t-0 pt-2 sm:pt-0 border-[#e8e3d8] justify-end shrink-0">
                    {/* Toggle Completed */}
                    <button
                      onClick={() => onToggleComplete(stop.id)}
                      type="button"
                      className={`p-1.5 border transition-colors ${
                        stop.completed
                          ? 'bg-[#3c5a4f] text-white border-[#3c5a4f]'
                          : 'text-[#777a74] hover:text-[#3c5a4f] border-[#d9d3c8] hover:border-[#3c5a4f] bg-white'
                      }`}
                      title={stop.completed ? '標記為未完成' : '標記為已到訪 / 完成'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Up */}
                    {!isFiltering && (
                      <button
                        onClick={() => handleMoveUp(originalIndex)}
                        disabled={originalIndex === 0}
                        type="button"
                        className="p-1.5 text-[#777a74] hover:text-[#242824] disabled:opacity-30 disabled:cursor-not-allowed border border-[#d9d3c8] bg-white transition-colors"
                        title="往上移動"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Move Down */}
                    {!isFiltering && (
                      <button
                        onClick={() => handleMoveDown(originalIndex)}
                        disabled={originalIndex === day.stops.length - 1}
                        type="button"
                        className="p-1.5 text-[#777a74] hover:text-[#242824] disabled:opacity-30 disabled:cursor-not-allowed border border-[#d9d3c8] bg-white transition-colors"
                        title="往下移動"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Move to another Day */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMovingStopId(movingStopId === stop.id ? null : stop.id)
                        }
                        type="button"
                        className="p-1.5 text-[#777a74] hover:text-[#6c91a3] border border-[#d9d3c8] bg-white transition-colors"
                        title="移動到其他天"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {movingStopId === stop.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#fffdf8] border border-[#d9d3c8] shadow-lg z-20 p-1 text-xs">
                          <div className="px-2 py-1 text-[11px] font-serif-tc text-[#777a74] border-b border-[#e8e3d8]">
                            移至其他日程：
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {allDays.map((targetD, tIdx) => {
                              const isCurrent = targetD.id === day.id;
                              return (
                                <button
                                  key={targetD.id}
                                  disabled={isCurrent}
                                  onClick={() => {
                                    onMoveStopToDay(stop.id, targetD.id);
                                    setMovingStopId(null);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 text-xs truncate hover:bg-[#f5f1e8] font-serif-tc ${
                                    isCurrent ? 'opacity-40 cursor-not-allowed' : 'text-[#242824]'
                                  }`}
                                >
                                  Day {tIdx + 1} ({targetD.date}) {targetD.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Edit Stop */}
                    <button
                      onClick={() => onEditStop(stop)}
                      type="button"
                      className="p-1.5 text-[#777a74] hover:text-[#bc553b] border border-[#d9d3c8] bg-white transition-colors"
                      title="編輯此行程"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Stop */}
                    <button
                      onClick={() => onDeleteStop(stop.id)}
                      type="button"
                      className="p-1.5 text-[#777a74] hover:text-[#bc553b] border border-[#d9d3c8] bg-white transition-colors"
                      title="刪除此行程"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add Stop Button at Bottom */}
      {day.stops.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#d9d3c8] flex justify-center">
          <button
            onClick={onAddStop}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-serif-tc text-[#242824] hover:text-[#bc553b] border border-[#d9d3c8] hover:border-[#bc553b] bg-[#fffdf8] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#bc553b]" />
            <span>新增行程項目至本日末尾</span>
          </button>
        </div>
      )}
    </div>
  );
};
