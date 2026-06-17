import React, { useState } from 'react';
import { drawRandomCards } from '../data/tarotCards';
import { TarotCard, CardReadingItem, TarotReading } from '../types';
import { Sparkles, Eye, Save, HelpCircle, RefreshCw, MessageSquare, Flame, Heart, Layers, ArrowRight, Star } from 'lucide-react';

interface SpreadConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  cardCount: number;
  positions: { name: string; desc: string }[];
}

const SPREADS: SpreadConfig[] = [
  {
    id: 'single',
    name: '今日單卡天啟',
    description: '適合快速解答是非問答或尋找今日行事主基調',
    icon: Flame,
    cardCount: 1,
    positions: [
      { name: '神諭核心', desc: '指引你當下面臨之惑最直接的真理與核心警示。' }
    ]
  },
  {
    id: 'three_cards',
    name: '聖三角牌陣',
    description: '洞察事情的前因、後果、現狀與時間長河中的脈絡',
    icon: Layers,
    cardCount: 3,
    positions: [
      { name: '過去', desc: '此時此刻困境所承襲的因果基石與歷史起效點。' },
      { name: '現在', desc: '占卜者當下所處的表面困境與最真實的核心能量。' },
      { name: '未來', desc: '順應當下的心態與自然定律發展，即將來臨的結果。' }
    ]
  },
  {
    id: 'love',
    name: '愛情關係局',
    description: '專攻曖昧暗戀、情侶摩擦與緣分走勢的十字深剖析',
    icon: Heart,
    cardCount: 5,
    positions: [
      { name: '您的心境', desc: '您在這段感情關係中，潛意識最追求與焦慮的心聲。' },
      { name: '對方看法', desc: '伴侶或目標對象當前對您的看法、期許與真實愛憐。' },
      { name: '關係現狀', desc: '在現實生活中，雙方相處的黏著度、瓶頸與交點。' },
      { name: '核心阻礙', desc: '影響你們走得更遠的家庭、性格或第三者障礙。' },
      { name: '關係走向', desc: '未來三個月至半年內，這段宿命關係的圓滿或和平釋放。' }
    ]
  },
  {
    id: 'career',
    name: '事業十字局',
    description: '剖析職場晉升、離職跳槽、合夥創業的機遇與挑戰',
    icon: Sparkles,
    cardCount: 4,
    positions: [
      { name: '事業現狀', desc: '您在當前工作、學業或商業領域的基礎定位與優勢。' },
      { name: '面臨瓶頸', desc: '正面拖累你進度、造成小人掣肘或資源緊繃的直接阻礙。' },
      { name: '潛在機會', desc: '即將垂青於您的外在貴人、政策轉向、或暗處商機。' },
      { name: '最终結果', desc: '妥善應對上述要素後，你在功名利祿上的預期落實。' }
    ]
  },
  {
    id: 'celtic',
    name: '凱爾特十字',
    description: '神祕學中最全能、精準的10張巨幅宿命大推盤',
    icon: Star,
    cardCount: 10,
    positions: [
      { name: '當前處境', desc: '此問題在物質世界的起始局勢。' },
      { name: '直接阻礙', desc: '像巨石一樣壓在你頭頂，對當前處局造成的牽制。' },
      { name: '潛意識根源', desc: '推動你執著於此事的深層潛意識渴望或夙昔情結。' },
      { name: '過去影響', desc: '最近一個月中已然完成、功成身退的影響力量。' },
      { name: '意識目標', desc: '你自己客觀理智想要獲取的最佳成果。' },
      { name: '即將到來', desc: '未來十天內會出現的前瞻性微調與新局。' },
      { name: '您的能量', desc: '佔卜者在此局中所持有的自信、勇氣或恐懼狀態。' },
      { name: '外界態勢', desc: '同僚、上司、家庭等外部環境對你起到的推動或阻截。' },
      { name: '希望與期盼', desc: '你心坎最怕發生的隱憂、與最貪戀的幸運方向。' },
      { name: '終局答卷', desc: '當所有的能量相互博弈交匯後，靈魂命盤落下的終點。' }
    ]
  }
];

interface Props {
  onStartChat: (readingContext: string) => void;
  onSaveReading: (reading: TarotReading) => void;
}

