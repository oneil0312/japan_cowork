import { TripPlan } from '../types';
import { initialTripData } from '../initialData';

const WEEKS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * 將任意來源（localStorage、匯入 JSON、雲端）的資料補齊成完整 TripPlan，
 * 避免缺少欄位時元件在 .map 或讀取屬性時崩潰。
 * 若連 days 都不是陣列，回傳 null 讓呼叫端決定如何處理。
 */
export function normalizeTrip(raw: unknown): TripPlan | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Partial<TripPlan>;
  if (!Array.isArray(t.days)) return null;

  const base = initialTripData;
  return {
    ...base,
    ...t,
    id: typeof t.id === 'string' && t.id ? t.id : `trip-${Date.now()}`,
    title: typeof t.title === 'string' && t.title ? t.title : '我的旅行計畫',
    flights: Array.isArray(t.flights) ? t.flights : [],
    stays: Array.isArray(t.stays) ? t.stays : [],
    checklist: Array.isArray(t.checklist) ? t.checklist : [],
    memberEmails: Array.isArray(t.memberEmails) ? t.memberEmails : [],
    members: Array.isArray(t.members) ? t.members : [],
    mapNodes: t.mapNodes && typeof t.mapNodes === 'object' ? t.mapNodes : {},
    winterNote: typeof t.winterNote === 'string' ? t.winterNote : '',
    days: t.days.map((d, i) => ({
      id: d?.id || `day-${Date.now()}-${i}`,
      date: d?.date || '',
      week: d?.week || '',
      title: d?.title || `第 ${i + 1} 天`,
      desc: d?.desc || '',
      stamp: d?.stamp,
      mapRegions: Array.isArray(d?.mapRegions) ? d.mapRegions : [],
      stops: Array.isArray(d?.stops)
        ? d.stops.map((s, j) => ({
            ...s,
            id: s?.id || `stop-${Date.now()}-${i}-${j}`,
            time: s?.time || '',
            location: s?.location || '',
            notes: s?.notes || ''
          }))
        : []
    }))
  };
}

/**
 * 依上一天的 "M/D" 推算下一天的日期與星期，正確處理月底、年底進位。
 * 年份取自 startDate（ISO），解析失敗時回傳 null。
 */
export function getNextDayInfo(
  lastDate: string | undefined,
  startDate: string | undefined
): { date: string; week: string } | null {
  const m = lastDate?.match(/(\d+)\/(\d+)/);
  if (!m) return null;
  const startYear = parseInt((startDate || '').slice(0, 4), 10);
  const startMonth = parseInt((startDate || '').slice(5, 7), 10);
  let year = Number.isFinite(startYear) ? startYear : new Date().getFullYear();
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  // 跨年行程（例如 12 月出發、隔年 1 月）：月份比出發月小時視為隔年
  if (Number.isFinite(startMonth) && month < startMonth) year += 1;

  const next = new Date(Date.UTC(year, month - 1, day + 1));
  if (isNaN(next.getTime())) return null;
  return {
    date: `${next.getUTCMonth() + 1}/${next.getUTCDate()}`,
    week: WEEKS[next.getUTCDay()]
  };
}
