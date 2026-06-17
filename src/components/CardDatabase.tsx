import React, { useState } from 'react';
import { ALL_CARDS } from '../data/tarotCards';
import { TarotCard } from '../types';
import { Search, Info, RotateCw, Sparkles, Filter } from 'lucide-react';

export default function CardDatabase() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'major' | 'minor' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Filter & Search Logic
  const filteredCards = ALL_CARDS.filter((card) => {
    const matchesSearch = 
      card.name_zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.keywords_upright.some(kw => kw.includes(searchTerm)) ||
      card.keywords_reversed.some(kw => kw.includes(searchTerm));

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'major') return card.type === 'major';
    if (filterType === 'minor') return card.type === 'minor';
    return card.suit === filterType;
  });

  const handleCardClick = (card: TarotCard) => {
    setSelectedCard(card);
    setIsFlipped(false); // Reset flip state when card changes
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: Complete Encyclopedia Catalog (78 Cards Grid) */}
      <div className="lg:col-span-7 bg-slate-900 border border-purple-500/20 rounded-2xl p-5 shadow-xl flex flex-col h-[580px]">
        <div className="space-y-4 mb-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <span>78張中西雙語塔羅奧秘百科</span>
          </h3>

          {/* Quick Search Panel */}
          <div className="flex gap-2 bg-slate-950 border border-purple-500/10 p-2 rounded-xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="text-slate-500" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋牌名、關鍵字 (例如：愚者、豐收...)"
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-xs text-purple-400 hover:text-purple-300 pr-2">
                清空
              </button>
            )}
          </div>

          {/* Filter Categories Row */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', name: '全套78張' },
              { id: 'major', name: '大阿爾克那(22)' },
              { id: 'minor', name: '小阿爾克那(56)' },
              { id: 'wands', name: '權杖(火)' },
              { id: 'cups', name: '聖杯(水)' },
              { id: 'swords', name: '寶劍(風)' },
              { id: 'pentacles', name: '錢幣(土)' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id as any)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-all whitespace-nowrap border shrink-0 ${
                  filterType === filter.id 
                    ? 'bg-purple-950 border-purple-400/60 text-amber-300' 
                    : 'bg-slate-950/60 border-purple-500/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {filteredCards.map((card) => {
            const isSelected = selectedCard?.id === card.id;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-24 ${
                  isSelected 
                    ? 'bg-purple-950/40 border-amber-400/80 shadow shadow-purple-950' 
                    : 'bg-slate-950/60 border-purple-500/5 hover:border-purple-500/20'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-[9px] font-mono text-slate-500 font-bold">#{card.id}</span>
                  <span className={`text-[8px] px-1 rounded uppercase ${card.type === 'major' ? 'bg-amber-950 border border-amber-400/20 text-amber-400' : 'bg-slate-950 border border-purple-500/5 text-slate-400'}`}>
                    {card.type === 'major' ? '大牌' : '小牌'}
                  </span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-none ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>{card.name_zh}</h4>
                  <p className="text-[9px] text-slate-500 mt-1 truncate max-w-full font-mono">{card.name_en}</p>
                </div>
              </button>
            );
          })}
          {filteredCards.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-500">
              未能尋得符合您的關鍵卡牌。
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: 3D Flip Card Detail Render */}
      <div className="lg:col-span-5 bg-slate-900 border border-purple-500/20 rounded-2xl p-5 shadow-xl flex flex-col h-[580px]">
        {selectedCard ? (
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin">
            
            {/* Immersive interactive card flip stage */}
            <div className="flex flex-col items-center py-4 shrink-0">
              
              {/* CSS Perspective Wrapper for 3D flip */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: '1000px' }}
                className="w-36 h-56 cursor-pointer relative"
              >
                <div 
                  style={{ 
                    transformStyle: 'preserve-3d', 
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                    transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  className="w-full h-full relative"
                >
                  {/* CARD BACK */}
                  <div 
                    style={{ backfaceVisibility: 'hidden' }}
                    className="absolute inset-0 bg-gradient-to-br from-[#120e29] to-[#3b1f50] rounded-xl border-2 border-amber-300/40 p-3 flex flex-col items-center justify-between shadow-2xl"
                  >
                    <div className="border border-purple-500/20 w-full h-full rounded flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(59,31,80,0.6)_0%,transparent_80%)]">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full border border-amber-400/25 flex items-center justify-center text-xl text-amber-300/40 animate-pulse">
                          ✨
                        </div>
                        <span className="text-[8px] text-purple-400/60 block mt-2 font-serif font-bold uppercase tracking-widest">Tarot Master</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD FRONT */}
                  <div 
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    className="absolute inset-0 bg-slate-950 rounded-xl border-2 border-amber-400/30 p-3 flex flex-col justify-between shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,31,80,0.3)_0%,transparent_70%)]" />
                    
                    <div className="flex justify-between items-center text-amber-300 text-[8px] font-mono relative z-10">
                      <span>NO.{selectedCard.id}</span>
                      <span className="capitalize">{selectedCard.suit || '大牌'}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center my-3 relative z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-800 to-pink-800 flex items-center justify-center border border-amber-400/20 shadow-inner">
                        <span className="text-xl">🔮</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 font-sans mt-2.5">{selectedCard.name_zh}</h4>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">{selectedCard.name_en}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 relative z-10">
                      {selectedCard.keywords_upright.slice(0, 2).map((kw, i) => (
                        <span key={i} className="bg-purple-950 border border-purple-500/20 text-purple-300 text-[8px] px-1.5 py-0.5 rounded leading-none">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="mt-3 text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                <RotateCw size={10} />
                點擊 180° 翻轉卡牌 (當前狀態: {isFlipped ? '正面' : '背面'})
              </button>
            </div>

            {/* Text Information Panel */}
            <div className="flex-1 space-y-4">
              <div className="border-b border-purple-500/10 pb-2">
                <h4 className="text-sm font-bold text-amber-300">{selectedCard.name_zh} ({selectedCard.name_en})</h4>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <div className="text-[10px] text-slate-400">
                    類型: <span className="text-slate-200 capitalize font-medium">{selectedCard.type === 'major' ? '大阿爾克那' : '小阿爾克那'}</span>
                  </div>
                  {selectedCard.suit && (
                    <div className="text-[10px] text-slate-400">
                      元素組: <span className="text-slate-200 capitalize font-medium">{selectedCard.suit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords block */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-purple-500/5">
                <div>
                  <span className="text-emerald-400 font-bold block mb-1">✓ 正位關鍵字</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedCard.keywords_upright.join('、')}</p>
                </div>
                <div>
                  <span className="text-amber-400 font-bold block mb-1">✗ 逆位關鍵字</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedCard.keywords_reversed.join('、')}</p>
                </div>
              </div>

              {/* Meaning detail */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">牌義概論</span>
                  <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-purple-500/5">
                    {isFlipped ? selectedCard.meaning_reversed : selectedCard.meaning_upright}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">四大命相專屬解釋</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/30 border border-purple-500/5 p-2 rounded">
                      <span className="text-pink-400 block font-bold leading-tight mb-1 text-[10px]">❤️ 愛情關係</span>
                      <p className="text-slate-400 text-[10px] leading-normal">{selectedCard.love}</p>
                    </div>
                    <div className="bg-slate-950/30 border border-purple-500/5 p-2 rounded">
                      <span className="text-blue-400 block font-bold leading-tight mb-1 text-[10px]">💼 工作事業</span>
                      <p className="text-slate-400 text-[10px] leading-normal">{selectedCard.career}</p>
                    </div>
                    <div className="bg-slate-950/30 border border-purple-500/5 p-2 rounded">
                      <span className="text-emerald-400 block font-bold leading-tight mb-1 text-[10px]">💰 財富理財</span>
                      <p className="text-slate-400 text-[10px] leading-normal">{selectedCard.finance}</p>
                    </div>
                    <div className="bg-slate-950/30 border border-purple-500/5 p-2 rounded">
                      <span className="text-purple-400 block font-bold leading-tight mb-1 text-[10px]">🍵 養生健康</span>
                      <p className="text-slate-400 text-[10px] leading-normal">{selectedCard.health}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-slate-500">
            <Info size={36} className="text-purple-500/40 mb-3 animate-bounce" />
            <p className="text-xs">
              在左側名冊中點選任何一張欲參透的塔羅卡牌，即可在右側開啟 3D 立體研義視窗，探索關於愛情、工作、財運及逆位的完整秘密。
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
