import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  ShieldAlert, 
  Volume2, 
  Building2, 
  FileText, 
  Check, 
  AlertCircle,
  ExternalLink,
  Edit2,
  Copy,
  Info
} from 'lucide-react';
import { EmergencyInfo } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyInfo?: EmergencyInfo;
  onSaveEmergencyInfo: (info: EmergencyInfo) => void;
}

interface JapanesePhrase {
  japanese: string;
  kana: string;
  chinese: string;
  romaji: string;
}

const EMERGENCY_PHRASES: JapanesePhrase[] = [
  {
    japanese: 'すみません、助けてください！',
    kana: 'すみません、たすけてください！',
    chinese: '不好意思，請救救我 / 請幫幫我！',
    romaji: 'Sumimasen, tasukete kudasai!'
  },
  {
    japanese: '救急車を呼んでください！',
    kana: 'きゅうきゅうしゃを よんでください！',
    chinese: '請幫我叫救護車！（急病、重傷、雪地失溫）',
    romaji: 'Kyuukyuusha o yonde kudasai!'
  },
  {
    japanese: '警察を呼んでください！',
    kana: 'けいさつを よんでください！',
    chinese: '請幫我報警！（事故、被盜、糾紛）',
    romaji: 'Keisatsu o yonde kudasai!'
  },
  {
    japanese: 'パスポートを紛失しました。',
    kana: 'ぱすぽーとを ふんしつしました。',
    chinese: '我的護照遺失了。請問警察署在哪裡？',
    romaji: 'Pasupooto o funshitsu shimashita.'
  },
  {
    japanese: '雪で動けなくなりました。',
    kana: 'ゆきで うごけなくなりました。',
    chinese: '因為暴風雪受困，車輛或人無法動彈。',
    romaji: 'Yuki de ugokenaku narimashita.'
  },
  {
    japanese: '日本語が話せません。中国語か英語ができる方はいらっしゃいますか？',
    kana: 'にほんごが はなせません。ちゅうごくごか えいごができるかたは いらっしゃいますか？',
    chinese: '我不會說日語，請問有能說中文或英文的人嗎？',
    romaji: 'Nihongo ga hanasemasen. Chuugokugo ka eigo ga dekiru kata wa irasshaimasu ka?'
  }
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  emergencyInfo = {},
  onSaveEmergencyInfo
}) => {
  const [activeTab, setActiveTab] = useState<'hotlines' | 'phrases' | 'personal'>('hotlines');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Personal emergency fields state
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [passport, setPassport] = useState(emergencyInfo.passportNumber || '');
  const [insuranceCompany, setInsuranceCompany] = useState(emergencyInfo.insuranceCompany || '');
  const [policyNumber, setPolicyNumber] = useState(emergencyInfo.insurancePolicyNumber || '');
  const [insurancePhone, setInsurancePhone] = useState(emergencyInfo.insuranceEmergencyPhone || '');
  const [contactName, setContactName] = useState(emergencyInfo.emergencyContactName || '');
  const [contactPhone, setContactPhone] = useState(emergencyInfo.emergencyContactPhone || '');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleSpeakJapanese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEmergencyInfo({
      passportNumber: passport.trim(),
      insuranceCompany: insuranceCompany.trim(),
      insurancePolicyNumber: policyNumber.trim(),
      insuranceEmergencyPhone: insurancePhone.trim(),
      emergencyContactName: contactName.trim(),
      emergencyContactPhone: contactPhone.trim()
    });
    setIsEditingPersonal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#fffdf8] border border-[#d9d3c8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
        style={{ color: '#242824' }}
      >
        {/* Top Decorative Header */}
        <div className="bg-[#bc553b] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-serif-tc text-base sm:text-lg font-bold tracking-wide leading-none">
                日本旅行緊急應變與求助速查
              </h3>
              <p className="text-[11px] text-white/80 font-sans-tc mt-1 tracking-wider">
                EMERGENCY ASSISTANCE · 離線可查 · 單鍵直撥
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
            title="關閉視窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#d9d3c8] bg-[#f5f1e8] text-xs font-serif-tc px-4 shrink-0">
          <button
            onClick={() => setActiveTab('hotlines')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'hotlines'
                ? 'border-[#bc553b] text-[#bc553b] bg-[#fffdf8]'
                : 'border-transparent text-[#777a74] hover:text-[#242824]'
            }`}
          >
            🚨 緊急電話直撥
          </button>
          <button
            onClick={() => setActiveTab('phrases')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'phrases'
                ? 'border-[#bc553b] text-[#bc553b] bg-[#fffdf8]'
                : 'border-transparent text-[#777a74] hover:text-[#242824]'
            }`}
          >
            💬 手指日語急難求助
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'personal'
                ? 'border-[#bc553b] text-[#bc553b] bg-[#fffdf8]'
                : 'border-transparent text-[#777a74] hover:text-[#242824]'
            }`}
          >
            📋 保險與個人備忘
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: HOTLINES */}
          {activeTab === 'hotlines' && (
            <div className="space-y-5">
              {/* Japan Local 3-Digit Emergency */}
              <div>
                <span className="text-[11px] font-serif-tc tracking-widest text-[#777a74] uppercase block mb-2">
                  日本境內急難專線（免費直撥）
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 110 */}
                  <div className="bg-[#fffdf8] border-2 border-[#bc553b]/30 p-3.5 flex flex-col justify-between hover:border-[#bc553b] transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <strong className="font-serif-tc text-base font-bold text-[#bc553b]">
                          警察局（事件・事故）
                        </strong>
                        <span className="text-[10px] bg-[#bc553b]/10 text-[#bc553b] px-1.5 py-0.5 font-mono">
                          POLICE
                        </span>
                      </div>
                      <p className="text-xs text-[#555c59] mt-1 leading-relaxed">
                        車禍碰撞、物品遭竊、人身危急。日本警視廳提供 <strong>中文同步三方翻譯</strong> 支援。
                      </p>
                    </div>
                    <a
                      href="tel:110"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#bc553b] hover:bg-[#a64730] text-white text-xs font-serif-tc font-bold tracking-wider shadow-xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>直撥 110</span>
                    </a>
                  </div>

                  {/* 119 */}
                  <div className="bg-[#fffdf8] border-2 border-[#bc553b]/30 p-3.5 flex flex-col justify-between hover:border-[#bc553b] transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <strong className="font-serif-tc text-base font-bold text-[#bc553b]">
                          救護車 / 消防隊
                        </strong>
                        <span className="text-[10px] bg-[#bc553b]/10 text-[#bc553b] px-1.5 py-0.5 font-mono">
                          AMBULANCE
                        </span>
                      </div>
                      <p className="text-xs text-[#555c59] mt-1 leading-relaxed">
                        突發重病、骨折摔傷、雪地失溫。接通時先說「<strong>Kyuukyuu (救急)</strong>」表明需要救護車。
                      </p>
                    </div>
                    <a
                      href="tel:119"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#bc553b] hover:bg-[#a64730] text-white text-xs font-serif-tc font-bold tracking-wider shadow-xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>直撥 119</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* JNTO Tourist Helpline */}
              <div className="bg-[#f7f5ed] border border-[#d9d3c8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="font-serif-tc text-sm text-[#242824] block">
                      📞 JNTO 日本觀光局 24 小時外國旅客多語專線
                    </strong>
                    <p className="text-xs text-[#555c59] mt-1 leading-relaxed">
                      日本全境 365 天 24 小時提供 <strong>中文、英文</strong> 服務。可諮詢就醫指南、災害疏散避難、物品遺失應對等。
                    </p>
                  </div>
                  <a
                    href="tel:050-3816-2720"
                    className="shrink-0 px-3 py-1.5 bg-[#6c91a3] hover:bg-[#5b7d8d] text-white text-xs font-mono font-bold flex items-center gap-1 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>050-3816-2720</span>
                  </a>
                </div>
              </div>

              {/* Taiwan Representative Offices */}
              <div>
                <span className="text-[11px] font-serif-tc tracking-widest text-[#777a74] uppercase block mb-2">
                  台灣駐日外交機構 24 小時急難救助專線（專供緊急事故求助）
                </span>
                <div className="space-y-2.5 text-xs font-sans-tc">
                  {/* Sapporo Office (Tohoku & Hokkaido) */}
                  <div className="bg-[#fffdf8] border border-[#d9d3c8] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="font-serif-tc text-sm text-[#242824]">
                        駐札幌辦事處（轄區：青森、岩手、秋田、北海道）
                      </strong>
                      <div className="text-[#777a74] text-[11px] mt-0.5 font-mono">
                        急難救助手機：080-1460-2568（日本境內直撥） / +81-80-1460-2568
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy('+81-80-1460-2568')}
                        className="px-2 py-1 border border-[#d9d3c8] hover:border-[#bc553b] text-[#555c59] text-[11px]"
                      >
                        {copiedText === '+81-80-1460-2568' ? '已複製' : '複製號碼'}
                      </button>
                      <a
                        href="tel:+818014602568"
                        className="px-3 py-1 bg-[#242824] hover:bg-[#bc553b] text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>撥打</span>
                      </a>
                    </div>
                  </div>

                  {/* Tokyo Office */}
                  <div className="bg-[#fffdf8] border border-[#d9d3c8] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="font-serif-tc text-sm text-[#242824]">
                        台北駐日經濟文化代表處（東京轄區）
                      </strong>
                      <div className="text-[#777a74] text-[11px] mt-0.5 font-mono">
                        急難救助手機：080-1009-7179 / 代表號：03-3280-7811
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy('+81-80-1009-7179')}
                        className="px-2 py-1 border border-[#d9d3c8] hover:border-[#bc553b] text-[#555c59] text-[11px]"
                      >
                        {copiedText === '+81-80-1009-7179' ? '已複製' : '複製號碼'}
                      </button>
                      <a
                        href="tel:+818010097179"
                        className="px-3 py-1 bg-[#242824] hover:bg-[#bc553b] text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>撥打</span>
                      </a>
                    </div>
                  </div>

                  {/* MOFA Global Line */}
                  <div className="bg-[#fffdf8] border border-[#d9d3c8] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="font-serif-tc text-sm text-[#242824]">
                        外交部緊急聯絡中心（台北總部）
                      </strong>
                      <div className="text-[#777a74] text-[11px] mt-0.5 font-mono">
                        海外免付費專線：001-800-0885-0885 或 +886-800-085-095
                      </div>
                    </div>
                    <a
                      href="tel:+886800085095"
                      className="px-3 py-1 bg-[#242824] hover:bg-[#bc553b] text-white text-[11px] font-mono flex items-center gap-1 transition-colors self-start sm:self-auto"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>撥打</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JAPANESE PHRASES */}
          {activeTab === 'phrases' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#f5f1e8] border border-[#d9d3c8] text-xs font-serif-tc text-[#555c59]">
                💡 遇緊急情況時，可直接將下方字卡出示給站務員、店員或日本人閱讀，亦可點擊 <strong>🔊 發音</strong> 進行日語朗讀。
              </div>

              <div className="space-y-3">
                {EMERGENCY_PHRASES.map((phrase, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-[#fffdf8] border border-[#d9d3c8] hover:border-[#bc553b] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-[11px] text-[#777a74] font-mono">
                          {phrase.kana}
                        </div>
                        <div className="font-serif-tc text-lg sm:text-xl font-bold text-[#242824] my-1 leading-snug">
                          {phrase.japanese}
                        </div>
                        <div className="text-xs text-[#bc553b] font-medium font-sans-tc">
                          {phrase.chinese}
                        </div>
                        <div className="text-[11px] text-[#9aa099] font-mono mt-0.5">
                          {phrase.romaji}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSpeakJapanese(phrase.japanese)}
                          className="p-2 bg-[#f5f1e8] hover:bg-[#bc553b] hover:text-white text-[#555c59] rounded-xs transition-colors"
                          title="語音朗讀日語"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(phrase.japanese)}
                          className="p-2 bg-[#f5f1e8] hover:bg-[#bc553b] hover:text-white text-[#555c59] rounded-xs transition-colors"
                          title="複製日文字"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL INSURANCE & CONTACTS */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#d9d3c8] pb-2">
                <span className="text-xs font-serif-tc text-[#777a74]">
                  此資訊會隨本手帳行程儲存於本地與雲端，方便同伴於突發事故時調閱保險與聯絡家屬。
                </span>
                {!isEditingPersonal && (
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-serif-tc text-[#bc553b] hover:underline"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>編輯資訊</span>
                  </button>
                )}
              </div>

              {isEditingPersonal ? (
                <form onSubmit={handleSavePersonal} className="space-y-3.5 text-xs font-sans-tc">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                        護照號碼（Passport No.）
                      </label>
                      <input
                        type="text"
                        value={passport}
                        onChange={(e) => setPassport(e.target.value)}
                        placeholder="例如：310000000"
                        className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                        投保海外旅平險公司
                      </label>
                      <input
                        type="text"
                        value={insuranceCompany}
                        onChange={(e) => setInsuranceCompany(e.target.value)}
                        placeholder="例如：富邦產險 / 國泰產險"
                        className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                        保險單號 / 投保序號
                      </label>
                      <input
                        type="text"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                        placeholder="例如：TA-20270102-001"
                        className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                        海外急難救助 24h 電話（保險公司）
                      </label>
                      <input
                        type="text"
                        value={insurancePhone}
                        onChange={(e) => setInsurancePhone(e.target.value)}
                        placeholder="例如：+886-2-2345-6789"
                        className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                        在台緊急聯絡人家屬姓名
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="例如：林媽媽（母親）"
                        className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-serif-tc text-[#777a74] mb-1">
                        緊急聯絡人電話
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="例如：0912-345-678"
                        className="w-full px-3 py-2 bg-[#f5f1e8] border border-[#d9d3c8] focus:border-[#bc553b] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#d9d3c8]">
                    <button
                      type="button"
                      onClick={() => setIsEditingPersonal(false)}
                      className="px-3 py-1.5 text-[#777a74] hover:text-[#242824]"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-[#bc553b] text-white font-serif-tc hover:bg-[#a64730]"
                    >
                      儲存備忘
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#f7f5ed] border border-[#d9d3c8] p-3">
                    <span className="text-[11px] text-[#777a74] font-serif-tc block">護照號碼</span>
                    <strong className="text-sm font-mono text-[#242824] block mt-0.5">
                      {emergencyInfo.passportNumber || '尚未填寫'}
                    </strong>
                  </div>

                  <div className="bg-[#f7f5ed] border border-[#d9d3c8] p-3">
                    <span className="text-[11px] text-[#777a74] font-serif-tc block">投保保險公司</span>
                    <strong className="text-sm text-[#242824] block mt-0.5">
                      {emergencyInfo.insuranceCompany || '尚未填寫'}
                    </strong>
                  </div>

                  <div className="bg-[#f7f5ed] border border-[#d9d3c8] p-3">
                    <span className="text-[11px] text-[#777a74] font-serif-tc block">保單編號</span>
                    <strong className="text-sm font-mono text-[#242824] block mt-0.5">
                      {emergencyInfo.insurancePolicyNumber || '尚未填寫'}
                    </strong>
                  </div>

                  <div className="bg-[#f7f5ed] border border-[#d9d3c8] p-3">
                    <span className="text-[11px] text-[#777a74] font-serif-tc block">海外急難救助電話</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <strong className="text-sm font-mono text-[#bc553b]">
                        {emergencyInfo.insuranceEmergencyPhone || '尚未填寫'}
                      </strong>
                      {emergencyInfo.insuranceEmergencyPhone && (
                        <a 
                          href={`tel:${emergencyInfo.insuranceEmergencyPhone}`}
                          className="text-[11px] text-[#bc553b] hover:underline"
                        >
                          撥打
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#f7f5ed] border border-[#d9d3c8] p-3 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#777a74] font-serif-tc block">在台緊急家屬聯絡人</span>
                      <strong className="text-sm text-[#242824] block mt-0.5">
                        {emergencyInfo.emergencyContactName || '尚未填寫'} {emergencyInfo.emergencyContactPhone ? `(${emergencyInfo.emergencyContactPhone})` : ''}
                      </strong>
                    </div>
                    {emergencyInfo.emergencyContactPhone && (
                      <a 
                        href={`tel:${emergencyInfo.emergencyContactPhone}`}
                        className="px-3 py-1 bg-[#242824] hover:bg-[#bc553b] text-white text-xs font-mono"
                      >
                        撥打
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Passport Lost Guide */}
              <div className="mt-4 p-3.5 bg-[#fffdf8] border border-[#d9d3c8] text-xs font-sans-tc space-y-1.5 text-[#555c59]">
                <strong className="font-serif-tc text-[#bc553b] block">
                  📌 護照遺失三步驟應變指引：
                </strong>
                <div>1. 前往就近日本警察署報案，取得<strong>「遺失申告證明書（遺失届出証明書）」</strong>。</div>
                <div>2. 準備兩吋白底彩色照片 2 張、國民身分證正本（或護照影本與戶籍謄本電子檔）。</div>
                <div>3. 親赴台北駐日代表處（東京或札幌辦事處）申請<strong>「入國證明書」</strong>即可順利搭機返台。</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f5f1e8] border-t border-[#d9d3c8] flex items-center justify-between text-xs font-serif-tc shrink-0">
          <span className="text-[#777a74]">
            * 日本急難電話直撥無需額外加國碼；國際號碼可點擊「複製」。
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#242824] hover:bg-[#bc553b] text-white transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
