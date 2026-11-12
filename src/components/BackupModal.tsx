import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { TripPlan } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
  onImportTrip: (imported: TripPlan) => void;
  onResetToDefault: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  trip,
  onImportTrip,
  onResetToDefault
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Download JSON
  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(trip, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const safeTitle = trip.title.replace(/[^\w\u4e00-\u9fa5]/g, '_');
    downloadAnchor.setAttribute('download', `${safeTitle}_行程手帳備份.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle File Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.days || !Array.isArray(parsed.days)) {
          throw new Error('匯入的檔案格式不符合行程手帳規範（缺少 days 陣列）。');
        }
        onImportTrip(parsed);
        setImportStatus(`成功匯入「${parsed.title || '旅行計畫'}」，共 ${parsed.days.length} 天日程！`);
      } catch (err: any) {
        setErrorMsg(err.message || '無法解析 JSON 檔案，請確認格式正確。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-[#fffdf8] border border-[#d9d3c8] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
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
            DATA & BACKUP
          </span>
          <h3 className="text-xl font-serif-tc font-semibold tracking-wide mt-0.5">
            行程備份與匯入管理
          </h3>
        </div>

        <div className="space-y-4 text-xs font-sans-tc">
          {/* Status and Errors */}
          {importStatus && (
            <div className="p-3 bg-[#f1f5f3] border border-[#3c5a4f] text-[#3c5a4f] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-[#fbf0f0] border border-[#bc553b] text-[#bc553b] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Export JSON */}
          <div className="p-4 bg-[#f5f1e8] border border-[#d9d3c8]">
            <h4 className="font-serif-tc font-semibold text-sm text-[#242824] mb-1 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#6c91a3]" />
              匯出行程檔案（JSON）
            </h4>
            <p className="text-[#777a74] mb-3 leading-relaxed">
              將目前的全部行程、備註、航班、住宿與準備清單打包下載至本地，方便備份或分享給同行旅伴。
            </p>
            <button
              onClick={handleExport}
              type="button"
              className="w-full py-2 px-4 bg-[#6c91a3] hover:bg-[#5b7d8d] text-white font-serif-tc transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>下載行程備份檔 (.json)</span>
            </button>
          </div>

          {/* 2. Import JSON */}
          <div className="p-4 bg-[#f5f1e8] border border-[#d9d3c8]">
            <h4 className="font-serif-tc font-semibold text-sm text-[#242824] mb-1 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#3c5a4f]" />
              匯入行程檔案
            </h4>
            <p className="text-[#777a74] mb-3 leading-relaxed">
              載入先前備份的行程 JSON 檔案以還原資料。
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="w-full py-2 px-4 bg-white border border-[#d9d3c8] hover:border-[#3c5a4f] text-[#242824] font-serif-tc transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#3c5a4f]" />
              <span>選擇 JSON 檔案匯入</span>
            </button>
          </div>

          {/* 3. Reset to Default */}
          <div className="p-4 bg-[#fffdf8] border border-[#e8e3d8]">
            <h4 className="font-serif-tc font-semibold text-sm text-[#bc553b] mb-1 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              重設回「日本青森行」範本
            </h4>
            <p className="text-[#777a74] mb-3 leading-relaxed">
              清除目前的自訂編輯內容，恢復為最初完整的 8 天青森冬日行程與住宿景點。
            </p>
            <button
              onClick={() => {
                if (confirm('確定要重設回青森旅行初始規劃嗎？現有自訂內容將會被覆蓋。')) {
                  onResetToDefault();
                  onClose();
                }
              }}
              type="button"
              className="w-full py-2 px-4 border border-[#bc553b] text-[#bc553b] hover:bg-[#fbf0f0] font-serif-tc transition-colors"
            >
              重設回初始規劃範本
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#d9d3c8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-serif-tc text-[#777a74] hover:text-[#242824]"
          >
            完成並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
