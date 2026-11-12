import React, { useState, useEffect, useCallback } from 'react';
import { 
  CloudSnow, 
  Sun, 
  Sunset, 
  Sunrise, 
  Wind, 
  Droplets, 
  Thermometer, 
  RefreshCw, 
  ShieldAlert, 
  ChevronDown,
  Sparkles,
  MapPin
} from 'lucide-react';

export interface WeatherCity {
  key: string;
  name: string;
  kanji: string;
  romaji: string;
  lat: number;
  lon: number;
  winterTag: string;
}

export const JAPAN_CITIES: WeatherCity[] = [
  { key: 'aomori', name: '青森市', kanji: '青森', romaji: 'Aomori', lat: 40.8222, lon: 140.7474, winterTag: '陸奧灣・港町' },
  { key: 'sukayu', name: '酸湯溫泉 / 八甲田', kanji: '酸ヶ湯', romaji: 'Sukayu / Hakkoda', lat: 40.6508, lon: 140.8523, winterTag: '豪雪・樹冰' },
  { key: 'hirosaki', name: '弘前市', kanji: '弘前', romaji: 'Hirosaki', lat: 40.6031, lon: 140.4642, winterTag: '古城・雪燈籠' },
  { key: 'towada', name: '十和田湖 / 奧入瀨', kanji: '十和田', romaji: 'Towada / Oirase', lat: 40.5284, lon: 140.9255, winterTag: '冰瀑・雪之溪流' },
  { key: 'morioka', name: '盛岡市 (岩手)', kanji: '盛岡', romaji: 'Morioka', lat: 39.7036, lon: 141.1527, winterTag: '東北新幹線' },
  { key: 'sapporo', name: '札幌市 (北海道)', kanji: '札幌', romaji: 'Sapporo', lat: 43.0618, lon: 141.3545, winterTag: '雪祭・粉雪' },
  { key: 'tokyo', name: '東京都', kanji: '東京', romaji: 'Tokyo', lat: 35.6895, lon: 139.6917, winterTag: '出入境門戶' },
];

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  isSnow: boolean;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  snowfallSum: number;
  precipProbMax: number;
  windSpeed: number;
  humidity: number;
  updatedAt: string;
}

function getWeatherInfo(code: number): { text: string; icon: string; isSnow: boolean } {
  if (code === 0) return { text: '晴朗無雲', icon: '☀️', isSnow: false };
  if (code === 1 || code === 2) return { text: '晴時多雲', icon: '🌤️', isSnow: false };
  if (code === 3) return { text: '陰天多雲', icon: '☁️', isSnow: false };
  if (code === 45 || code === 48) return { text: '霧氣瀰漫', icon: '🌫️', isSnow: false };
  if (code >= 51 && code <= 55) return { text: '毛毛細雨', icon: '🌦️', isSnow: false };
  if (code >= 61 && code <= 65) return { text: '降雨', icon: '🌧️', isSnow: false };
  if (code === 71) return { text: '輕微降雪', icon: '🌨️', isSnow: true };
  if (code === 73) return { text: '飄雪中', icon: '❄️', isSnow: true };
  if (code === 75 || code === 77) return { text: '大雪・吹雪', icon: '❄️', isSnow: true };
  if (code >= 80 && code <= 82) return { text: '陣雨', icon: '🌦️', isSnow: false };
  if (code === 85 || code === 86) return { text: '暴風雪 / 陣雪', icon: '❄️', isSnow: true };
  if (code >= 95) return { text: '風暴雨雪', icon: '⛈️', isSnow: false };
  return { text: '雪地陰天', icon: '❄️', isSnow: true };
}

