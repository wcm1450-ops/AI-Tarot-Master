import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Heart, Star, Compass, Wind, ShieldCheck, Moon } from 'lucide-react';

interface DialogueState {
  teacherName: string;
  avatarIcon: string;
  auraColor: string;
  status: string;
  message: string;
}

export default function TarotTeacherInteractive() {
  const [dialogue, setDialogue] = useState<DialogueState>({
    teacherName: "奧利維亞 (Olivia)",
    avatarIcon: "🔮",
    auraColor: "from-purple-500/40 via-pink-500/10 to-transparent",
    status: "冥想引導中",
    message: "「旅人，歡迎來到星月神殿。我是妳的塔羅導師奧利維亞。在這裡，命運的迷霧將漸漸撥開，告訴我，此時此刻，妳的靈魂正在尋求什麼，或者，讓我們先做一次心靈呼吸調頻？」"
  });

  const [mood, setMood] = useState<string>('');
  
  // 3D Card flip state
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [drawnBlessing, setDrawnBlessing] = useState<{ id: string; name: string; blessing: string; element: string } | null>(null);

  // Breathing meditation state
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathTimer, setBreathTimer] = useState<number>(4);

  // Breathing loop effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 4;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 4;
            } else {
              setBreathPhase('inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathTimer(4);
      setBreathPhase('inhale');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing, breathPhase]);

  // Handle breath guide prompt message
  useEffect(() => {
    if (isBreathing) {
      let text = "";
      if (breathPhase === 'inhale') text = "「吸氣…… 感受天際星辰的靜謐微光化為能量注入妳的心中。」";
      else if (breathPhase === 'hold') text = "「屏息…… 鎖住這份寧靜，釋放雜念，讓靈魂歸於澄澈與平靜。」";
      else text = "「呼氣…… 將積落的壓力與陰霾緩緩吐納乾淨，感覺一身暢快。」";
      
      setDialogue(prev => ({
        ...prev,
        status: "帶領深呼吸中 🌬️",
        message: text
      }));
    }
  }, [breathPhase, isBreathing]);

  // Mood dialog responses dictionary
  const handleSelectMood = (selectedMood: string) => {
    setMood(selectedMood);
    setIsBreathing(false); // Stop breathing to focus on dialogue

    let responseMsg = "";
    let aura = "";
    let teacherIcon = "🔮";

    switch (selectedMood) {
      case 'lost':
        responseMsg = "「在迷茫的荒野中漫步，並不代表妳偏離了軌道。正如同【愚者】牌所描述的，每一個不知方向的起點，都是孕育無限可能的聖光。試著閉上眼睛，信任妳的直覺，星芒指引往往在安靜時顯現。」";
        aura = "from-emerald-500/40 via-teal-500/10 to-transparent";
        teacherIcon = "🌿";
        break;
      case 'love':
        responseMsg = "「渴望愛是靈魂最純粹的震動。正如同【戀人】所守護的神聖氣場，真愛從來不是迎合，而是兩顆自由靈魂的互相映射。請在愛人之前，先溫柔撫慰妳的心，愛神將在契合的磁場完美降臨。」";
        aura = "from-rose-500/40 via-pink-400/10 to-transparent";
        teacherIcon = "💖";
        break;
      case 'fortune':
        responseMsg = "「幸運的泉源不在遠方，而在妳心中對豐盛的相信。【命運之輪】轉動不停，今日對任何出現在身邊的微小幸福都心懷感恩，磁場相吸，豐沛的黃金財氣便會被妳源源不絕地拽引而來。」";
        aura = "from-amber-400/40 via-yellow-500/10 to-transparent";
        teacherIcon = "🌟";
        break;
      case 'anxious':
        responseMsg = "「繁雜的俗世總是急躁的。正如同【女祭司】在靜音的帷幕後沉思，只有水流止歇，妳才能看清湖底的秘密。請跟我做一次上面的『心靈調頻呼吸』，讓思緒的水花慢慢平復沉澱。」";
        aura = "from-sky-500/40 via-blue-500/10 to-transparent";
        teacherIcon = "🛡️";
        break;
      case 'spiritual':
        responseMsg = "「靈魂的修行是不斷擦拭靈心鏡面的過程。今日【隱士】微光高舉，代表著內在自省的絕佳時機。妳正在與更高層次的智慧共振。多看一些書籍或占卜卡牌，會有意想不到的深刻頓悟。」";
        aura = "from-purple-600/45 via-indigo-500/10 to-transparent";
        teacherIcon = "🌌";
        break;
      default:
        responseMsg = "「讓我們靜心諦聽，宇宙微光與宿命風向今日將在妳身側吹拂。」";
        aura = "from-purple-500/40 via-pink-500/10 to-transparent";
    }

    setDialogue({
      teacherName: "奧利維亞 (Olivia)",
      avatarIcon: teacherIcon,
      auraColor: aura,
      status: "心靈引導中 ✨",
      message: responseMsg
    });
  };

  const drawList = [
    { id: "THE_FOOL", name: "0. 愚者之耀", blessing: "放膽出發吧，命運會親自接住純善而無畏的人。所有起點皆有星辰眷顧！", element: "風元素 🌬️" },
    { id: "THE_MAGICIAN", name: "I. 魔術師之智", blessing: "妳具備解決當前挑戰的所有天賦與工具。自信即是召喚奇蹟的鑰匙。", element: "風元素 🌬️" },
    { id: "THE_EMPRESS", name: "III. 皇后之澤", blessing: "母性、生長與溫柔的愛正在醞釀。請好好滋潤妳的肉體，並慶祝所有美好豐盛。", element: "土元素 🌿" },
    { id: "THE_HERMIT", name: "IX. 隱士微光", blessing: "在外界的喧囂中退回內心。此時的孤獨不是寂寞，是引路明燈正在被擦亮。", element: "土元素 🌿" },
    { id: "WHEEL_OF_FORTUNE", name: "X. 命運之輪", blessing: "風浪即將反轉，低谷後的上升期就在眼前。放鬆控制，順應宇宙的潮汐轉向。", element: "火元素 🔥" },
    { id: "THE_STAR", name: "XVII. 星辰之光", blessing: "深沉的痊癒與希望正在流向妳。妳的祈禱已被神明接納，美好的和平即將降落。", element: "水元素 💧" },
    { id: "THE_SUN", name: "XIX. 太陽之冕", blessing: "生命力滿格！今日不論做什麼都能煥發極大溫暖與正能量，成功指日可待。", element: "火元素 🔥" }
  ];

  const handleDrawBlessingCard = () => {
    setIsFlipped(false);
    const rand = drawList[Math.floor(Math.random() * drawList.length)];
    setDrawnBlessing(rand);
    setDialogue(prev => ({
      ...prev,
      status: "翻轉祝福中 ✨",
      message: `「旅人，我已替妳抽取靈魂祝福卡【${rand.name}】。這張卡承載著當下的神諭祝福，點擊右方卡牌翻開，讀取宇宙今日為妳寫下的祝福箴言吧。」`
    }));
    setTimeout(() => {
      setIsFlipped(true);
    }, 150);
  };

  // Master Quotes Pool
  const masterQuotes = [
    "「記住，【命運之輪】不停轉動。低谷並非終點，而是為下一次登頂蓄力。保持平和，順應潮汐。」",
    "「【女祭司】在靜默中看穿虛實。當妳迷茫時，閉上雙眼、調頻呼吸，最深層的直覺就是妳最好的引路星光。」",
    "「【魔術師】的手中握有風、火、水、土。妳早已具備了改變現狀所需的所有工具，只需要信任妳的創造力。」",
    "「像【愚者】一樣，踩在懸崖邊緣依然心懷純真。有時候，閉著眼睛向前邁出一步，宇宙就會親自將路鋪好。」",
    "「【隱士】的明燈不為照亮世界，只為照亮他腳下的路。在嘈雜之中退回自我，妳的靈心鏡面才會重歸澄澈。」",
    "「【皇后】的王座灌注了溫柔不絕的愛。好好滋潤自己的肉體和心靈，只有盆滿缽盈，愛意才能優雅向外滿溢。」",
    "「【星辰】雖然微弱，卻能在最黑暗的夜空中指引方向。妳昨日受過的傷，都是為了今日透出最美麗的光彩。」",
    "「【太陽】高掛之時，陰霾無處躲藏。今天大膽展現妳的能量、熱情與笑容，妳就是這片磁場的宇宙中心！」",
    "「像【力量】牌張開雙臂輕撫獅子，溫柔永遠比暴力更有野性力量。用慈悲與包容化解衝突，命運將為妳低頭。」",
    "「【正義】的天平在妳心中。誠實地面對並做對的選擇，無愧於心便是靈魂免受世俗繁雜干擾的最大護甲。」",
    "「【命運】的劇本早已寫好，但如何演繹這場戲的主導權，重來都在妳的意志與慈悲之間。」",
    "「【世界】牌的旅程終將圓滿。此時經歷的考驗，只是一次微小的迴旋，請對自己充滿神聖的敬意。」"
  ];

  const [activeBubbleQuote, setActiveBubbleQuote] = useState<string | null>(null);
  const [quoteAnim, setQuoteAnim] = useState<boolean>(false);

  const handleTeacherClick = () => {
    setIsBreathing(false); // Stop breathing to focus
    const randomQuote = masterQuotes[Math.floor(Math.random() * masterQuotes.length)];
    
    // Animate pop-in
    setActiveBubbleQuote(randomQuote);
    setQuoteAnim(true);

    // Update main dialogue too
    setDialogue({
      teacherName: "奧利維亞 (Olivia)",
      avatarIcon: "🔮",
      auraColor: "from-amber-400/40 via-purple-500/10 to-transparent",
      status: "大師指引中 🌟",
      message: `「旅人，看著我的眼睛，為妳帶來一句宿命啟示：${randomQuote}」`
    });
  };

  // Mouse position state for 3D Parallax effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Get mouse position relative to the outer card's center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Smooth responsive tilt multipliers
    setTilt({
      x: -y * 16, // max tilt of 16 degrees on x-axis
      y: x * 16   // max tilt of 16 degrees on y-axis
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-[#090a1f] border border-purple-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 ease-out select-none"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x * 0.15}deg) rotateY(${tilt.y * 0.15}deg)`,
      }}
    >
      
      {/* Background soft ambiance blobs */}
      <div 
        className={`absolute -top-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-br ${dialogue.auraColor} blur-2xl pointer-events-none transition-all duration-700`}
        style={{
          transform: `translate3d(${tilt.y * -0.8}px, ${tilt.x * -0.8}px, 0)`,
        }}
      />
      <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-purple-900/5 blur-xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-purple-500/10 pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            星殿導師互動 ‧ 即時對話系統
          </span>
        </div>
        <div className="bg-purple-950/70 border border-purple-500/20 rounded-full px-2.5 py-0.5 text-[9px] text-amber-300 flex items-center gap-1">
          <Moon size={10} /> 靈魂共鳴值: Max
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Olivia Portrait & Interactive Dialogue Bubble */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-5 items-center md:items-start">
          
          {/* Avatar Area with Floating Animation & dynamic glow */}
          <div 
            className="relative shrink-0 select-none group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Hover Tooltip: 老師正在傾聽... */}
            <div 
              className={`absolute -top-12 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950 border border-amber-400/50 text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1 transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 pointer-events-none'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              ✨ 老師正在傾聽...
            </div>

            {/* Status indicator light (沈睡/覺醒) */}
            <div className="absolute -top-4 right-1 z-30 flex items-center gap-1 bg-slate-950/80 border border-purple-500/30 rounded-full px-2 py-0.5 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHovered ? 'bg-amber-400' : 'bg-purple-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHovered ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-purple-500 shadow-[0_0_8px_#a855f7]'
                }`} />
              </span>
              <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${
                isHovered ? 'text-amber-300' : 'text-purple-300/80'
              }`}>
                {isHovered ? '覺醒' : '沈睡'}
              </span>
            </div>

            {/* Dynamic glowing aura ring */}
            <div 
              className={`absolute -inset-2.5 rounded-full bg-gradient-to-tr ${dialogue.auraColor} opacity-80 blur-md animate-pulse transition-all duration-700`} 
              style={{
                transform: `translate3d(${tilt.y * 0.6}px, ${tilt.x * -0.6}px, 0)`,
              }}
            />
            
            {/* The Avatar representation with layered styling */}
            <div 
              onClick={handleTeacherClick}
              className={`relative w-23 h-23 md:w-26 md:h-26 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 text-center overflow-visible ${
                isHovered ? 'border-amber-400 shadow-amber-500/20 scale-105' : 'border-amber-300/40 shadow-purple-500/10'
              }`}
              style={{
                transform: `perspective(500px) rotateX(${tilt.x * 1.1}deg) rotateY(${tilt.y * 1.1}deg) translate3d(${tilt.y * 0.4}px, ${tilt.x * 0.4}px, 15px)`,
              }}
            >
              <span 
                className="text-4xl md:text-5xl inline-block absolute transition-transform duration-150 ease-out animate-bounce [animation-duration:4s]"
                style={{
                  transform: `translate3d(${tilt.y * 0.5}px, ${tilt.x * 0.5}px, 35px)`,
                }}
              >
                {dialogue.avatarIcon}
              </span>
              
              {/* Little status badge with parallax shift */}
              <div 
                className="absolute -bottom-1 -right-1 bg-[#060714] border border-amber-400/30 text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-20"
                style={{
                  transform: `translate3d(${tilt.y * 0.2}px, ${tilt.x * 0.2}px, 45px)`,
                }}
              >
                {dialogue.status}
              </div>
            </div>
            
            <p className="text-center text-xs font-bold text-slate-300 mt-3 tracking-wide block relative z-10">
              {dialogue.teacherName}
            </p>

            {/* Click-triggered Wisdom Text Bubble */}
            {activeBubbleQuote && (
              <div 
                className={`absolute left-1/2 md:left-full md:top-2 md:ml-4 transform -translate-x-1/2 md:translate-x-0 z-50 w-64 md:w-72 bg-gradient-to-br from-slate-950 via-slate-900 to-[#1e052c] border border-amber-300/60 p-3 md:p-4 rounded-xl shadow-2xl transition-all duration-300 ease-out flex flex-col gap-1.5 ${
                  quoteAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
                style={{
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3), 0 0 15px 1px rgba(168, 85, 247, 0.15)'
                }}
              >
                {/* Speech bubble tail pointer for desktop */}
                <div className="absolute hidden md:block left-[-6px] top-8 w-3 h-3 bg-slate-950 border-l border-b border-amber-300/60 rotate-45" />
                
                <div className="flex items-center justify-between border-b border-amber-300/20 pb-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles size={10} className="text-amber-400 animate-spin" />
                    <span>大師靈魂指引</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBubbleQuote(null);
                    }}
                    className="text-slate-400 hover:text-amber-300 transition-colors text-[10px] font-black cursor-pointer bg-slate-905 px-1 border border-purple-500/20 rounded"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-slate-100 text-xs leading-relaxed font-sans italic">
                  {activeBubbleQuote}
                </p>
                
                <span className="text-[9px] text-amber-300/80 font-semibold self-end">
                  — 奧利維亞 ‧ 溫馨啟發
                </span>
              </div>
            )}
          </div>

          {/* Dialogue bubble */}
          <div className="flex-1 bg-slate-950/60 border border-purple-500/10 rounded-2xl p-4 md:p-5 relative min-h-[120px] flex flex-col justify-between">
            {/* Decorative arrow */}
            <div className="absolute top-6 left-1/2 -mt-2 -ml-2 border-4 border-transparent border-b-slate-950/60 md:top-8 md:left-0 md:ml-[-8px] md:border-r-slate-950/60 md:border-b-transparent transform md:-translate-y-1/2" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <MessageCircle size={12} />
                <span>Olivia 導師低語 :</span>
              </div>
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed transition-all duration-500">
                {dialogue.message}
              </p>
            </div>

            {/* Quick Helper Tip */}
            <div className="mt-4 pt-3 border-t border-purple-500/5 text-[10px] text-slate-500 flex justify-between">
              <span>* 奧利維亞導師會隨著妳的氣場調和及選擇給予反饋。</span>
              {isBreathing && <span className="text-amber-300 font-bold">狀態：冥想引導中</span>}
            </div>
          </div>

        </div>

        {/* Right Column: Interaction controller */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-purple-500/10 rounded-xl p-4 flex flex-col justify-between space-y-4">
          
          {/* Section 1: Harmonise mood slots */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-300 tracking-widest block uppercase">
              🔮 點選我當前的「靈魂氣場狀態」
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectMood('lost')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1 cursor-pointer ${
                  mood === 'lost' 
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' 
                    : 'bg-slate-950/60 border-purple-500/5 text-slate-300 hover:bg-slate-950 hover:text-slate-100'
                }`}
              >
                <span>🌫️</span> 迷茫困惑
              </button>
              <button
                onClick={() => handleSelectMood('love')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1 cursor-pointer ${
                  mood === 'love' 
                    ? 'bg-rose-950/50 border-rose-500/40 text-rose-300 font-bold' 
                    : 'bg-slate-950/60 border-purple-500/5 text-slate-300 hover:bg-slate-950 hover:text-slate-100'
                }`}
              >
                <span>💖</span> 渴望真愛
              </button>
              <button
                onClick={() => handleSelectMood('fortune')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1 cursor-pointer ${
                  mood === 'fortune' 
                    ? 'bg-amber-950/50 border-amber-500/40 text-amber-300 font-bold' 
                    : 'bg-slate-950/60 border-purple-500/5 text-slate-300 hover:bg-slate-950 hover:text-slate-100'
                }`}
              >
                <span>🍀</span> 祈願好運
              </button>
              <button
                onClick={() => handleSelectMood('anxious')}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1 cursor-pointer ${
                  mood === 'anxious' 
                    ? 'bg-sky-950/50 border-sky-500/40 text-sky-300 font-bold' 
                    : 'bg-slate-950/60 border-purple-500/5 text-slate-300 hover:bg-slate-950 hover:text-slate-100'
                }`}
              >
                <span>🌪️</span> 焦慮繁雜
              </button>
              <button
                onClick={() => handleSelectMood('spiritual')}
                className={`col-span-2 md:col-span-1 lg:col-span-2 text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1 cursor-pointer ${
                  mood === 'spiritual' 
                    ? 'bg-purple-950/60 border-purple-500/40 text-purple-200 font-bold' 
                    : 'bg-slate-950/60 border-purple-500/5 text-slate-300 hover:bg-slate-950 hover:text-slate-100'
                }`}
              >
                <span>🌌</span> 追求內在覺醒
              </button>
            </div>
          </div>

          {/* Section 2: Meditation Breathing Tool */}
          <div className="bg-slate-950/60 border border-purple-500/10 rounded-xl p-3 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                <Wind size={12} className="text-purple-400" />
                心靈呼吸調頻 (4-4-4 吐納法)
              </span>
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className={`text-[9px] px-2 py-0.5 rounded cursor-pointer transition-all ${
                  isBreathing 
                    ? 'bg-red-950 text-red-300 border border-red-500/30' 
                    : 'bg-purple-900/50 hover:bg-purple-900 text-purple-200'
                }`}
              >
                {isBreathing ? '停止調頻' : '開始調頻'}
              </button>
            </div>

            {isBreathing ? (
              <div className="flex items-center gap-3 py-1">
                {/* Visual ripple scaling circle based on phase */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500/30 opacity-30 transform transition-all duration-1000 ${
                    breathPhase === 'inhale' ? 'scale-125' : breathPhase === 'hold' ? 'scale-110 animate-pulse' : 'scale-75'
                  }`} />
                  <div className="relative z-10 text-xs font-black text-amber-300">
                    {breathTimer}s
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-200 block">
                    {breathPhase === 'inhale' && '🔘 吸氣中...'}
                    {breathPhase === 'hold' && '⏳ 閉息冥想中...'}
                    {breathPhase === 'exhale' && '💨 緩慢吐氣中...'}
                  </span>
                  <span className="text-[9px] text-slate-400">隨著紫色光暈緩緩擴張與縮小</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 leading-normal">
                洗牌運勢前，可點擊「開始調頻」進行 12 秒呼吸淨化心智，以獲得最精準的卡牌呼應。
              </p>
            )}
          </div>

          {/* Section 3: Draw Instant Soul Blessing card */}
          <div className="space-y-2">
            <button
              onClick={handleDrawBlessingCard}
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/40 cursor-pointer"
            >
              <Sparkles size={12} className="text-amber-300" />
              請老師翻一張「每日靈魂神諭」
            </button>
            
            {drawnBlessing && (
              <div className={`bg-slate-950 border border-amber-400/20 rounded-lg p-2.5 transition-all duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0 scale-95'}`}>
                <div className="flex justify-between items-center text-[9px] text-amber-400 font-bold">
                  <span>神諭：{drawnBlessing.name}</span>
                  <span>{drawnBlessing.element}</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 italic tracking-wide leading-relaxed">
                  「{drawnBlessing.blessing}」
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
