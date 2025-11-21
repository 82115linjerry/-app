
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Trip Data (Parsed from PDF) ---

const TRIP_DETAILS = {
  title: "2026 東京 & 箱根夢幻之旅",
  dates: "2026/03/11 (三) - 03/18 (三)",
  description: "東京迪士尼海洋夢幻泉鄉 ‧ 箱根溫泉 ‧ 下町散策 8日遊",
  flights: [
    { type: "去程", date: "03/11", number: "MM 620", from: "台北 (02:xx)", to: "成田 (06:35)" },
    { type: "回程", date: "03/18", number: "MM 625", from: "成田 (16:35)", to: "台北 (19:xx)" }
  ],
  accommodation: [
    { name: "夢幻泉鄉大飯店 (Fantasy Springs)", dates: "第 1 天", note: "入住夢幻泉鄉" },
    { name: "相鐵 FRESA INN 東新宿", dates: "第 2 天", note: "交通便利，乾淨" },
    { name: "MIRAHAKONE", dates: "第 3-4 天", note: "箱根強羅/箱根町自助旅宿" },
    { name: "SOLASIA 北上野", dates: "第 5-7 天", note: "上野便利住宿" }
  ]
};

const ITINERARY = [
  {
    day: 1,
    date: "3/11 (三)",
    title: "夢幻啟程與海洋之夜",
    keywords: "利木津巴士, Ikspiari, 飯店 Check-in, Oceano 晚餐",
    events: [
      { time: "06:35", title: "抵達東京成田機場 (T1)", note: "入境後前往利木津巴士櫃台購票往「東京迪士尼度假區/夢幻泉鄉大飯店」。" },
      { time: "08:00", title: "搭乘利木津巴士", note: "車程約 70 分鐘，於車上補眠。" },
      { time: "09:30", title: "飯店寄放行李", location: "Fantasy Springs Hotel", note: "地點：Bell Desk。確認領取住宿證明書 (Happy Entry)。" },
      { time: "10:30", title: "Ikspiari 早午餐", location: "Ikspiari", note: "搭乘迪士尼單軌電車 (Bayside -> Resort Gateway)。" },
      { time: "15:00", title: "飯店 Check-in", location: "Fantasy Springs Hotel", note: "享受飯店設施，參觀中庭。" },
      { time: "17:30", title: "前往晚餐地點", note: "動線：飯店 -> Bayside Station -> DisneySea Station -> 步行至 MiraCosta。" },
      { time: "18:30", title: "晚餐：Oceano (海洋宮)", location: "Oceano, Tokyo DisneySea MiraCosta", note: "【重頭戲】19:20 觀賞《Believe! Sea of Dreams》" },
      { time: "21:00", title: "返回夢幻泉鄉大飯店", location: "Fantasy Springs Hotel", note: "好好休息。" }
    ],
    food: [
      { type: "午餐", places: ["Kua' Aina (漢堡)", "Cafe Kaila (鬆餅)", "Reinbeck"] },
      { type: "點心", places: ["Nana's Green Tea", "貢茶 (Gong Cha)"] },
      { type: "晚餐", places: ["Oceano (首選)", "Silk Road Garden", "BellaVista Lounge"] }
    ]
  },
  {
    day: 2,
    date: "3/12 (四)",
    title: "迪士尼海洋全制霸",
    keywords: "Happy Entry, DPA, 夢幻泉鄉, 移動至新宿",
    events: [
      { time: "06:30", title: "起床 & 退房", note: "行李寄放櫃台，告知晚上回來拿。" },
      { time: "07:30", title: "專屬通道排隊", location: "Fantasy Springs Entrance", note: "利用住客專用通道。" },
      { time: "08:00", title: "Happy Entry 提早入園", note: "戰術：入園即買 DPA (冰雪奇緣) & 抽 SP (小飛俠/長髮公主)。" },
      { time: "09:00", title: "迪士尼海洋 夢想時光", location: "Tokyo DisneySea", note: "上午主攻夢幻泉鄉，下午遊玩地心探險、驚魂古塔。" },
      { time: "20:00", title: "領取行李", location: "Fantasy Springs Hotel", note: "返回飯店櫃台。" },
      { time: "20:30", title: "移動至新宿", location: "Sotetsu Fresa Inn Higashi Shinjuku", note: "方案A：利木津巴士直接去新宿。方案B：電車 (單軌->京葉線->臨海線直通埼京線->新宿)。" },
      { time: "22:00", title: "飯店 Check-in", note: "建議從新宿站搭計程車前往飯店 (約 1000 日圓)。" }
    ],
    food: [
      { type: "早餐", places: ["便利商店飯糰", "Mamma Biscotti's"] },
      { type: "午餐", places: ["Snuggly Duckling", "Vulcania", "Horizon Bay"] },
      { type: "晚餐", places: ["鳥貴族 (串燒)", "松屋", "吉拿棒"] }
    ]
  },
  {
    day: 3,
    date: "3/13 (五)",
    title: "浪漫特快前往箱根",
    keywords: "浪漫特快, 箱根湯本, 雕刻之森",
    events: [
      { time: "08:00", title: "前往新宿站", note: "搭計程車最快。" },
      { time: "09:00", title: "搭乘小田急浪漫特快", location: "Shinjuku Station", note: "車型 GSE/VSE (需搶展望席)。車上吃早餐。" },
      { time: "10:30", title: "抵達箱根湯本站", location: "Hakone-Yumoto Station", note: "⚠️【行李關鍵】將大行李寄放於「湯本站投幣置物櫃」或「人工寄存」。只帶過夜包上山。" },
      { time: "11:30", title: "午餐 & 商店街逛逛", note: "箱根湯本商店街。" },
      { time: "13:00", title: "箱根登山電車", note: "湯本 -> 雕刻之森。" },
      { time: "13:45", title: "雕刻之森美術館", location: "The Hakone Open-Air Museum", note: "網美必拍：彩色玻璃塔、荷包蛋裝置藝術。" },
      { time: "17:00", title: "返回湯本取行李 -> 計程車", note: "最保險做法是回湯本拿行李，直接搭計程車去民宿 (約 4000-5000 日圓)。" },
      { time: "18:30", title: "入住 MIRAHAKONE", location: "MIRAHAKONE", note: "自助入住。" }
    ],
    food: [
      { type: "午餐", places: ["Hatsuhana Soba (蕎麥麵)", "Yubadon Naokichi (豆腐皮)", "Coco Hakonero"] },
      { type: "晚餐", places: ["Gora Brewery (精釀)", "田村銀勝亭 (炸豆腐排)", "Lawson (強羅)"] }
    ]
  },
  {
    day: 4,
    date: "3/14 (六)",
    title: "箱根黃金圈環遊",
    keywords: "空中纜車, 大湧谷, 海賊船, 箱根神社",
    events: [
      { time: "09:00", title: "空中纜車", location: "Sounzan Station", note: "早雲山 -> 大湧谷。俯瞰地獄谷，看富士山。" },
      { time: "10:00", title: "大湧谷", location: "Owakudani", note: "吃延年益壽黑蛋。" },
      { time: "11:00", title: "箱根海賊船", location: "Togendai Station", note: "桃源台港 -> 元箱根港 (約30分)。甲板拍照。" },
      { time: "12:00", title: "箱根神社 & 平和鳥居", location: "Hakone Shrine", note: "沿湖邊走，排隊拍水上鳥居。" },
      { time: "14:00", title: "恩賜箱根公園", location: "Onshi-Hakone Park", note: "眺望蘆之湖全景。" },
      { time: "16:30", title: "登山巴士返回", note: "返回強羅/民宿。" }
    ],
    food: [
      { type: "午餐", places: ["Bakery & Table (麵包吃到飽)", "Togendai View", "Waku-Waku"] },
      { type: "點心", places: ["甘酒茶屋 (Amazake-chaya)", "茶屋本陣"] },
      { type: "晚餐", places: ["Itoh Dining (鐵板燒)", "餃子中心", "Passeggiata"] }
    ]
  },
  {
    day: 5,
    date: "3/15 (日)",
    title: "豪華移動日 -> 上野",
    keywords: "Green Car, 小田原, 上野",
    events: [
      { time: "10:00", title: "退房 -> 小田原", note: "計程車下山至湯本，轉電車至小田原站。" },
      { time: "11:30", title: "小田原站買便當", location: "Odawara Station", note: "推薦「東華軒鯛魚飯」。" },
      { time: "12:30", title: "JR 上野東京線 (Green Car)", note: "月台購買 Green Car 券，上車刷卡。路線：小田原 -> 上野。" },
      { time: "14:00", title: "抵達上野 -> 飯店", location: "Solasia Kita Ueno", note: "搭計程車前往 Solasia。" },
      { time: "16:00", title: "阿美橫丁 / 上野公園", location: "Ameyoko", note: "隨意散步。" }
    ],
    food: [
      { type: "午餐", places: ["Hakone Bakery", "魚菓子", "車站便當"] },
      { type: "點心", places: ["Mihashi (紅豆湯圓)", "Usagiya (銅鑼燒)", "Harbs"] },
      { type: "晚餐", places: ["磯丸水產", "Negishi (牛舌)", "山家豬排"] }
    ]
  },
  {
    day: 6,
    date: "3/16 (一)",
    title: "下町老東京與晴空塔",
    keywords: "淺草寺, 隅田川, 晴空塔, 合羽橋",
    events: [
      { time: "09:00", title: "淺草寺 & 雷門", location: "Senso-ji", note: "避開人潮，仲見世通吃人形燒。" },
      { time: "11:00", title: "隅田川步道", location: "Sumida River Walk", note: "步行前往晴空塔，沿途風景優美。" },
      { time: "12:00", title: "晴空塔 & Solamachi", location: "Tokyo Skytree", note: "午餐與購物 (寶可夢中心、吉卜力)。" },
      { time: "15:00", title: "藏前 (Kuramae)", location: "Kuramae", note: "探訪職人咖啡店與文具店。" },
      { time: "17:00", title: "合羽橋道具街", location: "Kappabashi Dougu Street", note: "廚具控天堂 (注意 17:30 打烊)。" }
    ],
    food: [
      { type: "午餐", places: ["淺草今半 (壽喜燒)", "根室花丸 (壽司)", "Yoshikami (洋食)"] },
      { type: "點心", places: ["Dandelion Chocolate", "Coffee Wrights", "From Afar"] },
      { type: "晚餐", places: ["淺草泥鰍鍋", "與ろゐ屋拉麵", "文字燒"] }
    ]
  },
  {
    day: 7,
    date: "3/17 (二)",
    title: "銀座時尚與最後巡禮",
    keywords: "銀座, 東京車站, 皇居",
    events: [
      { time: "10:00", title: "銀座 (Ginza)", location: "Ginza Six", note: "GINZA SIX, Uniqlo 旗艦店。" },
      { time: "13:00", title: "東京車站", location: "Tokyo Station", note: "丸之內紅磚站舍拍照、一番街買伴手禮。" },
      { time: "16:00", title: "皇居外苑", location: "Imperial Palace Outer Garden", note: "散步。" },
      { time: "18:00", title: "上野最後衝刺", location: "Takeya", note: "多慶屋買藥妝、二木之菓子買零食。" }
    ],
    food: [
      { type: "午餐", places: ["銀座 篝 (雞白湯)", "Tsurutontan (烏龍麵)", "根室花丸 (KITTE)"] },
      { type: "晚餐", places: ["Yakiniku Like", "肉的大山", "一蘭拉麵"] }
    ]
  },
  {
    day: 8,
    date: "3/18 (三)",
    title: "再見東京",
    keywords: "Skyliner, 返家",
    events: [
      { time: "09:00", title: "退房", note: "寄放櫃台。" },
      { time: "09:30", title: "上野公園漫步", location: "Ueno Park", note: "最後漫步。" },
      { time: "12:00", title: "取行李 -> 京成上野站", location: "Keisei Ueno Station", note: "前往搭車。" },
      { time: "13:20", title: "Skyliner 往成田", note: "約 45 分鐘。" },
      { time: "14:10", title: "抵達機場 (T1)", location: "Narita Airport Terminal 1", note: "辦理登機。" },
      { time: "16:35", title: "MM 625 起飛", note: "平安返家。" }
    ],
    food: []
  }
];

