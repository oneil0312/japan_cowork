import React, { useState } from 'react';
import { 
  MapPin, 
  Hotel, 
  CheckSquare, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check 
} from 'lucide-react';
import { Accommodation, ChecklistItem, DayPlan, MapNode } from '../types';

import { WeatherWidget } from './WeatherWidget';

interface SideColumnProps {
  currentDay: DayPlan;
  currentDayIndex: number;
  allDays: DayPlan[];
  mapNodes: Record<string, MapNode>;
  stays: Accommodation[];
  checklist: ChecklistItem[];
  winterNote: string;
  weatherCityKey?: string;
  onSelectDay: (index: number) => void;
  onUpdateStays: (stays: Accommodation[]) => void;
  onUpdateChecklist: (checklist: ChecklistItem[]) => void;
  onUpdateWinterNote: (note: string) => void;
  onUpdateWeatherCity?: (cityKey: string) => void;
  onOpenEmergency?: () => void;
}

export const SideColumn: React.FC<SideColumnProps> = ({
  currentDay,
  currentDayIndex,
  allDays,
  mapNodes,
  stays,
  checklist,
  winterNote,
  weatherCityKey,
  onSelectDay,
  onUpdateStays,
  onUpdateChecklist,
  onUpdateWinterNote,
  onUpdateWeatherCity,
  onOpenEmergency
}) => {
  // Checklist states
  const [newChecklistText, setNewChecklistText] = useState('');
  
  // Accommodation modal states
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [editingStay, setEditingStay] = useState<Accommodation | null>(null);
  const [stayName, setStayName] = useState('');
  const [stayDates, setStayDates] = useState('');
  const [stayNotes, setStayNotes] = useState('');
  const [staySymbol, setStaySymbol] = useState('宿');

  // Winter note edit state
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState(winterNote);

  // Map node click popup
  const [activeRegionPopup, setActiveRegionPopup] = useState<string | null>(null);

  // Checklist handlers
  const handleToggleCheck = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onUpdateChecklist(updated);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      text: newChecklistText.trim(),
      checked: false
    };
    onUpdateChecklist([...checklist, newItem]);
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id: string) => {
    onUpdateChecklist(checklist.filter((item) => item.id !== id));
  };

  // Accommodation handlers
  const handleOpenAddStay = () => {
    setEditingStay(null);
    setStayName('');
    setStayDates('');
    setStayNotes('');
    setStaySymbol('宿');
    setIsStayModalOpen(true);
  };

  const handleOpenEditStay = (stay: Accommodation) => {
    setEditingStay(stay);
    setStayName(stay.name);
    setStayDates(stay.dates);
    setStayNotes(stay.notes);
    setStaySymbol(stay.symbol || '宿');
    setIsStayModalOpen(true);
  };

  const handleSaveStay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stayName.trim()) return;

    if (editingStay) {
      const updated = stays.map((s) =>
        s.id === editingStay.id
          ? {
              ...s,
              name: stayName.trim(),
              dates: stayDates.trim(),
              notes: stayNotes.trim(),
              symbol: staySymbol.trim() || '宿'
            }
          : s
      );
      onUpdateStays(updated);
    } else {
      const newStay: Accommodation = {
        id: `stay-${Date.now()}`,
        name: stayName.trim(),
        dates: stayDates.trim(),
        notes: stayNotes.trim(),
        symbol: staySymbol.trim() || '宿'
      };
      onUpdateStays([...stays, newStay]);
    }
    setIsStayModalOpen(false);
  };

  const handleDeleteStay = (id: string) => {
    onUpdateStays(stays.filter((s) => s.id !== id));
  };

  const checkedCount = checklist.filter((c) => c.checked).length;
  const progressPercent = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  return (
    <aside className="space-y-6">
      {/* 0. Live Weather & Sunset */}
      <WeatherWidget 
        selectedCityKey={weatherCityKey} 
        onSelectCity={onUpdateWeatherCity} 
      />

      {/* 1. Travel Route Map */}
      <section id="map" className="bg-[#fffdf8] border border-[#d9d3c8] p-5 shadow-xs">
        <div className="flex items-baseline justify-between border-b border-[#d9d3c8] pb-2.5 mb-3">
          <h3 className="font-serif-tc text-base font-semibold tracking-wide text-[#242824] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#bc553b]" />
            旅行地圖 <small className="text-[11px] font-sans-tc text-[#777a74] font-normal tracking-widest ml-1">MAP</small>
          </h3>
          <span className="text-[11px] font-serif-tc text-[#bc553b]">
            DAY {currentDayIndex + 1} 巡訪
          </span>
        </div>

        {/* Topographic Schematic SVG */}
        <div className="relative bg-[#ece9df] border border-[#e2ddd1] p-3 rounded-xs overflow-hidden">
          <svg viewBox="0 0 320 440" className="w-full h-auto block select-none">
            {/* Base route connecting line */}
            <path
              d="M54 40 L78 94 L162 35 L195 78 L225 115 L285 338 L279 410"
              fill="none"
              stroke="#6c91a3"
              strokeWidth="2"
              strokeDasharray="4 5"
              opacity="0.8"
            />

            {/* Nodes */}
            {Object.entries(mapNodes).map(([k, node]) => {
              const isRightSide = node.x > 250;
              const isActive = (currentDay.mapRegions || []).includes(k);

              return (
                <g 
                  key={k} 
                  className="cursor-pointer transition-all hover:opacity-85"
                  onClick={() => setActiveRegionPopup(activeRegionPopup === k ? null : k)}
                >
                  {/* Subtle active glow halo */}
                  {isActive && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="12"
                      fill="#bc553b"
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  )}
                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isActive ? 7 : 4.5}
                    fill={isActive ? '#bc553b' : '#9aa39f'}
                    stroke={isActive ? '#fffdf8' : 'none'}
                    strokeWidth="1.5"
                  />
                  {/* Label */}
                  <text
                    x={isRightSide ? node.x - 12 : node.x + 12}
                    y={node.y + 4.5}
                    textAnchor={isRightSide ? 'end' : 'start'}
                    fontSize={isActive ? 13 : 11}
                    fontWeight={isActive ? '600' : '400'}
                    fill={isActive ? '#bc553b' : '#555c59'}
                    fontFamily="Noto Serif TC, serif"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Region click popup: show days visiting this region */}
          {activeRegionPopup && (
            <div className="absolute inset-x-3 bottom-3 bg-[#fffdf8] border border-[#bc553b] p-2.5 shadow-lg text-xs z-10 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#e8e3d8] pb-1 mb-1.5">
                <span className="font-serif-tc font-semibold text-[#bc553b]">
                  {mapNodes[activeRegionPopup]?.label} 走訪日程
                </span>
                <button
                  onClick={() => setActiveRegionPopup(null)}
                  className="text-[#777a74] hover:text-[#bc553b] px-1"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {allDays
                  .map((d, idx) => ({ d, idx }))
                  .filter(({ d }) => (d.mapRegions || []).includes(activeRegionPopup))
                  .map(({ d, idx }) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDay(idx);
                        setActiveRegionPopup(null);
                      }}
                      className="w-full text-left px-1.5 py-1 text-[11px] font-serif-tc hover:bg-[#f5f1e8] flex items-center justify-between"
                    >
                      <span>Day {idx + 1} ({d.date})</span>
                      <span className="text-[#777a74] truncate max-w-[120px]">{d.title}</span>
                    </button>
                  ))}
                {allDays.filter((d) => (d.mapRegions || []).includes(activeRegionPopup)).length === 0 && (
                  <p className="text-[11px] text-[#777a74]">目前尚未指定此區域的行程天數。</p>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#777a74] mt-2 font-sans-tc">
          路線示意圖；紅點為本日造訪地區，點擊地名可快速查看相關日程。
        </p>
      </section>

      {/* 2. Accommodations */}
      <section className="bg-[#fffdf8] border border-[#d9d3c8] p-5 shadow-xs">
        <div className="flex items-baseline justify-between border-b border-[#d9d3c8] pb-2.5 mb-3">
          <h3 className="font-serif-tc text-base font-semibold tracking-wide text-[#242824] flex items-center gap-1.5">
            <Hotel className="w-4 h-4 text-[#6c91a3]" />
            住宿資訊 <small className="text-[11px] font-sans-tc text-[#777a74] font-normal tracking-widest ml-1">STAY</small>
          </h3>
          <button
            onClick={handleOpenAddStay}
            className="text-xs font-serif-tc text-[#bc553b] hover:text-[#a64730] flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>新增住宿</span>
          </button>
        </div>

        <div className="space-y-3">
          {stays.length === 0 ? (
            <p className="text-xs text-[#777a74] py-3 text-center">尚未新增飯店資訊。</p>
          ) : (
            stays.map((stay) => (
              <div
                key={stay.id}
                className="group relative grid grid-cols-[56px_1fr] gap-3 items-center py-2 border-b border-[#e8e3d8] last:border-b-0"
              >
                {/* Stay Art Stamp */}
                <div className="h-14 bg-gradient-to-br from-[#c7d6d6] to-[#8ea6a7] text-white flex items-center justify-center font-serif-tc text-xl shadow-xs">
                  {stay.symbol || '宿'}
                </div>

                {/* Stay Info */}
                <div className="min-w-0 pr-12">
                  <h4 className="font-serif-tc text-sm font-semibold text-[#242824] truncate">
                    {stay.name}
                  </h4>
                  <p className="text-xs text-[#777a74] mt-0.5 font-sans-tc">{stay.dates}</p>
                  {stay.notes && (
                    <p className="text-[11px] text-[#555c59] mt-0.5 line-clamp-1">{stay.notes}</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute right-0 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditStay(stay)}
                    className="p-1 text-[#777a74] hover:text-[#bc553b] bg-white border border-[#d9d3c8]"
                    title="編輯住宿"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteStay(stay.id)}
                    className="p-1 text-[#777a74] hover:text-[#bc553b] bg-white border border-[#d9d3c8]"
                    title="刪除住宿"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. Pre-departure Checklist */}
      <section className="bg-[#fffdf8] border border-[#d9d3c8] p-5 shadow-xs">
        <div className="flex items-baseline justify-between border-b border-[#d9d3c8] pb-2.5 mb-3">
          <h3 className="font-serif-tc text-base font-semibold tracking-wide text-[#242824] flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-[#3c5a4f]" />
            出發前準備 <small className="text-[11px] font-sans-tc text-[#777a74] font-normal tracking-widest ml-1">CHECKLIST</small>
          </h3>
          <span className="text-xs text-[#777a74] font-serif-tc">
            {checkedCount} / {checklist.length} ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#f5f1e8] h-1.5 border border-[#e8e3d8] mb-3 overflow-hidden">
          <div
            className="bg-[#3c5a4f] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="group flex items-start justify-between gap-2 text-xs py-1 hover:bg-[#f5f1e8] px-1 rounded-xs transition-colors"
            >
              <label className="flex items-start gap-2.5 cursor-pointer flex-1 select-none">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleCheck(item.id)}
                  className="mt-0.5 accent-[#bc553b] rounded-xs cursor-pointer"
                />
                <span
                  className={`leading-relaxed transition-colors ${
                    item.checked ? 'line-through text-[#9a9c95]' : 'text-[#5c625c]'
                  }`}
                >
                  {item.text}
                </span>
              </label>

              <button
                onClick={() => handleDeleteChecklistItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-[#9aa099] hover:text-[#bc553b] transition-opacity"
                title="刪除清單項目"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom checklist item */}
        <form onSubmit={handleAddChecklistItem} className="mt-3 pt-3 border-t border-[#e8e3d8] flex gap-2">
          <input
            type="text"
            value={newChecklistText}
            onChange={(e) => setNewChecklistText(e.target.value)}
            placeholder="新增準備項目（如暖暖包、耳塞）..."
            className="flex-1 px-2.5 py-1 bg-[#f5f1e8] border border-[#d9d3c8] text-xs focus:border-[#bc553b] focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#3c5a4f] text-white text-xs font-serif-tc hover:bg-[#2e473e] transition-colors"
          >
            新增
          </button>
        </form>
      </section>

      {/* 4. Winter Advisory & Travel Notice */}
      <section className="bg-[#ece7dc] border border-[#d9d3c8] border-l-3 border-l-[#bc553b] p-4 text-xs shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-serif-tc font-semibold text-[#bc553b]">
            <AlertTriangle className="w-4 h-4" />
            <span>冬季旅行與即時管制提醒</span>
          </div>
          <button
            onClick={() => {
              if (isEditingNote) {
                onUpdateWinterNote(tempNote);
                setIsEditingNote(false);
              } else {
                setTempNote(winterNote);
                setIsEditingNote(true);
              }
            }}
            className="text-[11px] font-serif-tc text-[#777a74] hover:text-[#bc553b] underline"
          >
            {isEditingNote ? '儲存' : '編輯提醒'}
          </button>
        </div>

        {isEditingNote ? (
          <textarea
            rows={3}
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            className="w-full p-2 bg-[#fffdf8] border border-[#d9d3c8] text-xs text-[#555c59] resize-none focus:outline-hidden focus:border-[#bc553b]"
          />
        ) : (
          <p className="text-[#6d716b] leading-relaxed font-sans-tc">
            {winterNote}
          </p>
        )}

        {/* Emergency Quick Access inside Advisory Card */}
        {onOpenEmergency && (
          <div className="mt-4 pt-3 border-t border-[#e5dfd3]">
            <button
              onClick={onOpenEmergency}
              type="button"
              className="w-full py-2 px-3 bg-[#fff7f4] hover:bg-[#faeae6] border border-[#f5d5cc] text-[#bc553b] text-xs font-serif-tc font-medium flex items-center justify-between transition-colors shadow-xs group"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🆘</span>
                <span className="font-bold">日本急難電話速查 & 手指日語</span>
              </div>
              <span className="text-[11px] underline text-[#777a74] group-hover:text-[#bc553b]">離線可查 ↗</span>
            </button>
          </div>
        )}
      </section>

      {/* Stay Edit Modal */}
      {isStayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#fffdf8] border border-[#d9d3c8] shadow-2xl p-6 relative">
            <button
              onClick={() => setIsStayModalOpen(false)}
              className="absolute top-4 right-4 text-[#777a74] hover:text-[#bc553b]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-serif-tc text-lg font-semibold mb-4 text-[#242824]">
              {editingStay ? '編輯住宿資料' : '新增住宿飯店'}
            </h3>
            <form onSubmit={handleSaveStay} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#777a74] font-serif-tc mb-1">飯店名稱</label>
                <input
                  type="text"
                  value={stayName}
                  onChange={(e) => setStayName(e.target.value)}
                  placeholder="例如：里士滿酒店青森"
                  className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                  required
                />
              </div>
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <div>
                  <label className="block text-[#777a74] font-serif-tc mb-1">入住期間與晚數</label>
                  <input
                    type="text"
                    value={stayDates}
                    onChange={(e) => setStayDates(e.target.value)}
                    placeholder="例如：1/2 — 1/6（4 晚）"
                    className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#777a74] font-serif-tc mb-1">徽記印章</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={staySymbol}
                    onChange={(e) => setStaySymbol(e.target.value)}
                    placeholder="宿"
                    className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] text-center font-serif-tc font-bold focus:border-[#bc553b] focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#777a74] font-serif-tc mb-1">備註資訊（退房時間、早餐等）</label>
                <input
                  type="text"
                  value={stayNotes}
                  onChange={(e) => setStayNotes(e.target.value)}
                  placeholder="例如：1/6 早上退房、含早晚餐會席料理"
                  className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#d9d3c8]">
                <button
                  type="button"
                  onClick={() => setIsStayModalOpen(false)}
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
    </aside>
  );
};