function getClothingAdvice(temp: number, isSnow: boolean): { level: string; tips: string; badgeColor: string } {
  if (temp <= -5) {
    return {
      level: '極寒・最高防寒警戒',
      tips: '長版防風羽絨大衣 + 羊毛高領發熱衣 + 發熱褲 + 防水防滑雪靴 + 冰爪 + 羊毛襪 + 護耳毛帽 + 觸控防水防風手套。暖暖包請貼於腰腹或放於口袋保暖手機。',
      badgeColor: '#bc553b'
    };
  } else if (temp <= 2) {
    return {
      level: '嚴寒・注意路面結冰',
      tips: '羽絨外套 + 保暖發熱衣 + 圍巾毛帽 + 防滑雪鞋。行走黑冰路面務必小步平踏，雙手勿插口袋以保持平衡。',
      badgeColor: '#c56b4f'
    };
  } else if (temp <= 8) {
    return {
      level: '低溫寒冷・洋蔥式穿搭',
      tips: '保暖大衣/羽絨外套 + 針織衫毛衣。日本室內與電車暖氣通常在 22°C 以上，穿脫方便的開襟拉鍊式外衣最為理想。',
      badgeColor: '#6c91a3'
    };
  } else {
    return {
      level: '涼爽微寒・輕便防風',
      tips: '防風夾克或風衣，早晚溫差大可備一條輕便圍巾。',
      badgeColor: '#3c5a4f'
    };
  }
}

