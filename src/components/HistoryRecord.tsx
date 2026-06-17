import React, { useState } from 'react';
import { TarotReading } from '../types';
import { Search, Calendar, FileText, Trash2, Download, ExternalLink, Printer } from 'lucide-react';

interface Props {
  readings: TarotReading[];
  onClearHistory: () => void;
  onSelectReadingForChat: (contextStr: string) => void;
}

export default function HistoryRecord({ readings, onClearHistory, onSelectReadingForChat }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReading, setSelectedReading] = useState<TarotReading | null>(null);

  const filteredReadings = readings.filter(r => 
    r.question?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.spreadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.drawnCards?.some(c => c.card.name_zh.includes(searchTerm))
  );

  const downloadTxtReport = (reading: TarotReading) => {
    let text = `========================================\n`;
    text += `   AI Tarot Master 專屬宿命占卜報告\n`;
    text += `========================================\n\n`;
    text += `● 占卜時間: ${new Date(reading.timestamp).toLocaleString()}\n`;
    text += `● 占卜問題: "${reading.question}"\n`;
    text += `● 採用牌陣: ${reading.spreadName}\n\n`;
    text += `● 抽卡陣列:\n`;
    reading.drawnCards.forEach((c, idx) => {
      text += `  [位置 ${idx + 1}] ${c.positionName} - ${c.card.name_zh} (${c.isReversed ? '逆位' : '正位'})\n`;
      text += `  - 牌意簡述: ${c.isReversed ? c.card.meaning_reversed : c.card.meaning_upright}\n\n`;
    });
    text += `----------------------------------------\n`;
    text += `大師綜合大解密 (Overall summary):\n`;
    text += `${reading.interpretation.overallSummary}\n\n`;
    text += `大師行動對策 (Core Advice):\n`;
    text += `${reading.interpretation.advice}\n\n`;
    text += `盲點與隱患警示 (Warning):\n`;
    text += `${reading.interpretation.warning}\n\n`;
    text += `宇宙未來祝福 (Prediction):\n`;
    text += `${reading.interpretation.prediction}\n\n`;
    text += `========================================\n`;
    text += `  *本命理檔案由 AI Tarot Master 智慧生成，祝您安康*\n`;

    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Tarot-Report-${reading.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printReport = (reading: TarotReading) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>AI Tarot Master - 占卜報告 #${reading.id}</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            h1 { color: #581c87; border-bottom: 2px solid #e0f2fe; padding-bottom: 15px; }
            .meta { font-size: 0.9em; color: #64748b; margin-bottom: 30px; }
            .card-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 12px; }
            .section-title { font-weight: bold; color: #b45309; margin-top: 25px; font-size: 1.1em; border-left: 4px solid #b45309; padding-left: 10px; }
            .content-block { background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 15px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>AI 塔羅牌預解命理報告書</h1>
          <div class="meta">
            <strong>占卜日期:</strong> ${new Date(reading.timestamp).toLocaleString()}<br/>
            <strong>問卜事由:</strong> "${reading.question}"<br/>
            <strong>套用牌陣:</strong> ${reading.spreadName} (${reading.drawnCards.length}張卡牌)
          </div>

          <h2>1. 方位起課卦解</h2>
          ${reading.drawnCards.map((c, i) => `
            <div class="card-box">
              <strong>${c.positionName} (象徵: ${c.positionDescription})</strong><br/>
              牌名: ${c.card.name_zh} (${c.isReversed ? '逆位 ✗' : '正位 ✓'})<br/>
              基本解悟: ${c.isReversed ? c.card.meaning_reversed : c.card.meaning_upright}
            </div>
          `).join('')}

          <div class="section-title">2. 綜合相機法髓</div>
          <div class="content-block">${reading.interpretation.overallSummary}</div>

          <div class="section-title">3. 積極行動出擊指引</div>
          <p>${reading.interpretation.advice}</p>

          <div class="section-title">4. 當局者盲點點醒</div>
          <p>${reading.interpretation.warning}</p>

          <div class="section-title">5. 宇宙未來昭示與安魂祝福</div>
          <p>${reading.interpretation.prediction}</p>

          <p style="margin-top: 50px; font-size: 0.8em; text-align: center; color: #94a3b8; border-top: 1px solid #cbd5e1; padding-top: 20px;">
            AI Tarot Master 智慧占星術平台 ‧ 預測未來，主導乾坤
          </p>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getCtxStr = (reading: TarotReading) => {
    return `占卜提問:「${reading.question}」\n採用牌陣:「${reading.spreadName}」\n抽卡結果:\n${reading.drawnCards.map(c => ` - 【${c.positionName}】: ${c.card.name_zh} (${c.isReversed ? '逆' : '正'})`).join('\n')}\nAI綜合解密為:${reading.interpretation.overallSummary}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: Chronicles Journal List */}
      <div className="lg:col-span-5 bg-slate-900 border border-purple-500/20 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
              宿命日記歷史庫 ({readings.length})
            </h3>
            {readings.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 size={12} />
                清空日記
              </button>
            )}
          </div>

          <div className="flex gap-2 bg-slate-950 border border-purple-500/10 p-2 rounded-xl">
            <Search className="text-slate-500 self-center ml-1" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋您過去提問過的字詞..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Directory-like reading entries list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredReadings.map((reading) => {
            const isSelected = selectedReading?.id === reading.id;
            return (
              <button
                key={reading.id}
                onClick={() => setSelectedReading(reading)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-purple-950/40 border-amber-400/80 shadow' 
                    : 'bg-slate-950/60 border-purple-500/5 hover:border-purple-500/20'
                }`}
              >
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(reading.timestamp).toLocaleDateString()}
                  </span>
                  <span>{reading.spreadName}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1">"{reading.question}"</h4>
                <div className="text-[10px] text-purple-400 mt-1 truncate">
                  卡牌: {reading.drawnCards.map(c => c.card.name_zh).join('、')}
                </div>
              </button>
            );
          })}

          {filteredReadings.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
              <FileText size={24} className="text-slate-600 animate-pulse" />
              <span>無相干占卜筆記</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Detailed reading record viewer */}
      <div className="lg:col-span-7 bg-slate-900 border border-purple-500/20 rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
        {selectedReading ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Header Toolbar */}
            <div className="flex justify-between items-start pb-4 border-b border-purple-500/10 mb-4">
              <div>
                <span className="text-[10px] text-purple-400 uppercase font-bold font-mono">歷史命理檔案讀取</span>
                <h3 className="text-sm font-bold text-slate-200 mt-0.5">"{selectedReading.question}"</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  牌陣: {selectedReading.spreadName} | 日期: {new Date(selectedReading.timestamp).toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => printReport(selectedReading)}
                  title="列印報告"
                  className="p-1.5 bg-slate-950 text-slate-400 hover:text-amber-300 border border-purple-500/10 rounded-lg transition-all"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={() => downloadTxtReport(selectedReading)}
                  title="匯出純文字"
                  className="p-1.5 bg-slate-950 text-slate-400 hover:text-amber-300 border border-purple-500/10 rounded-lg transition-all"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => onSelectReadingForChat(getCtxStr(selectedReading))}
                  className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-amber-300 text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
                >
                  <ExternalLink size={10} />
                  匯入聊天
                </button>
              </div>
            </div>

            {/* Read Text Blocks Scroll */}
            <div className="flex-1 space-y-4 text-xs pr-1">
              {/* Drawn Cards summaries */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-purple-500/5 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">啟課排位牌象</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {selectedReading.drawnCards.map((c, i) => (
                    <div key={i} className="border-l border-amber-400/30 pl-2 py-0.5">
                      <span className="text-amber-400 block font-bold text-[10px] leading-none mb-0.5">{c.positionName}</span>
                      <span className="text-slate-300">{c.card.name_zh} ({c.isReversed ? '逆' : '正'})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed answers */}
              <div className="space-y-3 font-sans leading-relaxed text-slate-300">
                <div>
                  <h5 className="font-bold text-purple-300 text-xs mb-1">大師整體相卦剖析:</h5>
                  <p className="bg-slate-950/40 border border-purple-500/5 p-3 rounded-lg leading-loose">{selectedReading.interpretation.overallSummary}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] items-start">
                  <div className="bg-emerald-950/10 border-l-2 border-emerald-400 p-2.5 rounded-r">
                    <span className="text-emerald-300 font-bold block mb-1">💡 積極出擊引導</span>
                    <p className="text-slate-400 leading-normal">{selectedReading.interpretation.advice}</p>
                  </div>
                  <div className="bg-amber-950/10 border-l-2 border-amber-400 p-2.5 rounded-r">
                    <span className="text-amber-300 font-bold block mb-1">⚠️ 盲區防範警示</span>
                    <p className="text-slate-400 leading-normal">{selectedReading.interpretation.warning}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-blue-300 text-xs mb-1">短期走向與祝福:</h5>
                  <p className="bg-slate-950/20 p-2.5 rounded text-[11px] font-serif leading-relaxed text-slate-300 italic border border-purple-500/5">{selectedReading.interpretation.prediction}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-slate-500">
            <FileText size={36} className="text-purple-500/20 mb-3" />
            <p className="text-xs">
              在左側日記簿中挑選一份過往的占卜歷程，即可在此重現其各牌義對策、印製專業紙本占卦文書，或一秒導回主神大廳與 AI 大師進行實時跟進討論。
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
