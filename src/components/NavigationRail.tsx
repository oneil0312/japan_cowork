import React, { useState } from 'react';
import { 
  Plus, 
  Printer, 
  Download, 
  RotateCcw, 
  Calendar, 
  Settings, 
  Menu, 
  X,
  Compass,
  CheckSquare,
  Hotel,
  Plane
} from 'lucide-react';
import { TripPlan } from '../types';

interface NavigationRailProps {
  trip: TripPlan;
  onOpenAddStop: () => void;
  onOpenTripSettings: () => void;
  onOpenBackupModal: () => void;
  onResetToDefault: () => void;
  onOpenPrintView: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  trip,
  onOpenAddStop,
  onOpenTripSettings,
  onOpenBackupModal,
  onResetToDefault,
  onOpenPrintView
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#f5f1e8]/95 backdrop-blur-xs border-b border-[#d9d3c8] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTo('home')}
            className="text-left font-serif-tc font-semibold text-sm tracking-widest text-[#242824]"
          >
            {trip.title}
          </button>
          <span className="text-[11px] text-[#777a74] font-serif-tc">
            {trip.dateRange}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddStop}
            className="p-1.5 bg-[#bc553b] text-white rounded-xs"
            title="新增行程"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#242824] hover:text-[#bc553b] border border-[#d9d3c8] bg-white rounded-xs"
            aria-label="選單導覽"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[53px] z-30 bg-[#fffdf8] border-b border-[#d9d3c8] p-5 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="grid grid-cols-2 gap-2 text-xs font-serif-tc text-[#555c59] mb-4">
            <button
              onClick={() => scrollTo('home')}
              className="text-left p-2 hover:bg-[#f5f1e8] border border-transparent hover:border-[#d9d3c8]"
            >
              ⌂　首頁概覽
            </button>
            <button
              onClick={() => scrollTo('flights')}
              className="text-left p-2 hover:bg-[#f5f1e8] border border-transparent hover:border-[#d9d3c8]"
            >
              ✈　航班資訊
            </button>
            <button
              onClick={() => scrollTo('itinerary')}
              className="text-left p-2 hover:bg-[#f5f1e8] border border-transparent hover:border-[#d9d3c8]"
            >
              ▤　每日行程
            </button>
            <button
              onClick={() => scrollTo('map')}
              className="text-left p-2 hover:bg-[#f5f1e8] border border-transparent hover:border-[#d9d3c8]"
            >
              ⌖　旅行地圖
            </button>
            <button
              onClick={() => scrollTo('stay')}
              className="text-left p-2 hover:bg-[#f5f1e8] border border-transparent hover:border-[#d9d3c8]"
            >
              ▰　住宿資訊
            </button>
            <button
              onClick={() => scrollTo('checklist')}
              className="text-left p-2 hover:bg-[#f5f1e8] border border-transparent hover:border-[#d9d3c8]"
            >
              ☑　出發準備
            </button>
          </nav>

          <div className="pt-3 border-t border-[#e8e3d8] flex flex-wrap gap-2 text-xs font-serif-tc">
            <button
              onClick={() => {
                onOpenTripSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d9d3c8] bg-white hover:text-[#bc553b]"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>旅行設定</span>
            </button>
            <button
              onClick={() => {
                onOpenPrintView();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d9d3c8] bg-white hover:text-[#bc553b]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印行程本</span>
            </button>
            <button
              onClick={() => {
                onOpenBackupModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d9d3c8] bg-white hover:text-[#bc553b]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>備份與匯入</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Left Rail Navigation (Sticky) */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-44 xl:w-48 bg-[#f5f1e8]/90 border-r border-[#d9d3c8] p-6 z-30 select-none">
        {/* Brand */}
        <div>
          <button
            onClick={() => scrollTo('home')}
            className="text-left font-serif-tc font-semibold text-lg tracking-widest leading-snug text-[#242824] hover:text-[#bc553b] transition-colors"
          >
            {trip.title}
          </button>
          <div className="text-xs text-[#777a74] font-serif-tc tracking-wider mt-2.5 leading-relaxed">
            {trip.dateRange}
          </div>
        </div>

        {/* Navigation Anchor Links */}
        <nav className="mt-8 space-y-2 text-xs font-serif-tc">
          <button
            onClick={() => scrollTo('home')}
            className="w-full text-left py-1.5 px-2 text-[#777a74] hover:text-[#bc553b] hover:bg-[#fffdf8] border-l-2 border-transparent hover:border-[#bc553b] transition-colors flex items-center gap-2"
          >
            <span>⌂</span>
            <span>首頁概覽</span>
          </button>
          <button
            onClick={() => scrollTo('flights')}
            className="w-full text-left py-1.5 px-2 text-[#777a74] hover:text-[#bc553b] hover:bg-[#fffdf8] border-l-2 border-transparent hover:border-[#bc553b] transition-colors flex items-center gap-2"
          >
            <span>✈</span>
            <span>航班資訊</span>
          </button>
          <button
            onClick={() => scrollTo('itinerary')}
            className="w-full text-left py-1.5 px-2 text-[#777a74] hover:text-[#bc553b] hover:bg-[#fffdf8] border-l-2 border-transparent hover:border-[#bc553b] transition-colors flex items-center gap-2"
          >
            <span>▤</span>
            <span>每日行程</span>
          </button>
          <button
            onClick={() => scrollTo('map')}
            className="w-full text-left py-1.5 px-2 text-[#777a74] hover:text-[#bc553b] hover:bg-[#fffdf8] border-l-2 border-transparent hover:border-[#bc553b] transition-colors flex items-center gap-2"
          >
            <span>⌖</span>
            <span>旅行地圖</span>
          </button>
          <button
            onClick={() => scrollTo('stay')}
            className="w-full text-left py-1.5 px-2 text-[#777a74] hover:text-[#bc553b] hover:bg-[#fffdf8] border-l-2 border-transparent hover:border-[#bc553b] transition-colors flex items-center gap-2"
          >
            <span>▰</span>
            <span>住宿資訊</span>
          </button>
          <button
            onClick={() => scrollTo('checklist')}
            className="w-full text-left py-1.5 px-2 text-[#777a74] hover:text-[#bc553b] hover:bg-[#fffdf8] border-l-2 border-transparent hover:border-[#bc553b] transition-colors flex items-center gap-2"
          >
            <span>☑</span>
            <span>出發準備</span>
          </button>
        </nav>

        {/* Planner Quick Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[#d9d3c8] space-y-2 text-xs font-serif-tc">
          <button
            onClick={onOpenAddStop}
            className="w-full py-1.5 px-2.5 text-white bg-[#bc553b] hover:bg-[#a64730] transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增行程</span>
          </button>
          <button
            onClick={onOpenPrintView}
            className="w-full py-1.5 px-2 text-[#777a74] hover:text-[#242824] hover:bg-[#fffdf8] border border-[#d9d3c8] transition-colors flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5 text-[#6c91a3]" />
            <span>列印手帳本</span>
          </button>
          <button
            onClick={onOpenBackupModal}
            className="w-full py-1.5 px-2 text-[#777a74] hover:text-[#242824] hover:bg-[#fffdf8] border border-[#d9d3c8] transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-[#6c91a3]" />
            <span>備份與匯入</span>
          </button>
          <button
            onClick={onOpenTripSettings}
            className="w-full py-1.5 px-2 text-[#777a74] hover:text-[#242824] hover:bg-[#fffdf8] border border-[#d9d3c8] transition-colors flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5 text-[#6c91a3]" />
            <span>旅程設定</span>
          </button>
        </div>

        {/* Japanese Vertical Motto */}
        <div className="mt-auto pt-6 border-t border-[#d9d3c8] flex justify-center">
          <div 
            className="text-xs font-serif-tc text-[#85867e] tracking-[0.28em] select-none"
            style={{ writingMode: 'vertical-rl' }}
          >
            雪と、旅をしよう。
          </div>
        </div>
      </aside>
    </>
  );
};
