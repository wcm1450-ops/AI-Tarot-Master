import React, { useState, useEffect } from 'react';
import { drawRandomCards } from '../data/tarotCards';
import { DailyFortune as DailyFortuneType, TarotCard } from '../types';
import { Heart, Briefcase, DollarSign, Activity, Star, Calendar, RefreshCw, Palette, Hash } from 'lucide-react';

function getConstellation(month: number, day: number): string {
  const dates = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  const consts = ["摩羯座", "水瓶座", "雙魚座", "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座"];
  return day < dates[month - 1] ? consts[month - 1] : consts[month % 12];
}

export default function DailyFortune() {
  const [birthday, setBirthday] = useState<string>(() => localStorage.getItem('user_birthday') || '1995-10-10');
  const [constellation, setConstellation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fortune, setFortune] = useState<DailyFortuneType | null>(() => {
    const saved = localStorage.getItem('daily_fortune_item');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure it's for today's date
        const todayStr = new Date().toISOString().split('T')[0];
        if (parsed.date === todayStr) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (birthday) {
      localStorage.setItem('user_birthday', birthday);
      const [, m, d] = birthday.split('-').map(Number);
      if (m && d) {
        setConstellation(getConstellation(m, d));
      }
    }
  }, [birthday]);

  const handleDrawDaily = async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];

    // Draw one random card
    const drawn = drawRandomCards(1)[0];

    try {
      const response = await fetch('/api/tarot/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthday,
          constellation,
          card: drawn.card,
          isReversed: drawn.isReversed
        })
      });

      if (!response.ok) {
        throw new Error('API server failed');
      }

      const resData = await response.json();
      const newFortune: DailyFortuneType = {
        date: todayStr,
        card: drawn.card,
        isReversed: drawn.isReversed,
        fortuneScore: resData.fortuneScore ?? 85,
        loveScore: resData.loveScore ?? 85,
        careerScore: resData.careerScore ?? 85,
        financeScore: resData.financeScore ?? 85,
        healthScore: resData.healthScore ?? 85,
        quote: resData.quote ?? "「靜心而立，星辰將指引迷霧中的去向。」",
        advice: resData.advice ?? "保持和善與放鬆。今日在做關鍵決策時，慢下腳步多思索一刻將化開不必要的糾紛。",
        luckyColor: resData.luckyColor ?? "精靈綠",
        luckyNumber: resData.luckyNumber ?? "7"
      };

      setFortune(newFortune);
      localStorage.setItem('daily_fortune_item', JSON.stringify(newFortune));

    } catch (e) {
      console.error(e);
      // Fast local fallback
      const mockResult: DailyFortuneType = {
        date: todayStr,
        card: drawn.card,
        isReversed: drawn.isReversed,
        fortuneScore: 80,
        loveScore: 78,
        careerScore: 82,
        financeScore: 75,
        healthScore: 85,
        quote: "「順應自然之力，平心靜氣即是坦途。」",
        advice: `今日抽到【${drawn.card.name_zh}】。適合以不爭之心面對瑣事，調和生活呼吸節奏，多傾聽、放慢投資與開銷決策。`,
        luckyColor: "天藍色",
        luckyNumber: "6"
      };
      setFortune(mockResult);
      localStorage.setItem('daily_fortune_item', JSON.stringify(mockResult));
    } finally {
      setLoading(false);
    }
  };

  const scoreBars = fortune ? [
    { name: '綜合能量', score: fortune.fortuneScore, icon: Star, color: 'from-amber-400 to-yellow-500' },
    { name: '愛情甜度', score: fortune.loveScore, icon: Heart, color: 'from-pink-400 to-rose-500' },
    { name: '工作學業', score: fortune.careerScore, icon: Briefcase, color: 'from-blue-400 to-indigo-500' },
    { name: '財運運轉', score: fortune.financeScore, icon: DollarSign, color: 'from-emerald-400 to-teal-500' },
    { name: '身心健康', score: fortune.healthScore, icon: Activity, color: 'from-purple-400 to-violet-500' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Settings Setup */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-purple-300 font-sans mb-4 flex items-center gap-2">
          <Calendar size={16} />
          客製化你的每日星盤占卜
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-auto">
            <label className="block text-xs text-slate-400 mb-1">您的出生年月日</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full md:w-64 bg-slate-950 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs text-slate-400 mb-1">計算出您的星座</label>
            <div className="bg-slate-950 border border-purple-500/20 rounded-lg px-4 py-2 text-sm font-bold text-amber-300">
              {constellation || '輸入生日後自動計算'}
            </div>
          </div>
          <div className="w-full md:w-auto pt-5">
            {!fortune ? (
              <button
                onClick={handleDrawDaily}
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : null}
                開始抽取今日專屬神諭
              </button>
            ) : (
              <button
                onClick={handleDrawDaily}
                disabled={loading}
                className="w-full md:w-auto border border-purple-500/40 hover:bg-purple-900/10 text-purple-300 text-xs px-4 py-2.5 rounded-lg transition-all"
              >
                {loading ? <RefreshCw className="animate-spin" size={12} /> : null}
                重新抽取今日運勢
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/10 border-b-purple-500 animate-spin [animation-duration:1.5s]" />
          </div>
          <div>
            <p className="text-amber-300 font-bold font-sans text-sm mt-2 animate-pulse">正在為您洗牌並洗煉星象...</p>
            <p className="text-xs text-slate-400 mt-1">連結 Gemini 心理導師解鎖今日專屬能量矩陣</p>
          </div>
        </div>
      )}

      {/* Result Display */}
      {fortune && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card Left */}
          <div className="lg:col-span-4 bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-300/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold mb-3">今日神諭卡牌</span>
            
            {/* Mystic Tarot Card Presentation */}
            <div className="relative w-40 h-64 bg-slate-950 rounded-xl border-2 border-amber-400/30 shadow-2xl overflow-hidden flex flex-col justify-between p-3 select-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,31,80,0.4)_0%,transparent_70%)]" />
              {/* Card Title Header */}
              <div className="flex justify-between items-center text-amber-300 font-mono text-[10px] relative z-10">
                <span>ID: {fortune.card.id}</span>
                <span>{fortune.isReversed ? 'REVERSED 逆位' : 'UPRIGHT 正位'}</span>
              </div>
              
              {/* Card Central Visual Placeholder */}
              <div className="flex flex-col items-center justify-center my-4 relative z-10 flex-1">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-purple-900/60 to-pink-900/60 flex items-center justify-center border border-amber-400/20 shadow-inner ${fortune.isReversed ? 'rotate-180' : ''}`}>
                  <span className="text-2xl">🔮</span>
                </div>
                <h4 className="text-lg font-bold text-slate-100 font-sans mt-3">{fortune.card.name_zh}</h4>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono mt-0.5">{fortune.card.name_en}</p>
              </div>

              {/* Card Footer Keywords */}
              <div className="text-center relative z-10">
                <div className="flex flex-wrap justify-center gap-1">
                  {(fortune.isReversed ? fortune.card.keywords_reversed : fortune.card.keywords_upright).slice(0, 3).map((kw, i) => (
                    <span key={i} className="bg-purple-950/80 border border-purple-500/20 text-purple-200 text-[9px] px-1.5 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs text-amber-400 font-bold">
                {fortune.isReversed ? '【逆位】' : '【正位】'}{fortune.card.name_zh}
              </span>
              <p className="text-xs text-slate-400 mt-1 lines-clamp-3 leading-relaxed">
                {fortune.isReversed ? fortune.card.meaning_reversed : fortune.card.meaning_upright}
              </p>
            </div>
          </div>

          {/* Scores & Text Right */}
          <div className="lg:col-span-8 space-y-6">
            {/* Dynamic Card Quote banner */}
            <div className="bg-purple-950/20 border-l-4 border-amber-400 rounded-r-2xl p-4 text-center lg:text-left">
              <p className="text-amber-200 font-bold italic text-sm font-serif">
                {fortune.quote}
              </p>
            </div>

            {/* Scores List */}
            <div className="bg-slate-900 border border-purple-500/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>今日生命能量指標</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {scoreBars.map((bar, i) => {
                  const Icon = bar.icon;
                  return (
                    <div key={i} className="bg-slate-950 rounded-xl p-3 border border-purple-500/5 text-center relative overflow-hidden">
                      <div className="text-slate-400 text-xs flex justify-center items-center gap-1 mb-1">
                        <Icon size={12} className="text-purple-400" />
                        <span>{bar.name}</span>
                      </div>
                      <div className="text-2xl font-black text-amber-300 font-mono">
                        {bar.score}
                      </div>
                      <div className="w-full bg-slate-900 h-1 mt-2 rounded overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${bar.color}`} style={{ width: `${bar.score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advice details and astrology elements */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 bg-slate-900 border border-purple-500/10 rounded-2xl p-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">大師今日心靈啟示</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {fortune.advice}
                </p>
              </div>

              <div className="md:col-span-4 bg-slate-900 border border-purple-500/10 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">幸運開格配件</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-950/60 rounded border border-purple-500/20 text-purple-300">
                        <Palette size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-none">幸運色</span>
                        <span className="text-xs font-bold text-amber-300">{fortune.luckyColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-950/60 rounded border border-purple-500/20 text-purple-300">
                        <Hash size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-none">幸運數字</span>
                        <span className="text-xs font-bold text-amber-300">{fortune.luckyNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-4 leading-normal">
                  * 每日運勢根據天宮經度與流年牌運進行計算，每24小時重置一次。由於時間有限，每人每天宜抽取一次。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