export default function SpreadReading({ onStartChat, onSaveReading }: Props) {
  const [activeSpread, setActiveSpread] = useState<SpreadConfig>(SPREADS[1]); // Preset as 3-card spread
  const [question, setQuestion] = useState<string>('');
  const [step, setStep] = useState<'config' | 'drawing' | 'interpreting' | 'result'>('config');
  
  // Interactive drawing process
  const [shuffleCount, setShuffleCount] = useState<number>(0);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [drawnItems, setDrawnItems] = useState<CardReadingItem[]>([]);
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<TarotReading | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'cards' | 'advice'>('summary');
  const [highlightedCardIdx, setHighlightedCardIdx] = useState<number | null>(null);

  const startShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
      setShuffleCount(prev => prev + 1);
    }, 1200);
  };

  const handleAutoDraw = () => {
    if (shuffleCount === 0) {
      startShuffle();
      setTimeout(drawAll, 1300);
    } else {
      drawAll();
    }
  };

  const drawAll = () => {
    const rawDraws = drawRandomCards(activeSpread.cardCount);
    const items: CardReadingItem[] = rawDraws.map((d, index) => ({
      card: d.card,
      isReversed: d.isReversed,
      positionName: activeSpread.positions[index].name,
      positionDescription: activeSpread.positions[index].desc
    }));
    setDrawnItems(items);
  };

  const handleRevealCard = (idx: number) => {
    if (!revealedIds.includes(idx)) {
      setRevealedIds(prev => [...prev, idx]);
    }
  };

  const handleRevealAll = () => {
    const allIndices = Array.from({ length: drawnItems.length }, (_, i) => i);
    setRevealedIds(allIndices);
  };

  const triggerAiReading = async () => {
    if (revealedIds.length < drawnItems.length) {
      handleRevealAll();
    }
    setLoading(true);
    setStep('interpreting');

    try {
      const response = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          spreadId: activeSpread.id,
          spreadName: activeSpread.name,
          drawnCards: drawnItems
        })
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const resultData: TarotReading = await response.json();
      setReadingResult(resultData);
      onSaveReading(resultData); // Persist to parent local state
      setStep('result');
      
    } catch (e) {
      console.error(e);
      // Construct reliable offline fallback content
      const fallbackReading: TarotReading = {
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now(),
        question,
        spreadId: activeSpread.id,
        spreadName: activeSpread.name,
        drawnCards: drawnItems,
        interpretation: {
          overallSummary: `【模擬解讀】針對你所問的「${question}」，本番聖三角展示了一幅深刻的心靈能量圖：過往有過深層的考驗，而當下正好站在調整思維的節點，未來只要調和心氣，將重登大成之局。`,
          cardAnalyses: drawnItems.map((c, idx) => ({
            cardId: c.card.id,
            cardName: c.card.name_zh,
            position: c.positionName,
            analysis: `在「${c.positionName}」的位置，顯示出【${c.card.name_zh}】${c.isReversed ? '逆位' : '正位'}。暗示了在這個維度上，特別需要借鑑卡牌的象徵物：愛情上【${c.card.love}】，工作上【${c.card.career}】，以此來指引行動。`
          })),
          advice: "建議平心靜氣，不可與周圍主管或朋友意氣用事，凡事慢下3拍再決定，以柔克剛為最上乘神祕學防線。",
          warning: "小心不要將過往受挫的潛意識陰影投射至當前的工作或愛情，這容易使你落入作繭自縛的循環。",
          prediction: "未來一季度內，事情會隨著你思維框架的轉化與謙卑學習，緩步走向圓滿。願星宿照亮你的足跡。"
        }
      };
      setReadingResult(fallbackReading);
      onSaveReading(fallbackReading);
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const getCtxForChat = () => {
    if (!readingResult) return '';
    return `占卜問題：「${readingResult.question}」
採用的牌陣：「${readingResult.spreadName}」
抽卡結果：\n${readingResult.drawnCards.map((c, i) => ` - 【${c.positionName}】: ${c.card.name_zh} (${c.isReversed ? '逆' : '正'})`).join('\n')}
AI綜合大解密：${readingResult.interpretation.overallSummary}`;
  };

  const resetAll = () => {
    setDrawnItems([]);
    setRevealedIds([]);
    setShuffleCount(0);
    setReadingResult(null);
    setQuestion('');
    setStep('config');
  };

  return (
    <div className="space-y-6">
      
      {/* STEP 1: CONFIGURATION */}
      {step === 'config' && (
        <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-amber-300 font-sans tracking-tight">星月大廳 🌕 啟動靈魂占卜</h3>
            <p className="text-xs text-slate-400">請在心中默念你的提問，並選擇最契合當下情境的塔羅牌陣。</p>
          </div>

          {/* Question Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">第一步：深刻寫下您的具体疑惑</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：『我與心儀對象在未來三個月能走在一起嗎？』或『我下個月更換工作會更豐盛還是會遭遇瓶頸？』"
              className="w-full bg-slate-950 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 h-24 resize-none leading-relaxed"
            />
          </div>

          {/* Spread Selector Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">第二步：選擇占卜牌陣</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {SPREADS.map((spread) => {
                const Icon = spread.icon;
                const isSelected = activeSpread.id === spread.id;
                return (
                  <button
                    key={spread.id}
                    onClick={() => setActiveSpread(spread)}
                    className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between h-36 ${
                      isSelected 
                        ? 'bg-purple-950/40 border-amber-400/80 shadow-lg shadow-purple-950/50' 
                        : 'bg-slate-950/60 border-purple-500/10 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-400/10 text-amber-300' : 'bg-slate-900 text-slate-400'}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{spread.cardCount}張</span>
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>{spread.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">{spread.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Go Next Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep('drawing')}
              disabled={!question.trim()}
              className={`px-8 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                question.trim() 
                  ? 'bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white cursor-pointer shadow-lg shadow-purple-950/40' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              進入神聖抽牌室
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DRAWING INTERACTIVE INTERACTIVE CARDS */}
      {step === 'drawing' && (
        <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-purple-500/10">
            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-purple-950 border border-purple-500/20 rounded text-amber-300 font-bold">牌陣：{activeSpread.name}</span>
              <h3 className="text-sm font-bold text-slate-200 mt-1">問題："{question}"</h3>
            </div>
            <button
              onClick={resetAll}
              className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1"
            >
              修改問題/重新配置
            </button>
          </div>

          {/* Cards Washing Deck Container */}
          <div className="py-8 flex flex-col items-center justify-center space-y-6 bg-slate-950/40 rounded-xl border border-purple-500/5 relative overflow-hidden">
            {/* Shuffling animation cards visualizer */}
            <div className="relative w-44 h-32 flex items-center justify-center">
              {isShuffling ? (
                <div className="absolute space-y-1">
                  <div className="w-20 h-32 bg-slate-900 border border-amber-400 rounded-lg animate-bounce shadow-2xl origin-bottom rotate-[-12deg]" />
                  <div className="w-20 h-32 bg-slate-900 border border-purple-500 rounded-lg animate-pulse absolute top-0 left-4 shadow-xl rotate-[6deg]" />
                </div>
              ) : (
                <div className="flex -space-x-12 cursor-pointer" onClick={startShuffle}>
                  <div className="w-20 h-32 bg-gradient-to-b from-purple-950 to-slate-900 border border-purple-500/30 rounded-lg shadow-xl -rotate-12 transform hover:translate-y-[-10px] transition-transform" />
                  <div className="w-20 h-32 bg-gradient-to-b from-purple-950 to-slate-900 border border-purple-500/30 rounded-lg shadow-xl transform hover:translate-y-[-10px] transition-transform" />
                  <div className="w-20 h-32 bg-gradient-to-b from-purple-950 to-slate-900 border border-purple-500/30 rounded-lg shadow-xl rotate-12 transform hover:translate-y-[-10px] transition-transform" />
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-300">
                {shuffleCount === 0 ? '請點選牌堆進行「洗牌」注入個人能量，或直接進行抽卡。' : `洗牌完成，已成功蓄聚命理周波！`}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startShuffle}
                  disabled={isShuffling}
                  className="bg-purple-900/40 hover:bg-purple-800/40 text-purple-200 text-xs px-4 py-2 rounded-lg border border-purple-500/20 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className={isShuffling ? 'animate-spin' : ''} />
                  手動洗牌
                </button>
                {drawnItems.length === 0 ? (
                  <button
                    onClick={handleAutoDraw}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg transition-all"
                  >
                    抽取卡牌
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Active Drawing Positions List */}
          {drawnItems.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center">已抽取之牌位配置（點擊揭曉）</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {drawnItems.map((item, idx) => {
                  const isRevealed = revealedIds.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleRevealCard(idx)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-between items-center min-h-[160px] cursor-pointer ${
                        isRevealed 
                          ? 'bg-slate-950/80 border-amber-300/30' 
                          : 'bg-gradient-to-b from-purple-950 to-slate-950 border-purple-500/20 hover:border-purple-400/40 shadow-inner'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-purple-400 font-sans leading-tight">
                        {item.positionName}
                      </div>

                      {isRevealed ? (
                        <div className="my-2 text-center">
                          <span className="text-2xl block">🔮</span>
                          <span className="text-xs font-bold text-amber-300 block mt-1">{item.card.name_zh}</span>
                          <span className="text-[9px] text-slate-500 block uppercase font-mono">{item.card.name_en}</span>
                          <span className="text-[8px] bg-purple-950 border border-purple-500/20 px-1 py-0.5 rounded text-purple-300 inline-block mt-1">
                            {item.isReversed ? '逆位' : '正位'}
                          </span>
                        </div>
                      ) : (
                        <div className="my-4 text-slate-400 flex flex-col items-center">
                          <Eye size={20} className="text-purple-500/50 animate-pulse mb-1" />
                          <span className="text-[10px]">點擊揭牌</span>
                        </div>
                      )}

                      <div className="text-[9px] text-slate-500 leading-normal line-clamp-2">
                        {item.positionDescription}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Read Confirmation */}
              <div className="pt-6 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  揭開所有卡牌後，即可向大師請求解碼之光
                </span>
                <div className="flex gap-3">
                  {revealedIds.length < drawnItems.length ? (
                    <button
                      onClick={handleRevealAll}
                      className="text-purple-300 border border-purple-500/20 hover:bg-purple-900/10 text-xs px-4 py-2 rounded-lg"
                    >
                      一鍵快速揭曉
                    </button>
                  ) : null}
                  <button
                    onClick={triggerAiReading}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    召喚 AI 大師進行立體解牌
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* STEP 3: LOADING DYNAMIC AI GENERATION SCREEN */}
      {step === 'interpreting' && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-16 text-center shadow-2xl flex flex-col items-center justify-center space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/10 border-t-amber-400 border-l-amber-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/10 border-b-purple-500 border-r-purple-500 animate-spin [animation-duration:1.5s]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-amber-300 font-sans tracking-wide">AI 占卜師大師正在沉思牌像其義...</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Gemini 3.5-flash 神祕學專家模組正融合這 {drawnItems.length} 張卡牌（正逆位物理相生、牌陣位置、您的具體疑惑）進行宏觀且極具心理深度之綜合解牌。請平心靜氣享用這股啟迪。
            </p>
          </div>
          <div className="px-4 py-2 bg-purple-950/50 border border-purple-500/20 rounded-lg text-purple-300 text-xs animate-pulse">
            「萬事萬物，皆有因果，星辰閃耀，答案將現」
          </div>
        </div>
      )}

      {/* STEP 4: RESULT OVERALL PRESENTATION */}
      {step === 'result' && readingResult && (
        <div className="space-y-6">
          
          {/* Header Dashboard Grid */}
          <div className="bg-slate-900 border-2 border-amber-400/20 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-mono">占卜法旨成功解鎖</span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">我的疑惑: "{readingResult.question}"</h3>
                <p className="text-xs text-slate-400 mt-1">
                  時間: {new Date(readingResult.timestamp).toLocaleString()} | 牌格: {readingResult.spreadName} ({readingResult.drawnCards.length}卡)
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onStartChat(getCtxForChat())}
                  className="bg-purple-950 hover:bg-purple-900 text-amber-300 border border-purple-500/40 text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                >
                  <MessageSquare size={14} />
                  追問 AI 大師
                </button>
                <button
                  onClick={resetAll}
                  className="bg-slate-950 text-slate-300 hover:text-white border border-purple-500/10 text-xs px-4 py-2.5 rounded-lg transition-all"
                >
                  再次占卜
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Drawer Card Layout */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 to-slate-900 border border-purple-500/10 rounded-2xl p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center border-b border-purple-500/10 pb-2">卡牌方位局解透視</h4>
              
              {/* Vertical flex positions list */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {readingResult.drawnCards.map((c, i) => {
                  const isHighlighted = highlightedCardIdx === i;
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHighlightedCardIdx(i)}
                      onMouseLeave={() => setHighlightedCardIdx(null)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isHighlighted 
                          ? 'bg-purple-900/30 border-amber-400/50' 
                          : 'bg-slate-950 border-purple-500/5 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-16 bg-slate-950 rounded border border-amber-400/20 flex flex-col items-center justify-center font-mono font-bold text-xs text-amber-400">
                          <span>🔮</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-purple-400 font-bold">{c.positionName}</span>
                            <span className="text-[9px] bg-slate-900 px-1 border border-purple-500/10 rounded text-slate-400">
                              {c.isReversed ? '逆' : '正'}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-200 mt-1 block">
                            {c.card.name_zh} <span className="text-[10px] text-slate-500 font-mono font-normal">({c.card.name_en})</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs">➔</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-500 leading-normal text-center bg-slate-950 py-2 rounded-lg">
                * 游標懸停在卡片方位上，即可在右側快速高亮其所對應的牌論。
              </div>
            </div>

            {/* Right Report Tabs Detail */}
            <div className="lg:col-span-7 bg-slate-900 border border-purple-500/20 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              
              {/* Tab Navigation header */}
              <div className="flex bg-slate-950 border-b border-purple-500/10">
                <button
                  onClick={() => setActiveResultTab('summary')}
                  className={`flex-1 text-center py-3 text-xs font-bold transition-all border-b-2 ${
                    activeResultTab === 'summary' 
                      ? 'border-amber-400 text-amber-300 bg-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  綜合意象解析
                </button>
                <button
                  onClick={() => setActiveResultTab('cards')}
                  className={`flex-1 text-center py-3 text-xs font-bold transition-all border-b-2 ${
                    activeResultTab === 'cards' 
                      ? 'border-amber-400 text-amber-300 bg-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  多方位卡牌論
                </button>
                <button
                  onClick={() => setActiveResultTab('advice')}
                  className={`flex-1 text-center py-3 text-xs font-bold transition-all border-b-2 ${
                    activeResultTab === 'advice' 
                      ? 'border-amber-400 text-amber-300 bg-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  宇宙指引與提醒
                </button>
              </div>

              {/* Tab Content Box */}
              <div className="p-6 flex-1 space-y-4 max-h-[420px] overflow-y-auto leading-relaxed">
                
                {/* TAB 1: Summary */}
                {activeResultTab === 'summary' && (
                  <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
                    <p className="text-sm font-bold text-amber-300">大師綜合命理斷語：</p>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-purple-500/10 text-slate-200 text-xs leading-loose">
                      {readingResult.interpretation.overallSummary}
                    </div>
                    <div className="p-3 bg-purple-950/20 rounded-lg text-amber-200 border-l-2 border-purple-400">
                      <strong>大師隨記：</strong> 本占局所勾勒的水火風土元素分布顯示你的思維正在試圖打破固有障礙。對未來的疑惑，應重視靈魂深處一瞬的第六直覺。
                    </div>
                  </div>
                )}

                {/* TAB 2: Positions Detail */}
                {activeResultTab === 'cards' && (
                  <div className="space-y-4">
                    {readingResult.interpretation.cardAnalyses.map((analysis, idx) => {
                      const isHighlighted = highlightedCardIdx === idx;
                      return (
                        <div
                          key={idx}
                          id={`card-analysis-${idx}`}
                          className={`p-4 rounded-xl border transition-all duration-300 ${
                            isHighlighted 
                              ? 'bg-purple-900/30 border-amber-400/80 shadow' 
                              : 'bg-slate-950/40 border-purple-500/10'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1 pb-1 border-b border-purple-500/5">
                            <span className="text-purple-400 text-[10px] font-bold">位置「{analysis.position}」</span>
                            <span className="text-amber-300 text-xs font-bold">{analysis.cardName}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 lines-clamp-4 leading-relaxed">
                            {analysis.analysis}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3: Advice and warning */}
                {activeResultTab === 'advice' && (
                  <div className="space-y-4 text-xs">
                    <div className="bg-emerald-950/20 border-l-4 border-emerald-400 p-4 rounded-r-xl">
                      <span className="text-emerald-300 font-bold block mb-1">💡 積極行動指南</span>
                      <p className="text-slate-300 leading-relaxed">{readingResult.interpretation.advice}</p>
                    </div>

                    <div className="bg-amber-950/20 border-l-4 border-amber-400 p-4 rounded-r-xl">
                      <span className="text-amber-300 font-bold block mb-1">⚠️ 盲點與隱患點化</span>
                      <p className="text-slate-300 leading-relaxed">{readingResult.interpretation.warning}</p>
                    </div>

                    <div className="bg-blue-950/20 border-l-4 border-blue-400 p-4 rounded-r-xl">
                      <span className="text-blue-300 font-bold block mb-1">🏹 命理解脫與宇宙祝福</span>
                      <p className="text-slate-300 leading-relaxed">{readingResult.interpretation.prediction}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