const TIPS = [
  "交通：Suica/PASMO 綁定手機全程必備。",
  "交通：Day 3 新宿購買箱根周遊券 (Hakone Freepass)。",
  "網路：購買高品質 eSIM (如 Ubigi, DJB)。",
  "預約：Oceano 晚餐 3個月前 10:00 開搶。",
  "預約：浪漫特快展望席 1個月前 09:00 開搶。",
  "行李：Day 3 去箱根絕對不要拖大行李搭登山巴士，善用湯本站置物櫃。"
];

// --- Icons ---

const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Plane: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5"/><path d="M13 12h9"/><path d="M20.2 18l-2.2-6 2.2-6"/><path d="M4.8 6l2.2 6-2.2 6"/><path d="M10 16l-2-4 2-4"/></svg>,
  Bed: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Utensils: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
};

// --- Components ---

const Dashboard = ({ onChangeTab }) => (
  <div className="scroll-area">
    <div className="card" style={{ background: "linear-gradient(135deg, #FF8ba7 0%, #ffccd5 100%)", color: "white", border: 'none' }}>
      <h2 style={{color: "white", fontSize: '1.5rem'}}>{TRIP_DETAILS.title}</h2>
      <p style={{opacity: 0.9}}>{TRIP_DETAILS.dates}</p>
      <p style={{marginTop: '10px', fontSize: '0.9rem'}}>{TRIP_DETAILS.description}</p>
      <button 
        className="btn" 
        style={{marginTop: '15px', background: 'white', color: '#FF8ba7'}}
        onClick={() => onChangeTab('itinerary')}
      >
        查看詳細行程
      </button>
    </div>

    <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
      <Icons.Plane /> 航班資訊
    </h3>
    <div className="card">
      {TRIP_DETAILS.flights.map((f, i) => (
        <div key={i} style={{marginBottom: i === 0 ? '12px' : 0, paddingBottom: i === 0 ? '12px' : 0, borderBottom: i === 0 ? '1px solid #eee' : 'none'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
            <span>{f.type} ({f.date})</span>
            <span>{f.number}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#666'}}>
            <span>{f.from}</span>
            <span>➝</span>
            <span>{f.to}</span>
          </div>
        </div>
      ))}
    </div>

    <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
      <Icons.Bed /> 住宿安排
    </h3>
    <div className="card">
      {TRIP_DETAILS.accommodation.map((h, i) => (
        <div key={i} style={{marginBottom: '12px'}}>
          <div style={{fontWeight: 'bold', color: '#2c3e50'}}>{h.dates}: {h.name}</div>
          <div style={{fontSize: '0.9rem', color: '#666'}}>{h.note}</div>
        </div>
      ))}
    </div>

    <h3>實用連結</h3>
    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
      <a href="https://www.google.com/maps" target="_blank" className="btn btn-outline" style={{flex: 1}}>Google Maps</a>
      <a href="https://www.tokyodisneyresort.jp/tc/index.html" target="_blank" className="btn btn-outline" style={{flex: 1}}>迪士尼 App</a>
    </div>
    
    {/* Spacer for nav bar */}
    <div style={{height: '60px'}}></div>
  </div>
);

const ItineraryView = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const dayData = ITINERARY.find(d => d.day === selectedDay);

  return (
    <div className="scroll-area" style={{padding: 0}}>
      <div style={{
        overflowX: 'auto', 
        display: 'flex',
        flexWrap: 'nowrap', /* CRITICAL: Ensure items stay in one row */
        padding: '15px', 
        paddingRight: '20px', 
        gap: '10px', 
        background: 'white',
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 5
      }}>
        {ITINERARY.map(day => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(day.day)}
            style={{
              flex: '0 0 auto', // CRITICAL: Do not shrink buttons
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedDay === day.day ? 'none' : '1px solid #eee',
              background: selectedDay === day.day ? 'var(--primary)' : 'white',
              color: selectedDay === day.day ? 'white' : 'var(--text)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap'
            }}
          >
            第 {day.day} 天
          </button>
        ))}
        {/* Explicit spacer for webkit scrolling padding issues ensures Day 8 is visible, reduced to 15px for aesthetics */}
        <div style={{flex: '0 0 15px', height: '1px'}}></div>
      </div>

      <div style={{padding: '20px'}}>
        <h2 style={{color: 'var(--primary)'}}>第 {dayData.day} 天: {dayData.title}</h2>
        <p style={{color: '#888', marginBottom: '20px'}}>{dayData.date}</p>

        <div style={{marginBottom: '20px'}}>
           {dayData.keywords.split(', ').map(k => <span key={k} className="tag">{k}</span>)}
        </div>

        {dayData.events.map((event, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-time">{event.time}</div>
            <div className="timeline-content">
              <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{event.title}</div>
              <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '4px'}}>{event.note}</p>
              {event.location && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} 
                  target="_blank"
                  style={{display: 'inline-flex', alignItems: 'center', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.85rem'}}
                >
                  <Icons.MapPin /> {event.location}
                </a>
              )}
            </div>
          </div>
        ))}

        {dayData.food && dayData.food.length > 0 && (
          <div className="card" style={{marginTop: '20px', background: '#fff9fa', border: '1px solid #ffe0e6'}}>
             <h3 style={{color: '#d63384', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem'}}>
               <Icons.Utensils /> 美食推薦
             </h3>
             {dayData.food.map((f, i) => (
               <div key={i} style={{marginTop: '10px'}}>
                 <span style={{fontWeight: 'bold', fontSize: '0.9rem', background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ffcce0'}}>{f.type}</span>
                 <div style={{marginTop: '4px', paddingLeft: '4px', paddingRight: '10px', color: '#555', lineHeight: '1.6'}}>
                   {f.places.join(" / ")}
                 </div>
               </div>
             ))}
          </div>
        )}
        
        {/* Extra spacer to ensure content is not hidden behind the bottom nav bar */}
        <div style={{height: '100px'}}></div>
      </div>
    </div>
  );
};

const AI_SYSTEM_PROMPT = `
你是「夢幻旅程助手」，一位專為 2026 年 3 月東京與箱根之旅設計的貼心旅遊伴侶。
這是完整的行程 JSON 資料：${JSON.stringify(ITINERARY)}
這是重要的旅遊小貼士：${JSON.stringify(TIPS)}

你的目標：協助使用者導航行程、選擇餐廳，並提醒重要事項。

指導原則：
1. 回答請使用繁體中文。
2. 如果使用者問「接下來做什麼？」，請根據目前假設的時間或詢問他們現在是第幾天/幾點，然後告訴他們下一個活動。
3. 如果使用者詢問美食建議，請查看行程中當天的 'food' 陣列。
4. 如果使用者詢問交通，請參考活動中的 "note" 欄位 (例如：浪漫特快、Green Car、利木津巴士)。
5. 保持簡潔、友善且鼓舞人心。適度使用表情符號。
6. 如果被問到「最有效率的方法」，請查看 TIPS 或特定活動的備註 (例如：「這裡搭計程車最好」)。
7. 請勿輸出 Markdown 格式，僅輸出純文字。
`;

const AssistantView = () => {
  const [messages, setMessages] = useState([
    { role: "model", text: "嗨！我是您的東京與箱根旅遊助手。需要幫忙找餐廳、查詢行程或導航嗎？🌸" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct history for the API
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({ 
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: AI_SYSTEM_PROMPT
        },
        history
      });

      const result = await chat.sendMessage({ message: userMsg });
      const response = result.text;

      setMessages(prev => [...prev, { role: "ai", text: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", text: "抱歉，連線有點問題，請再試一次！🗼" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scroll-area" style={{display: 'flex', flexDirection: 'column', padding: 0}}>
      <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="chat-message chat-ai">輸入中...</div>}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area - fixed above nav bar visually due to layout structure */}
      <div style={{
        padding: '15px', 
        borderTop: '1px solid #eee', 
        background: 'white', 
        display: 'flex', 
        gap: '10px',
        // Ensure this section clears the nav bar height
        paddingBottom: '80px' 
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="輸入問題... (例如：晚餐吃什麼？)"
          style={{flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none'}}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading}
          style={{background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}
        >
          <Icons.Send />
        </button>
      </div>
    </div>
  );
};

const TipsView = () => (
  <div className="scroll-area">
    <h2 style={{color: 'var(--primary)', marginBottom: '20px'}}>旅遊小貼士 💡</h2>
    <div className="card">
       <ul style={{paddingLeft: '20px', lineHeight: '1.6'}}>
         {TIPS.map((tip, i) => (
           <li key={i} style={{marginBottom: '10px'}}>{tip}</li>
         ))}
       </ul>
    </div>
    
    <h3>行前準備 & 天氣</h3>
    <div className="card">
      <p><strong>天氣：</strong> 3 月東京平均氣溫 13°C / 5°C。請攜帶大衣。</p>
      <p><strong>電壓：</strong> 日本使用 Type A 插座 (100V)。</p>
      <p><strong>貨幣：</strong> 日圓 (JPY)。箱根鄉下建議攜帶現金。</p>
    </div>
    
    <div style={{height: '60px'}}></div>
  </div>
);

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <Dashboard onChangeTab={setActiveTab} />;
      case "itinerary": return <ItineraryView />;
      case "chat": return <AssistantView />;
      case "tips": return <TipsView />;
      default: return <Dashboard onChangeTab={setActiveTab} />;
    }
  };

  const NavItem = ({ name, icon: Icon, id }) => (
    <div 
      className={`nav-item ${activeTab === id ? 'active' : ''}`} 
      onClick={() => setActiveTab(id)}
    >
      <Icon />
      <span>{name}</span>
    </div>
  );

  return (
    <div className="container">
      {renderContent()}
      
      <div className="nav-bar">
        <NavItem name="首頁" icon={Icons.Home} id="home" />
        <NavItem name="行程" icon={Icons.Map} id="itinerary" />
        <NavItem name="助手" icon={Icons.MessageSquare} id="chat" />
        <NavItem name="資訊" icon={Icons.Info} id="tips" />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
