import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { MessageSquare, RefreshCw, Send, Sparkles, User, LogIn, ChevronRight } from 'lucide-react';

interface Props {
  initialContext: string;
  onClearContext: () => void;
}

export default function AiChatbot({ initialContext, onClearContext }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: '（占卜大師向你微笑示意，撥散了桌前的迷霧）\n「遠道而來的探索者，歡迎光臨。我已備好清宣紙茶與命理明鏡。\n\n命運之輪此時正徐徐擺動，不論周遭大霧有多濃、心中的結何其多，請敞開心扉。你可以直接在下方提出任何生活困惑、神秘學話題，或是針對你剛才抽牌面解讀的具體細節向我追問剖析。」',
        timestamp: Date.now()
      }
    ];
  });
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Inject initial contextual notification when context passes from parent
  useEffect(() => {
    if (initialContext) {
      const systemNofif: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: 'assistant',
        text: `🔮 【靈力連接完成：已成功導入您當前的卡牌與問題主線】\n大師也已將您的疑惑銘記於胸。您可以直接對我說：「那逆位牌究竟暗示了什麼？」、「工作中我適合什麼時候做決定呢？」等具體延伸話題囉。`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, systemNofif]);
    }
  }, [initialContext]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/tarot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: initialContext,
          history: messages.filter(m => m.id !== 'welcome' && !m.text.startsWith('🔮 【靈力連接'))
        })
      });

      if (!response.ok) {
        throw new Error('Chat API returned error');
      }

      const resData = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        text: resData.reply,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (e) {
      console.error(e);
      // Friendly fallback message to maintain immersive state
      const fallbackMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        text: '（占卜師面露溫柔，輕輕拂拭牌面）目前的星象震盪略高，致使隔空語音對話產生些許能量阻隔。但我聽到了你發自內心的呼召，建議你在接下來的幾天內，聚焦當下的心靈平和，不用急躁。保持深長深呼吸，等待群星重新定位，能量的答案自然會向你彰顯。',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { title: '深入感情發展', text: '請大師幫我深談感情關係中的潛在契機' },
    { title: '解密職涯瓶頸', text: '這手牌指出我在工作轉型上有甚麼急需提防的死胡同嗎？' },
    { title: '如何調適盲點', text: '請問面對剛才指出需要注意的隱患，我的心態要怎麼落實調適？' }
  ];

  return (
    <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-3 border-b border-purple-500/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest leading-none">靈性對話諮詢室</h3>
            {initialContext ? (
              <span className="text-[10px] text-amber-300 block mt-1">✓ 已匯入卡牌上下文關係</span>
            ) : (
              <span className="text-[10px] text-slate-500 block mt-1">無導入牌格（提供通用塔羅與人生釋疑）</span>
            )}
          </div>
        </div>
        {initialContext && (
          <button
            onClick={onClearContext}
            className="text-[10px] text-purple-400 hover:text-purple-300"
          >
            清除卡牌連結
          </button>
        )}
      </div>

      {/* Message History Scroller */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 text-xs scrollbar-thin flex flex-col"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse self-end max-w-[85%]' : 'self-start max-w-[85%]'}`}
            >
              {/* Avatar Icon */}
              <div className={`p-1.5 rounded-lg shrink-0 ${
                isUser 
                  ? 'bg-gradient-to-tr from-pink-600 to-rose-600 text-white' 
                  : 'bg-purple-950 border border-purple-500/20 text-purple-300'
              }`}>
                {isUser ? <User size={13} /> : <Sparkles size={11} />}
              </div>

              {/* Message Bubble box */}
              <div className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                isUser 
                  ? 'bg-purple-700/80 text-white rounded-tr-none border border-purple-500/10 shadow-sm' 
                  : 'bg-slate-950/80 text-slate-200 rounded-tl-none border border-purple-500/5'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-2.5 self-start max-w-[80%]">
            <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-500/20 text-purple-300 animate-pulse">
              <RefreshCw className="animate-spin" size={11} />
            </div>
            <div className="p-3 bg-slate-950/40 border border-purple-500/5 rounded-2xl rounded-tl-none text-slate-200 flex items-center gap-1">
              <span className="text-amber-400 font-medium tracking-wider animate-pulse">大師細思神案中...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Input Shortcuts */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 shrink-0 max-w-full">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp.text)}
            disabled={loading}
            className="flex items-center gap-1 bg-slate-950/60 hover:bg-purple-950/40 text-[10px] text-purple-300 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-purple-500/10 transition-all shrink-0 whitespace-nowrap"
          >
            {qp.title}
            <ChevronRight size={10} />
          </button>
        ))}
      </div>

      {/* Input controls form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex gap-2 mt-1 shrink-0 bg-slate-950 border border-purple-500/10 p-2 rounded-xl"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="向大師詳細描述您的後續追問 (例如：愛情發展、工作轉型細節...)"
          disabled={loading}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-600 focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className={`p-2 rounded-lg transition-all ${
            inputText.trim() && !loading
              ? 'bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white cursor-pointer'
              : 'bg-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send size={12} />
        </button>
      </form>

    </div>
  );
}
