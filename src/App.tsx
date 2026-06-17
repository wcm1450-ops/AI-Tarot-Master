import React, { useState, useEffect } from 'react';
import DailyFortune from './components/DailyFortune';
import SpreadReading from './components/SpreadReading';
import AiChatbot from './components/AiChatbot';
import CardDatabase from './components/CardDatabase';
import HistoryRecord from './components/HistoryRecord';
import TarotTeacherInteractive from './components/TarotTeacherInteractive';
import { TarotReading } from './types';
import { Sparkles, Calendar, HelpCircle, BookOpen, Clock, Crown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'daily' | 'reading' | 'chatbot' | 'database' | 'history'>('daily');
  const [isVip, setIsVip] = useState<boolean>(true); // Active custom membership switch
  const [historyReadings, setHistoryReadings] = useState<TarotReading[]>([]);
  const [chatContext, setChatContext] = useState<string>(''); // Passes context string to chat session

  // Synchronize history with client-side localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tarot_reading_history');
    if (saved) {
      try {
        setHistoryReadings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history history", e);
      }
    }
  }, []);

  const handleSaveReading = (newReading: TarotReading) => {
    const updated = [newReading, ...historyReadings];
    setHistoryReadings(updated);
    localStorage.setItem('tarot_reading_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (window.confirm("確定要刪除所有本地占卜日記紀錄嗎？此動作無法撤銷。")) {
      setHistoryReadings([]);
      localStorage.removeItem('tarot_reading_history');
    }
  };

  const handleImportReadingToChat = (contextStr: string) => {
    setChatContext(contextStr);
    setActiveTab('chatbot');
  };

  return (
    <div className="min-h-screen bg-[#060714] bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.15)_0%,transparent_60%)] text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* 🌌 High-Fidelity Mystic Top Header */}
      <header className="border-b border-purple-500/15 bg-[#0a0b1c]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-purple-700 to-pink-600 flex items-center justify-center border border-amber-400/20 shadow-lg shadow-purple-900/30">
              <span className="text-xl">🔮</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-slate-100 to-purple-200">
                  AI Tarot Master
                </h1>
                <span className="bg-purple-950/80 border border-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  v1.5 Enterprise
                </span>
              </div>
              <p className="text-[10px] text-purple-300 font-sans tracking-wide">
                智慧塔羅命理學預測平台 (基於 Gemini 3.5-flash 大語言智慧)
              </p>
            </div>
          </div>

          {/* Interactive Membership Control panel and quick credits */}
          <div className="flex items-center gap-3">
            <div className="bg-[#090a16] border border-purple-500/10 rounded-xl p-1.5 px-3 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Crown size={14} className={isVip ? "text-amber-400" : "text-slate-500"} />
                <span className="text-slate-400">會籍切換:</span>
              </div>
              <div className="flex border border-purple-500/10 rounded-lg overflow-hidden p-0.5 bg-slate-950">
                <button
                  onClick={() => setIsVip(false)}
                  className={`text-[10px] px-2.5 py-1 rounded transition-all ${!isVip ? 'bg-purple-900/40 text-purple-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  訪客 VIP 🔐
                </button>
                <button
                  onClick={() => setIsVip(true)}
                  className={`text-[10px] px-2.5 py-1 rounded transition-all ${isVip ? 'bg-amber-400 text-[#060714] font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  尊榮 VIP 💎
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 🧭 Navigation Row Tabs */}
      <div className="bg-[#080918] border-b border-purple-500/5 py-2.5 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 flex gap-2.5">
          {[
            { id: 'daily', name: '每日運勢分析', icon: Calendar },
            { id: 'reading', name: '星月抽牌大廳', icon: HelpCircle },
            { id: 'chatbot', name: '命理大師諮商室', icon: Sparkles },
            { id: 'database', name: '78張占卜百科', icon: BookOpen },
            { id: 'history', name: '宿命占卜日記', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 border ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/30 text-amber-300 border-amber-400/40 shadow-inner' 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-purple-900/10'
                }`}
              >
                <Icon size={14} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌍 Core Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        
        {/* Dynamic component routing based on tabs */}
        <div id="core-tab-view" className="space-y-6">
          
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-purple-500/10 pb-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-amber-300 font-sans tracking-tight">星月神殿 ‧ 命理諮商</h2>
                  <p className="text-xs text-slate-400">與塔羅大師奧利維亞對談或抽取專屬星象運勢</p>
                </div>
                {!isVip && (
                  <span className="text-[10px] bg-amber-400 text-[#060714] font-bold px-2 py-0.5 rounded-full mt-2 md:mt-0 flex items-center gap-1">
                    <Crown size={10} /> 您當前處於訪客試用
                  </span>
                )}
              </div>
              
              {/* Interactive Tarot Teacher Portrait Section */}
              <TarotTeacherInteractive />

              {/* Day's Horoscope Section */}
              <div className="pt-2 border-t border-purple-500/10">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-purple-500 rounded-sm" />
                  今日大漢星斗客製占星盤
                </h3>
                <DailyFortune />
              </div>
            </div>
          )}

          {activeTab === 'reading' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-purple-500/10 pb-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-amber-300 font-sans tracking-tight">星月啟靈占法</h2>
                  <p className="text-xs text-slate-400">洗牌蓄靈，調配5大中西宿命牌陣進行多方位深度解卦</p>
                </div>
                {!isVip && (
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/20 font-bold px-2.5 py-1 rounded inline-block mt-2 md:mt-0">
                    🔒 部分牌陣與無限 AI 解牌為尊榮 VIP 全限開放
                  </span>
                )}
              </div>
              <SpreadReading 
                onStartChat={handleImportReadingToChat} 
                onSaveReading={handleSaveReading} 
              />
            </div>
          )}

          {activeTab === 'chatbot' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-purple-500/10 pb-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-amber-300 font-sans tracking-tight">命理大師追問對話諮商</h2>
                  <p className="text-xs text-slate-400">針尖對麥芒，隨意追尋卡牌逆位的解答或探討靈魂的契機</p>
                </div>
              </div>
              <AiChatbot 
                initialContext={chatContext} 
                onClearContext={() => setChatContext('')} 
              />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-purple-500/10 pb-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-amber-300 font-sans tracking-tight">七十八塔羅百科圖鑑</h2>
                  <p className="text-xs text-slate-400">大牌精神與小牌四元素互補，多維度的愛情、事業與理財義理</p>
                </div>
              </div>
              <CardDatabase />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-purple-500/10 pb-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-amber-300 font-sans tracking-tight">宿命占卜日記歷史館</h2>
                  <p className="text-xs text-slate-400">匯總您所有的個人占卦歷史，印製實物或匯入討論</p>
                </div>
              </div>
              <HistoryRecord 
                readings={historyReadings} 
                onClearHistory={handleClearHistory} 
                onSelectReadingForChat={handleImportReadingToChat} 
              />
            </div>
          )}

        </div>

      </main>

      {/* 🔮 Aesthetic Mystic Footer */}
      <footer className="border-t border-purple-500/10 bg-[#04050d] py-6 text-center text-[10px] text-slate-500 tracking-wide mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-6 space-y-1.5 font-sans">
          <p>© 2026 AI Tarot Master 智慧占卜系統. All Rights Reserved.</p>
          <p className="text-slate-600">
            本平台整合 Gemini 3.5-flash 大語言模型提供高智商心理與命理諮商，解語僅供靈魂成長、決策參考，生活自主權由您完全主導。
          </p>
        </div>
      </footer>
    </div>
  );
}
