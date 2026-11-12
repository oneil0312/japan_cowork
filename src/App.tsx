import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { syncUserProfile } from './services/tripService';
import { initialTripData } from './initialData';
import { normalizeTrip, getNextDayInfo } from './utils/tripUtils';
import { TripPlan, ItineraryItem, DayPlan, FlightInfo, Accommodation, ChecklistItem } from './types';
import { NavigationRail } from './components/NavigationRail';
import { HeroSection } from './components/HeroSection';
import { DayTabs } from './components/DayTabs';
import { DayPanel } from './components/DayPanel';
import { SideColumn } from './components/SideColumn';
import { StopEditModal } from './components/StopEditModal';
import { DayEditModal } from './components/DayEditModal';
import { TripSettingsModal } from './components/TripSettingsModal';
import { BackupModal } from './components/BackupModal';
import { PrintView } from './components/PrintView';
import { CloudTripsModal } from './components/CloudTripsModal';

const STORAGE_KEY = 'aomori-travel-planner-v2';

export default function App() {
  // Load trip from localStorage or fallback to initial data
  const [trip, setTrip] = useState<TripPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const normalized = normalizeTrip(JSON.parse(saved));
        if (normalized) return normalized;
      }
    } catch (e) {
      console.warn('Failed to read stored itinerary data:', e);
    }
    return initialTripData;
  });

  // Current active day index
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals state
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<ItineraryItem | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(0);
  const [isTripSettingsOpen, setIsTripSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Undo delete toast state
  const [toast, setToast] = useState<{
    message: string;
    undoAction?: () => void;
  } | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        syncUserProfile(user).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch (e) {
      console.warn('Failed to save itinerary to localStorage:', e);
    }
  }, [trip]);

  // Ensure activeDayIndex remains valid
  useEffect(() => {
    if (activeDayIndex >= trip.days.length) {
      setActiveDayIndex(Math.max(0, trip.days.length - 1));
    }
  }, [trip.days.length, activeDayIndex]);

  // Show auto-dismissing toast (新的 toast 會取消前一個的計時器)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, undoAction?: () => void) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undoAction });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const currentDay = trip.days[activeDayIndex] || trip.days[0];

  // ================= STOPS MANAGEMENT =================
  const handleOpenAddStop = () => {
    setEditingStop(null);
    setIsStopModalOpen(true);
  };

  const handleOpenEditStop = (item: ItineraryItem) => {
    setEditingStop(item);
    setIsStopModalOpen(true);
  };

  const handleSaveStop = (savedItem: ItineraryItem, targetDayId: string) => {
    setTrip((prev) => {
      const isExisting = prev.days.some((d) => d.stops.some((s) => s.id === savedItem.id));

      if (isExisting) {
        // Remove from old day first, then add to target day (handles moving between days)
        const updatedDays = prev.days.map((d) => {
          if (d.id === targetDayId) {
            const hasIt = d.stops.some((s) => s.id === savedItem.id);
            if (hasIt) {
              return {
                ...d,
                stops: d.stops.map((s) => (s.id === savedItem.id ? savedItem : s))
              };
            } else {
              return {
                ...d,
                stops: [...d.stops, savedItem]
              };
            }
          } else {
            return {
              ...d,
              stops: d.stops.filter((s) => s.id !== savedItem.id)
            };
          }
        });
        return { ...prev, days: updatedDays };
      } else {
        // Brand new stop: add to targetDay
        const updatedDays = prev.days.map((d) => {
          if (d.id === targetDayId) {
            return {
              ...d,
              stops: [...d.stops, savedItem]
            };
          }
          return d;
        });
        return { ...prev, days: updatedDays };
      }
    });

    showToast(`已儲存行程項目「${savedItem.location}」`);
  };

  const handleDeleteStop = (stopId: string) => {
    // Find stop to support Undo
    let deletedItem: ItineraryItem | null = null;
    let originalDayId: string | null = null;
    let originalIndex = -1;

    for (const d of trip.days) {
      const idx = d.stops.findIndex((s) => s.id === stopId);
      if (idx !== -1) {
        deletedItem = d.stops[idx];
        originalDayId = d.id;
        originalIndex = idx;
        break;
      }
    }

    if (!deletedItem || !originalDayId) return;

    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) => ({
        ...d,
        stops: d.stops.filter((s) => s.id !== stopId)
      }))
    }));

    showToast(`已刪除「${deletedItem.location}」`, () => {
      // Undo callback
      setTrip((prev) => ({
        ...prev,
        days: prev.days.map((d) => {
          if (d.id === originalDayId && deletedItem) {
            const newStops = [...d.stops];
            newStops.splice(originalIndex, 0, deletedItem);
            return { ...d, stops: newStops };
          }
          return d;
        })
      }));
    });
  };

  // Reorder stops within a day (Drag & Drop or Move Up/Down)
  const handleReorderStops = (dayId: string, startIndex: number, endIndex: number) => {
    setTrip((prev) => {
      const updatedDays = prev.days.map((d) => {
        if (d.id !== dayId) return d;
        const newStops = [...d.stops];
        const [movedItem] = newStops.splice(startIndex, 1);
        newStops.splice(endIndex, 0, movedItem);
        return { ...d, stops: newStops };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Move stop to another day directly
  const handleMoveStopToDay = (stopId: string, targetDayId: string) => {
    setTrip((prev) => {
      let movedStop: ItineraryItem | null = null;
      prev.days.forEach((d) => {
        const found = d.stops.find((s) => s.id === stopId);
        if (found) movedStop = found;
      });
      if (!movedStop) return prev;

      const updatedDays = prev.days.map((d) => {
        if (d.id === targetDayId && movedStop) {
          return { ...d, stops: [...d.stops, movedStop] };
        }
        return { ...d, stops: d.stops.filter((s) => s.id !== stopId) };
      });
      return { ...prev, days: updatedDays };
    });
    showToast(`行程已成功移動到所選日程！`);
  };

  // Toggle completed status
  const handleToggleComplete = (stopId: string) => {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) => ({
        ...d,
        stops: d.stops.map((s) =>
          s.id === stopId ? { ...s, completed: !s.completed } : s
        )
      }))
    }));
  };

  // ================= DAYS MANAGEMENT =================
  const handleAddDay = () => {
    const nextDayNum = trip.days.length + 1;
    // 依上一天推算下一天（處理月底與跨年進位）
    const lastDay = trip.days[trip.days.length - 1];
    const next = getNextDayInfo(lastDay?.date, trip.startDate);
    const nextDate = next?.date ?? `1/${nextDayNum + 1}`;
    const nextWeek = next?.week ?? 'SUN';

    const newDay: DayPlan = {
      id: `day-${Date.now()}`,
      date: nextDate,
      week: nextWeek,
      title: `第 ${nextDayNum} 天行程安排`,
      desc: '規劃充實而從容的一日，享受旅行的每分每秒。',
      stamp: `青森冬旅 · DAY ${nextDayNum}`,
      mapRegions: ['aomo'],
      stops: []
    };

    setTrip((prev) => ({
      ...prev,
      days: [...prev.days, newDay]
    }));

    setActiveDayIndex(trip.days.length);
    showToast(`已新增 Day ${nextDayNum} (${nextDate})`);
  };

  const handleDeleteDay = (index: number) => {
    if (trip.days.length <= 1) return;
    const removedDay = trip.days[index];
    setTrip((prev) => ({
      ...prev,
      days: prev.days.filter((_, idx) => idx !== index)
    }));
    setActiveDayIndex(Math.max(0, index - 1));
    showToast(`已刪除 Day ${index + 1} (${removedDay.date})`);
  };

  const handleDuplicateDay = (index: number) => {
    const dayToClone = trip.days[index];
    const clonedDay: DayPlan = {
      ...dayToClone,
      id: `day-${Date.now()}`,
      title: `${dayToClone.title} (副本)`,
      stamp: `${dayToClone.stamp || '旅行手帳'} (副本)`,
      stops: dayToClone.stops.map((s) => ({
        ...s,
        id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      }))
    };

    const newDays = [...trip.days];
    newDays.splice(index + 1, 0, clonedDay);

    setTrip((prev) => ({ ...prev, days: newDays }));
    setActiveDayIndex(index + 1);
    showToast(`已成功複製 Day ${index + 1} 至下一日程`);
  };

  const handleMoveDay = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= trip.days.length) return;
    const newDays = [...trip.days];
    const [moved] = newDays.splice(fromIndex, 1);
    newDays.splice(toIndex, 0, moved);
    setTrip((prev) => ({ ...prev, days: newDays }));
    setActiveDayIndex(toIndex);
  };

  const handleOpenEditDayInfo = (index: number) => {
    setEditingDayIndex(index);
    setIsDayModalOpen(true);
  };

  const handleSaveDayInfo = (updatedDay: DayPlan) => {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === updatedDay.id ? updatedDay : d))
    }));
    showToast(`已儲存第 ${editingDayIndex + 1} 天概況資訊`);
  };

  // ================= OTHER UPDATES =================
  const handleUpdateFlights = (flights: FlightInfo[]) => {
    setTrip((prev) => ({ ...prev, flights }));
    showToast('航班資訊已更新');
  };

  const handleUpdateStays = (stays: Accommodation[]) => {
    setTrip((prev) => ({ ...prev, stays }));
    showToast('住宿資料已更新');
  };

  const handleUpdateChecklist = (checklist: ChecklistItem[]) => {
    setTrip((prev) => ({ ...prev, checklist }));
  };

  const handleUpdateWinterNote = (winterNote: string) => {
    setTrip((prev) => ({ ...prev, winterNote }));
    showToast('已更新冬季旅遊注意事項');
  };

  const handleUpdateTripSettings = (updated: Partial<TripPlan>) => {
    setTrip((prev) => ({ ...prev, ...updated }));
    showToast('手帳封面與旅程設定已儲存');
  };

  const handleResetToDefault = () => {
    setTrip(initialTripData);
    setActiveDayIndex(0);
    showToast('已還原為青森 8 日初始範本');
  };

  const handleImportTrip = (imported: TripPlan) => {
    setTrip(normalizeTrip(imported) ?? initialTripData);
    setActiveDayIndex(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f1e8] text-[#242824]">
      {/* Shell Layout: Left Rail + Main Content */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:grid lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)] min-h-screen">
        {/* Navigation Rail */}
        <NavigationRail
          trip={trip}
          currentUser={currentUser}
          onOpenAddStop={handleOpenAddStop}
          onOpenTripSettings={() => setIsTripSettingsOpen(true)}
          onOpenBackupModal={() => setIsBackupOpen(true)}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
          onResetToDefault={handleResetToDefault}
          onOpenPrintView={() => setIsPrintViewOpen(true)}
        />

        {/* Main Content Area */}
        <main className="min-w-0 px-4 sm:px-6 md:px-10 lg:px-12 py-6 sm:py-8 lg:py-10 space-y-8">
          {/* Hero Section & Flights */}
          <HeroSection
            trip={trip}
            currentUser={currentUser}
            onEditTrip={() => setIsTripSettingsOpen(true)}
            onUpdateFlights={handleUpdateFlights}
            onOpenCloud={() => setIsCloudModalOpen(true)}
          />

          {/* Daily Itinerary Section */}
          <section id="itinerary" className="pt-2">
            {/* Section Title */}
            <div className="flex items-baseline justify-between border-b border-[#d9d3c8] pb-2.5 mb-5">
              <h2 className="font-serif-tc text-2xl sm:text-3xl font-semibold tracking-wide text-[#242824] flex items-baseline gap-3">
                每日行程
                <small className="font-sans-tc text-xs font-normal text-[#777a74] tracking-[0.2em]">
                  DAILY PLAN
                </small>
              </h2>
              <div className="text-xs font-serif-tc text-[#777a74]">
                第 {activeDayIndex + 1} 天 / 共 {trip.days.length} 天
              </div>
            </div>

            {/* Day Tabs */}
            <DayTabs
              days={trip.days}
              activeDayIndex={activeDayIndex}
              onSelectDay={(idx) => setActiveDayIndex(idx)}
              onAddDay={handleAddDay}
              onDeleteDay={handleDeleteDay}
              onDuplicateDay={handleDuplicateDay}
              onMoveDay={handleMoveDay}
              onEditDayInfo={handleOpenEditDayInfo}
            />

            {/* 2-Column Grid: Timeline (1.65fr) & Side Column (.85fr) */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)] gap-8 items-start">
              {/* Left Column: Itinerary Timeline */}
              <div className="min-w-0">
                {currentDay && (
                  <DayPanel
                    day={currentDay}
                    dayIndex={activeDayIndex}
                    totalDays={trip.days.length}
                    allDays={trip.days}
                    onAddStop={handleOpenAddStop}
                    onEditStop={handleOpenEditStop}
                    onDeleteStop={handleDeleteStop}
                    onReorderStops={handleReorderStops}
                    onToggleComplete={handleToggleComplete}
                    onEditDay={() => handleOpenEditDayInfo(activeDayIndex)}
                    onMoveStopToDay={handleMoveStopToDay}
                  />
                )}
              </div>

              {/* Right Column: Map, Stays, Checklist, Advisory */}
              <div className="min-w-0">
                <SideColumn
                  currentDay={currentDay}
                  currentDayIndex={activeDayIndex}
                  allDays={trip.days}
                  mapNodes={trip.mapNodes}
                  stays={trip.stays}
                  checklist={trip.checklist}
                  winterNote={trip.winterNote}
                  onSelectDay={(idx) => setActiveDayIndex(idx)}
                  onUpdateStays={handleUpdateStays}
                  onUpdateChecklist={handleUpdateChecklist}
                  onUpdateWinterNote={handleUpdateWinterNote}
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-[#d9d3c8] pt-6 pb-8 text-xs text-[#777a74] flex flex-col sm:flex-row justify-between items-center gap-3 font-serif-tc">
            <span>{trip.title} · 旅行規劃手帳 © {new Date().getFullYear()}</span>
            <span>静けさを、旅する。在白色的季節遇見最靜謐的旅程</span>
          </footer>
        </main>
      </div>

      {/* Undo / Feedback Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#242824] text-[#fffdf8] px-4 py-2.5 shadow-2xl flex items-center gap-4 text-xs font-serif-tc border border-[#3c423c] animate-in slide-in-from-bottom-2 duration-150">
          <span>{toast.message}</span>
          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.();
                setToast(null);
              }}
              className="text-[#bc553b] hover:underline font-bold"
            >
              復原 (Undo)
            </button>
          )}
        </div>
      )}

      {/* Stop Edit Modal (Add or Edit) */}
      <StopEditModal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        onSave={handleSaveStop}
        initialItem={editingStop}
        currentDayId={currentDay?.id || trip.days[0]?.id}
        allDays={trip.days}
      />

      {/* Day Edit Modal */}
      <DayEditModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        onSave={handleSaveDayInfo}
        day={trip.days[editingDayIndex] || null}
        dayIndex={editingDayIndex}
        availableNodes={trip.mapNodes}
      />

      {/* Trip Settings Modal */}
      <TripSettingsModal
        isOpen={isTripSettingsOpen}
        onClose={() => setIsTripSettingsOpen(false)}
        trip={trip}
        onSave={handleUpdateTripSettings}
      />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        trip={trip}
        onImportTrip={handleImportTrip}
        onResetToDefault={handleResetToDefault}
      />

      {/* Print / PDF Friendly Booklet View */}
      {isPrintViewOpen && (
        <PrintView
          trip={trip}
          onClose={() => setIsPrintViewOpen(false)}
        />
      )}

      {/* Cloud Firestore Trips & Sync Modal */}
      <CloudTripsModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentTrip={trip}
        currentUser={currentUser}
        onLoadTrip={(loadedTrip) => {
          loadedTrip = normalizeTrip(loadedTrip) ?? loadedTrip;
          setTrip(loadedTrip);
          setActiveDayIndex(0);
          showToast(`已載入雲端行程「${loadedTrip.title}」！`);
        }}
        onTripSaved={() => {
          showToast(`行程「${trip.title}」已成功儲存至 Firestore！僅本行程成員可讀寫。`);
        }}
        onUpdateTripMembers={(memberEmails) => {
          setTrip((prev) => ({ ...prev, memberEmails }));
        }}
      />
    </div>
  );
}