interface WeatherWidgetProps {
  selectedCityKey?: string;
  onSelectCity?: (cityKey: string) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  selectedCityKey = 'aomori',
  onSelectCity
}) => {
  const [currentCityKey, setCurrentCityKey] = useState(selectedCityKey);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const city = JAPAN_CITIES.find((c) => c.key === currentCityKey) || JAPAN_CITIES[0];

  const fetchWeather = useCallback(async (targetCity: WeatherCity) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetCity.lat}&longitude=${targetCity.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,snowfall_sum&timezone=Asia%2FTokyo`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const current = data.current;
      const daily = data.daily;
      const wInfo = getWeatherInfo(current.weather_code);

      // Format sunrise and sunset (HH:mm)
      const formatTime = (isoString?: string) => {
        if (!isoString) return '--:--';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString.slice(-5);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };

      setWeather({
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: Math.round(current.apparent_temperature),
        weatherCode: current.weather_code,
        weatherDesc: wInfo.text,
        weatherIcon: wInfo.icon,
        isSnow: wInfo.isSnow,
        tempMax: Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m),
        tempMin: Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m),
        sunrise: formatTime(daily.sunrise?.[0]),
        sunset: formatTime(daily.sunset?.[0]),
        snowfallSum: daily.snowfall_sum?.[0] ?? 0,
        precipProbMax: daily.precipitation_probability_max?.[0] ?? 0,
        windSpeed: Math.round(current.wind_speed_10m),
        humidity: current.relative_humidity_2m,
        updatedAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err: any) {
      console.warn('Weather fetch error, using default winter cache:', err);
      // Fallback cache for winter in Aomori region
      setError('無法連接即時氣象，已切換至雪季氣候參考值');
      setWeather({
        temperature: -2,
        apparentTemperature: -6,
        weatherCode: 73,
        weatherDesc: '雪國飄雪・冬季氣候',
        weatherIcon: '❄️',
        isSnow: true,
        tempMax: 1,
        tempMin: -5,
        sunrise: '06:50',
        sunset: '16:35',
        snowfallSum: 15,
        precipProbMax: 80,
        windSpeed: 14,
        humidity: 82,
        updatedAt: '預估資料'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(city);
  }, [city, fetchWeather]);

  const handleCityChange = (newKey: string) => {
    setCurrentCityKey(newKey);
    onSelectCity?.(newKey);
  };

  const advice = weather ? getClothingAdvice(weather.temperature, weather.isSnow) : null;

  return (
    <section id="weather" className="bg-[#fffdf8] border border-[#d9d3c8] p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#d9d3c8] pb-2.5 mb-3.5">
        <div className="flex items-center gap-1.5">
          <CloudSnow className="w-4 h-4 text-[#6c91a3]" />
          <h3 className="font-serif-tc text-base font-semibold tracking-wide text-[#242824]">
            日本即時天候 <small className="text-[11px] font-sans-tc text-[#777a74] font-normal tracking-widest ml-1">WEATHER</small>
          </h3>
        </div>

        {/* City Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentCityKey}
              onChange={(e) => handleCityChange(e.target.value)}
              className="appearance-none bg-[#f5f1e8] border border-[#d9d3c8] hover:border-[#bc553b] text-xs font-serif-tc text-[#242824] pl-2.5 pr-6 py-1 focus:outline-hidden transition-colors cursor-pointer"
            >
              {JAPAN_CITIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#777a74] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchWeather(city)}
            disabled={loading}
            className="p-1 text-[#777a74] hover:text-[#bc553b] transition-colors"
            title="重新整理氣象"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#bc553b]' : ''}`} />
          </button>
        </div>
      </div>

      {weather && (
        <div className="space-y-4">
          {/* Main Weather Display */}
          <div className="bg-[#f7f5ed] border border-[#e5dfd3] p-4 relative overflow-hidden">
            {/* Background seal water mark */}
            <div 
              className="absolute -right-2 -bottom-2 text-6xl opacity-10 select-none pointer-events-none font-serif-tc"
              style={{ color: '#bc553b' }}
            >
              {city.kanji}
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif-tc text-4xl sm:text-5xl font-semibold tracking-tight text-[#242824] leading-none">
                    {weather.temperature}°C
                  </span>
                  <span className="text-xs font-serif-tc text-[#777a74]">
                    體感 {weather.apparentTemperature}°C
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs font-serif-tc">
                  <span className="text-lg">{weather.weatherIcon}</span>
                  <span className="font-semibold text-[#242824]">{weather.weatherDesc}</span>
                  <span className="text-[#bc553b] text-[11px] border border-[#bc553b] px-1.5 py-0.2">
                    {city.winterTag}
                  </span>
                </div>
              </div>

              {/* High / Low Range */}
              <div className="text-right text-xs font-mono space-y-0.5 text-[#555c59]">
                <div>最高 <strong className="text-[#bc553b]">{weather.tempMax}°C</strong></div>
                <div>最低 <strong className="text-[#6c91a3]">{weather.tempMin}°C</strong></div>
                <div className="text-[10px] text-[#9aa099] pt-1">
                  更新 {weather.updatedAt}
                </div>
              </div>
            </div>

            {/* Metrics Ribbon: Sunset, Snow, Wind */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-[#ded7c8] text-xs font-serif-tc text-[#555c59]">
              {/* Sunset Warning */}
              <div className="flex flex-col">
                <span className="text-[11px] text-[#777a74] flex items-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-[#bc553b]" />
                  本日日落
                </span>
                <span className="font-mono font-bold text-[#bc553b] text-sm mt-0.5">
                  {weather.sunset}
                </span>
              </div>

              {/* Sunrise */}
              <div className="flex flex-col">
                <span className="text-[11px] text-[#777a74] flex items-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 text-[#6c91a3]" />
                  晨曦日出
                </span>
                <span className="font-mono text-[#242824] text-sm mt-0.5">
                  {weather.sunrise}
                </span>
              </div>

              {/* Snow / Precip */}
              <div className="flex flex-col">
                <span className="text-[11px] text-[#777a74] flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-[#6c91a3]" />
                  降水/降雪機率
                </span>
                <span className="font-mono text-[#242824] text-sm mt-0.5">
                  {weather.precipProbMax}%
                </span>
              </div>
            </div>
          </div>

          {/* Winter Sunset Alert Card */}
          <div className="p-3 bg-[#fff7f4] border border-[#f5d5cc] text-xs font-serif-tc flex items-start gap-2 text-[#733626]">
            <Sunset className="w-4 h-4 shrink-0 text-[#bc553b] mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block text-[#bc553b] font-medium">雪國日照提醒：</strong>
              日本冬季東北與北海道約 <strong>{weather.sunset}</strong> 即入夜天黑。推薦將戶外攝影、神社巡禮與自然散策安排於 <strong>16:00 前</strong> 結束，天黑後氣溫會迅速驟降。
            </div>
          </div>

          {/* Cold Protection & Dressing Advice */}
          {advice && (
            <div className="border border-[#d9d3c8] bg-[#fffdf8] p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-serif-tc font-semibold text-[#242824]">
                  <Thermometer className="w-3.5 h-3.5 text-[#bc553b]" />
                  <span>防寒指數與穿搭提案</span>
                </div>
                <span 
                  className="px-2 py-0.5 text-[10px] text-white font-serif-tc"
                  style={{ backgroundColor: advice.badgeColor }}
                >
                  {advice.level}
                </span>
              </div>
              <p className="font-sans-tc text-xs text-[#555c59] leading-relaxed">
                {advice.tips}
              </p>
            </div>
          )}

          {error && (
            <div className="text-[11px] text-[#777a74] font-serif-tc text-center">
              * {error}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
