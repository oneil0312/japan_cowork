import { TripPlan } from './types';

export const initialTripData: TripPlan = {
  id: 'trip-aomori-2027',
  title: '日本青森行',
  subtitle: '雪と余白・2027 冬季旅行',
  eyebrow: 'AOMORI · TOHOKU · WINTER JOURNAL',
  poem: '雪的盡頭，是更寬廣的風景。',
  dateRange: '2027.01.02 — 01.09',
  startDate: '2027-01-02',
  departureTime: '2027-01-02T16:45:00+09:00',
  arrivalTime: '2027-01-09T21:10:00+08:00',
  description: '神社、城跡、樹冰、溪流與湖泊。\n在白色的季節，遇見最靜謐的日本。',
  sealText: '青森 · 雪國',
  winterNote: '冬季提醒｜白神山地、八甲田纜車與山區道路可能因積雪、風勢或管制而調整，出發前請再次確認官方公告與交通狀況。',
  flights: [
    {
      id: 'f-1',
      type: 'outbound',
      label: '去程 · 1/2 SAT',
      route: '桃園 12:15 → 花卷 16:45',
      flightNumber: '航班號碼待補',
      notes: '預計 16:45 抵達花卷機場，出關後至租車櫃台'
    },
    {
      id: 'f-2',
      type: 'inbound',
      label: '回程 · 1/9 SAT',
      route: '17:50 起飛 → 桃園 21:10',
      flightNumber: '起飛機場與還車門市待確認',
      notes: '起飛前 2.5 小時完成還車並抵達機場'
    }
  ],
  stays: [
    {
      id: 'stay-1',
      name: '里士滿酒店青森',
      dates: '1/2 — 1/6（4 晚）',
      notes: '1/6 早上退房',
      symbol: '宿'
    },
    {
      id: 'stay-2',
      name: '奧入瀨溪流飯店',
      dates: '1/6 — 1/7（1 晚）',
      notes: '享受雪景露天風呂與法式早晚餐',
      symbol: '渓'
    },
    {
      id: 'stay-3',
      name: '盛岡大都會飯店',
      dates: '1/7 — 1/9（2 晚）',
      notes: '鄰近盛岡車站，逛街採買交通便利',
      symbol: '森'
    }
  ],
  checklist: [
    { id: 'c-1', text: '護照、機票、訂房確認', checked: false },
    { id: 'c-2', text: '保暖衣物、防滑雪靴、發熱衣', checked: false },
    { id: 'c-3', text: '海外旅遊平安保險（含不便險）', checked: false },
    { id: 'c-4', text: '相機、手機、行動電源、充電線', checked: false },
    { id: 'c-5', text: '交通票券／租車預約單資料', checked: false },
    { id: 'c-6', text: '常備個人藥品、保濕乳液、護唇膏', checked: false },
    { id: 'c-7', text: '日幣現金、雙幣信用卡', checked: false },
    { id: 'c-8', text: 'ETC卡預約、全險與雪胎裝備確認', checked: false },
    { id: 'c-9', text: '駕照正本＋日文譯本（效期內）', checked: false },
    { id: 'c-10', text: '登錄 Visit Japan Web 入境審查 QR', checked: false },
    { id: 'c-11', text: '查閱青森縣「冬期閉鎖」道路即時公告', checked: false }
  ],
  mapNodes: {
    tsug: { x: 54, y: 40, label: '津輕' },
    aomo: { x: 162, y: 35, label: '青森' },
    hiro: { x: 78, y: 94, label: '弘前' },
    hak: { x: 195, y: 78, label: '八甲田' },
    oir: { x: 225, y: 115, label: '奧入瀨・十和田' },
    mori: { x: 285, y: 338, label: '盛岡' },
    hana: { x: 279, y: 410, label: '花卷' }
  },
  days: [
    {
      id: 'day-1',
      date: '1/2',
      week: 'SAT',
      title: '抵達花卷，前往青森',
      desc: '旅程從抵達北國開始。取車後依路況安排移動，冬季夜間駕駛請保留充裕時間。',
      stamp: '青森冬旅 · DAY 1',
      mapRegions: ['hana', 'aomo'],
      stops: [
        {
          id: 'stop-1-1',
          time: '16:45',
          location: '抵達花卷機場',
          notes: '入境、領取行李與租車手續。',
          category: 'transport'
        },
        {
          id: 'stop-1-2',
          time: '18:00',
          location: '租車取車',
          notes: '確認雪胎、保險與 ETC，熟悉車況與防滑功能。',
          category: 'transport'
        },
        {
          id: 'stop-1-3',
          time: '晚上',
          location: '前往青森',
          notes: '花卷到青森約 3 小時以上（冬季更久），建議先吃晚餐、避免夜間趕路，依天候決定是否直接開往青森。',
          category: 'transport'
        }
      ]
    },
    {
      id: 'day-2',
      date: '1/3',
      week: 'SUN',
      title: '神社、在地美食與藝術文化',
      desc: '從莊嚴的神社開始，走進青森的在地市場，再以美術館與繩文遺跡認識這座城市。',
      stamp: '青森冬旅 · DAY 2',
      mapRegions: ['aomo'],
      stops: [
        {
          id: 'stop-2-1',
          time: '09:00',
          location: '廣田神社',
          notes: '靜謐的神社，感受冬日的莊嚴氛圍。',
          category: 'spot'
        },
        {
          id: 'stop-2-2',
          time: '10:30',
          location: '金生稻荷神社',
          notes: '紅色鳥居與雪景；出發前再確認名稱與位置。',
          category: 'spot'
        },
        {
          id: 'stop-2-3',
          time: '12:00',
          location: '古川市場（午餐）',
          notes: '品嚐在地海鮮與自選海鮮丼（のっけ丼）。',
          category: 'food'
        },
        {
          id: 'stop-2-4',
          time: '13:30',
          location: '三內丸山遺跡',
          notes: '認識日本重要的繩文文化遺跡；冬季多在 17:00 前後閉館，請提早入場並確認時間。',
          category: 'spot'
        },
        {
          id: 'stop-2-5',
          time: '15:15',
          location: '青森縣立美術館',
          notes: '與三內丸山相鄰，欣賞奈良美智「青森犬」等現代藝術作品；請確認休館日。',
          category: 'spot'
        },
        {
          id: 'stop-2-6',
          time: '16:45',
          location: 'A-Factory（蘋果派）',
          notes: '青森蘋果主題設施，傍晚吃現烤蘋果派、試飲蘋果酒、採買伴手禮。',
          category: 'shopping',
          isMustVisit: true
        }
      ]
    },
    {
      id: 'day-3',
      date: '1/4',
      week: 'MON',
      title: '鳥居與雪原之間',
      desc: '離開市區，走訪遼闊的神社景觀與津輕地區的橋梁風景，保留彈性以應對冬季路況。',
      stamp: '青森冬旅 · DAY 3',
      mapRegions: ['aomo', 'tsug'],
      stops: [
        {
          id: 'stop-3-1',
          time: '上午',
          location: '高山稻荷神社',
          notes: '以千本鳥居聞名，冬季紅白雪景壯觀，請留意積雪與步道防滑。',
          category: 'spot',
          isMustVisit: true
        },
        {
          id: 'stop-3-2',
          time: '下午',
          location: '鶴之舞橋',
          notes: '欣賞全日本最長木造三連太鼓橋、湖面與岩木山雪景；確認冬季交通及步道開放。',
          category: 'spot',
          isMustVisit: true
        },
        {
          id: 'stop-3-3',
          time: '傍晚',
          location: '返回住宿',
          notes: '依天候提早返程，避免山區夜間駕駛。',
          category: 'transport'
        }
      ]
    },
    {
      id: 'day-4',
      date: '1/5',
      week: 'TUE',
      title: '弘前歷史散策與白神山地',
      desc: '以津輕地區的自然與歷史為主題；白神山地部分區域冬季可能無法進入，請依官方資訊調整。',
      stamp: '青森冬旅 · DAY 4',
      mapRegions: ['aomo', 'hiro'],
      stops: [
        {
          id: 'stop-4-1',
          time: '上午',
          location: '白神山地周邊',
          notes: '冬季道路與步道限制多，距青森市區車程也長；建議擇一觀景點，或與弘前分開兩天。',
          category: 'spot'
        },
        {
          id: 'stop-4-2',
          time: '中午',
          location: '弘前城周邊',
          notes: '依開放狀況散步，欣賞天守閣冬日景色與追手門外濠雪景。',
          category: 'spot',
          isMustVisit: true
        },
        {
          id: 'stop-4-3',
          time: '下午',
          location: '五重塔／青森銀行紀念館',
          notes: '安排歷史建築與街區巡遊。',
          category: 'spot'
        },
        {
          id: 'stop-4-4',
          time: '午後茶',
          location: '大正浪漫喫茶室',
          notes: '享用知名店家蘋果派與香醇咖啡；營業時間請事先確認。',
          category: 'food'
        },
        {
          id: 'stop-4-5',
          time: '傍晚',
          location: 'Boulangerie Four',
          notes: '如有時間，可順路造訪在地推薦麵包店採買早餐或點心。',
          category: 'food'
        }
      ]
    },
    {
      id: 'day-5',
      date: '1/6',
      week: 'WED',
      title: '樹冰、雪橋與溫泉旅宿',
      desc: '早上退房後前往八甲田一帶。纜車與山區道路受天候影響大；八甲田往十和田的國道 103 號（酸ヶ湯～谷地）冬季封閉，下山後需繞行，車程遠比夏季導航長，下午景點請視情況縮減。',
      stamp: '青森冬旅 · DAY 5',
      mapRegions: ['aomo', 'hak', 'oir'],
      stops: [
        {
          id: 'stop-5-1',
          time: '早上',
          location: '退房：里士滿酒店青森',
          notes: '整理行李後出發，裝備保暖手套與帽子。',
          category: 'hotel'
        },
        {
          id: 'stop-5-2',
          time: '上午',
          location: '八甲田樹冰／纜車',
          notes: '視纜車營運、風勢與能見度決定是否前往；山頂極冷約零下10度以下。',
          category: 'spot',
          isMustVisit: true
        },
        {
          id: 'stop-5-3',
          time: '中午',
          location: '城倉大橋',
          notes: '冬季至少有夜間通行管制，部分國道 394 路段冬季封閉；請查縣府公告，僅白天順路停留。',
          category: 'spot'
        },
        {
          id: 'stop-5-4',
          time: '下午',
          location: '地獄沼（待確認）',
          notes: '依道路開放情形評估；不要進入封閉區域。',
          category: 'spot'
        },
        {
          id: 'stop-5-5',
          time: '入住',
          location: '奧入瀨溪流飯店',
          notes: '入住並享受旅宿設施、冰瀑露天溫泉與會席料理。',
          category: 'hotel'
        }
      ]
    },
    {
      id: 'day-6',
      date: '1/7',
      week: 'THU',
      title: '奧入瀨溪流，前往盛岡',
      desc: '用半天感受溪流與十和田湖的冬季風景，再前往盛岡入住。步道積雪時請以安全為優先。',
      stamp: '青森冬旅 · DAY 6',
      mapRegions: ['oir', 'mori'],
      stops: [
        {
          id: 'stop-6-1',
          time: '上午',
          location: '退房：奧入瀨溪流飯店',
          notes: '確認行李與退房時間。',
          category: 'hotel'
        },
        {
          id: 'stop-6-2',
          time: '上午',
          location: '奧入瀨溪流',
          notes: '挑選可安全抵達的銚子大瀑布等路段散步、欣賞冰瀑水柱拍照。',
          category: 'spot',
          isMustVisit: true
        },
        {
          id: 'stop-6-3',
          time: '中午',
          location: '十和田湖',
          notes: '視天候與道路情況在休屋周邊停留與散步。',
          category: 'spot'
        },
        {
          id: 'stop-6-4',
          time: '下午',
          location: '開車前往盛岡',
          notes: '預留冬季行車時間，抵達盛岡後辦理入住。',
          category: 'transport'
        }
      ]
    },
    {
      id: 'day-7',
      date: '1/8',
      week: 'FRI',
      title: '盛岡慢旅與地方美食',
      desc: '保留一整天慢慢認識盛岡，不必把行程排滿；可依天氣在市區散步、吃麵與逛咖啡店。',
      stamp: '青森冬旅 · DAY 7',
      mapRegions: ['mori'],
      stops: [
        {
          id: 'stop-7-1',
          time: '上午',
          location: '盛岡城跡公園',
          notes: '在城跡與美麗石垣積雪間靜心散步。',
          category: 'spot'
        },
        {
          id: 'stop-7-2',
          time: '中午',
          location: '盛岡三大麵',
          notes: '依喜好選擇東家碗子蕎麥麵、盛岡冷麵（ぴょんぴょん舎）或白龍炸醬麵。',
          category: 'food'
        },
        {
          id: 'stop-7-3',
          time: '下午',
          location: '岩手銀行紅磚館',
          notes: '辰野金吾設計之歷史洋風建築，欣賞文藝復興式外觀與周邊街區。',
          category: 'spot'
        },
        {
          id: 'stop-7-4',
          time: '傍晚',
          location: '自由活動',
          notes: '探訪咖啡店（如喫茶店克己）、採買南部鐵器或回飯店休息。',
          category: 'experience'
        }
      ]
    },
    {
      id: 'day-8',
      date: '1/9',
      week: 'SAT',
      title: '整理旅程，返回台灣',
      desc: '最後一天以退房、還車與前往機場為主。請再次確認租車還車地點與航班機場。',
      stamp: '青森冬旅 · DAY 8',
      mapRegions: ['mori', 'hana'],
      stops: [
        {
          id: 'stop-8-1',
          time: '上午',
          location: '退房：盛岡大都會飯店',
          notes: '確認行李、帳單與遺留物品，於大廳集合。',
          category: 'hotel'
        },
        {
          id: 'stop-8-2',
          time: '中午前',
          location: '前往還車地點',
          notes: '加滿油並請依最終航班與租車訂單確認還車門市驗收。',
          category: 'transport'
        },
        {
          id: 'stop-8-3',
          time: '17:50',
          location: '預計航班起飛',
          notes: '抵達台灣時間預計 21:10；航班資訊以訂位紀錄為準。',
          category: 'transport'
        }
      ]
    }
  ]
};

export const CATEGORY_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  spot: { label: '景點', bg: '#f1f5f3', text: '#3c5a4f' },
  food: { label: '美食', bg: '#fbf3e8', text: '#945b2b' },
  transport: { label: '交通', bg: '#eff3f7', text: '#406375' },
  hotel: { label: '住宿', bg: '#f6eff3', text: '#784661' },
  shopping: { label: '購物', bg: '#fbf0f0', text: '#944747' },
  experience: { label: '體驗', bg: '#f3f1f7', text: '#5f4879' },
  note: { label: '備忘', bg: '#f4f3f0', text: '#5c5e57' }
};

export const mapsUrl = (name: string, customQuery?: string) => {
  const query = customQuery || (name.replace(/（.*?）/g, '') + ' 日本');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};
