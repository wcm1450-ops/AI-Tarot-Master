import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Google Gen AI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("⚠️ GEMINI_API_KEY lies unset or configured as default placeholder.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 🩺 API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
  });
});

// 🔮 ROUTE 1: AI Tarot Card Spread Interpretation
app.post("/api/tarot/reading", async (req, res) => {
  const { question, spreadId, spreadName, drawnCards } = req.body;

  if (!question || !drawnCards || !Array.isArray(drawnCards)) {
    return res.status(400).json({ error: "Missing required core parameters: question, drawnCards." });
  }

  const ai = getGenAI();

  if (!ai) {
    // ⚠️ Fallback Mock Generator to provide seamless, high-fidelity experience without crashing when API key is unconfigured
    console.log("Using High-Fidelity simulated reading engine (No API Key detected)...");
    const simulatedResponse = generateSimulatedReading(question, spreadName, drawnCards);
    return res.json({
      ...simulatedResponse,
      isSimulated: true,
      message: "正在使用本地神秘學模擬解碼。欲啟用 Gemini AI 專業版，請在右上角 Settings > Secrets 填入您的 GEMINI_API_KEY！"
    });
  }

  try {
    // Prepare detailed prompt for Gemini 3.5 Flash
    const cardsDescription = drawnCards.map((c, i) => {
      const positionInfo = c.positionName ? `位置「${c.positionName}」（象徵：${c.positionDescription}）` : `第 ${i + 1} 張牌`;
      const direction = c.isReversed ? "逆位" : "正位";
      const keywords = c.isReversed ? c.card.keywords_reversed.join("、") : c.card.keywords_upright.join("、");
      return `- ${positionInfo}: 牌名為【${c.card.name_zh} (${c.card.name_en})】${direction}，卡牌關聯關鍵字為「${keywords}」，基本牌義描述為「${c.isReversed ? c.card.meaning_reversed : c.card.meaning_upright}」。在感情/工作/財運上的基本解釋為：感情【${c.card.love}】，工作【${c.card.career}】，財富【${c.card.finance}】。`;
    }).join("\n");

    const prompt = `你是一位擁有30年執業經驗、兼具神祕學深厚底蘊與心理諮商碩士背景的頂級塔羅占卜大師。
請針對以下使用者的提問、採用的牌陣，以及抽出的卡牌進行極其深度、精準、充滿溫暖同理但也直面盲點的專業解牌。

【占卜者的具體提問】：
"${question}"

【採用的塔羅牌陣】：
"${spreadName}" (牌陣代號: ${spreadId})

【抽出的卡牌詳細資料】：
${cardsDescription}

請遵守以下【解牌心法與邏輯規則】：
1. 深入結合牌位所隱含的情境（過去、現在、未來、挑戰等）來解鎖每張牌對於使用者問題的針對性啟示，而不是死板地照抄牌義。
2. 考量正逆位影響，逆位通常代表能量受阻、過度發揮、往內省思，或是需要警惕的盲區。
3. 為使用者撰寫一段字字珠璣的【整體解讀摘要 (overallSummary)】。
4. 提供每張牌的【獨立位置深入剖析 (cardAnalyses)】。
5. 給出務實、具備建設性的【積極行動建議 (advice)】。
6. 細心點出潛在的【隱患與盲點提醒 (warning)】。
7. 給出關於本局發展的【未來走勢預測與宇宙祝福 (prediction)】。

請嚴格以下列 JSON 結構格式返回。請勿附帶任何 markdown 標記（如 \`\`\`json ），僅輸出純淨的可解析 JSON 字串：`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: {
              type: Type.STRING,
              description: "對本次塔羅占卜問題與牌陣卡牌的整體綜合分析摘要，字數在150-250字之間。"
            },
            cardAnalyses: {
              type: Type.ARRAY,
              description: "每張抽中卡牌在特定牌位上的詳細解析。",
              items: {
                type: Type.OBJECT,
                properties: {
                  cardId: { type: Type.INTEGER, description: "卡牌 ID" },
                  cardName: { type: Type.STRING, description: "卡牌名稱" },
                  position: { type: Type.STRING, description: "牌陣位置名稱" },
                  analysis: { type: Type.STRING, description: "該牌在此位置上的專屬深入解读，分析其正逆位如何影響使用者的遭遇，字數在100-200字之間。" }
                },
                required: ["cardId", "cardName", "position", "analysis"]
              }
            },
            advice: {
              type: Type.STRING,
              description: "給予占卜者的積極行動、調適心態或解憂建議，字數在80-150字之間。"
            },
            warning: {
              type: Type.STRING,
              description: "指出占卜者當前的盲點、過度執著之處，或需要防範的潛在風險，字數在80-150字之間。"
            },
            prediction: {
              type: Type.STRING,
              description: "針對這個局面的短期未來預言與充滿神性溫度的宇宙祝福，字數在80-150字之間。"
            }
          },
          required: ["overallSummary", "cardAnalyses", "advice", "warning", "prediction"]
        }
      }
    });

    const textOutput = response.text || "";
    const parsedResult = JSON.parse(textOutput.trim());
    return res.json({
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      question,
      spreadId,
      spreadName,
      drawnCards,
      interpretation: parsedResult,
      isSimulated: false,
    });

  } catch (error) {
    console.error("Gemini Tarot Reading Error:", error);
    return res.status(500).json({
      error: "AI 牌義生成失敗，可能是 API 連線限制。已啟用模擬機制以保障體驗。",
      fallback: true,
      data: generateSimulatedReading(question, spreadName, drawnCards)
    });
  }
});

// 💬 ROUTE 2: Continuous Interactive Tarot Chatbot
app.post("/api/tarot/chat", async (req, res) => {
  const { history, message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing follow-up message argument" });
  }

  const ai = getGenAI();

  if (!ai) {
    // Return high quality mock conversational response simulating a wise Tarot reader
    const mockReply = generateSimulatedChatResponse(message, context);
    return res.json({
      reply: mockReply,
      isSimulated: true
    });
  }

  try {
    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Add initial instruction and general context about previous spread
    const systemInstruction = `你是一位三十年資歷的智者型、溫和同理的塔羅牌占卜師。
使用者先前進行了一次占卜，占卜背景與詳細抽牌結果如下：
---
${context || "目前無先前占卜歷史，請直接解答使用者的神祕學、塔羅牌通用詢問。"}
---
請根據使用者的跟進提問、追問或心靈苦悶，進行耐心詳實的命理解析。
答語請維持溫暖、高雅、蘊含哲理且字字珠璣的口吻，字數控制在100-300字之間。請用繁體中文回答。`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message: message });
    return res.json({
      reply: response.text,
      isSimulated: false,
    });

  } catch (error) {
    console.error("Gemini Tarot Chat Error:", error);
    return res.status(500).json({
      error: "AI 聊天回覆失敗，已啟動預設神祕學回應。",
      reply: "（占卜師輕撫牌面，溫柔地看著你）命運之輪此時正微微顫動，星辰的低語提示著我們需要靜心思考。你剛才所提的事情，其本質正是我一直想提醒你的——不要急於尋求立竿見影的終點。請試著閉上雙眼深呼吸三次，再次回到剛才抽出的牌卡意境中，你會發現靈魂的解答本就潛藏在你的直覺深處。你願意多聊聊你在此刻內心最直觀的感受嗎？",
      isSimulated: true
    });
  }
});

// ☀️ ROUTE 3: Daily Fortune Generator
app.post("/api/tarot/daily", async (req, res) => {
  const { birthday, constellation, card, isReversed } = req.body;

  if (!card) {
    return res.status(400).json({ error: "Missing daily drawn tarot card metadata." });
  }

  const ai = getGenAI();

  const mockScores = {
    fortuneScore: Math.floor(Math.random() * 30) + (isReversed ? 55 : 70),
    loveScore: Math.floor(Math.random() * 30) + (isReversed ? 50 : 70),
    careerScore: Math.floor(Math.random() * 30) + (isReversed ? 55 : 68),
    financeScore: Math.floor(Math.random() * 30) + (isReversed ? 48 : 72),
    healthScore: Math.floor(Math.random() * 30) + (isReversed ? 60 : 75),
    luckyColor: ["秘境紫", "古雅金", "月光銀", "曜石黑", "琥珀橙", "翡翠綠", "珊瑚紅", "藏青藍"][Math.floor(Math.random() * 8)],
    luckyNumber: Math.floor(Math.random() * 10).toString()
  };

  if (!ai) {
    return res.json({
      ...mockScores,
      quote: isReversed ? "「每一次逆風，都是命運在考驗我們收斂鋒芒的智慧。」" : "「光能照耀之處，繁花將隨你的信心盛開。」",
      advice: isReversed 
        ? `今日抽中逆位的【${card.name_zh}】。建議今天採取低調保守守勢，放慢生活的鼓點，不宜草率開拓大型新局，把精力留在向內心復盤與修正細節中。` 
        : `今日迎來正位的【${card.name_zh}】。今日是充滿活力與靈性高光的一天！勇敢展現你的個人抱負，在多方溝通中主動出擊，幸運女神正對你展顏歡笑。`,
      isSimulated: true
    });
  }

  try {
    const prompt = `你是一位占星大師兼心靈療癒導師。
有一位星座為「${constellation || "未知神秘星座"}」，出生於「${birthday || "未知日期"}」的使用者，今日抽到的每日運勢牌為【${card.name_zh} (${card.name_en})】${isReversed ? "逆位" : "正位"}。
這張卡牌的基本關鍵字為「${isReversed ? card.keywords_reversed.join("、") : card.keywords_upright.join("、")}」。

請為他客製化生成今日運勢詳解，字數保持在精煉的100-150字之間，並返回為以下的 JSON 結構，不要包含任何 markdown 區塊修飾：`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fortuneScore: { type: Type.INTEGER, description: "今日綜合運勢總分 (1-100)" },
            loveScore: { type: Type.INTEGER, description: "今日愛情運勢分數 (1-100)" },
            careerScore: { type: Type.INTEGER, description: "今日工作學業運勢分數 (1-100)" },
            financeScore: { type: Type.INTEGER, description: "今日財富投資運勢分數 (1-100)" },
            healthScore: { type: Type.INTEGER, description: "今日身心健康運勢分數 (1-100)" },
            quote: { type: Type.STRING, description: "今日專屬心靈啟迪金句句型，如「『...』」高雅且富有哲理，字數小於40字。" },
            advice: { type: Type.STRING, description: "結合此星座與今日卡牌，給予最具體的今日行動叮嚀與避坑指南，字數在80-120字之間。" },
            luckyColor: { type: Type.STRING, description: "今日最能補足氣場的神秘學幸運色 (如：秘境紫、水晶粉、翡翠綠等)" },
            luckyNumber: { type: Type.STRING, description: "今日單個幸運數字 (0-9)" }
          },
          required: ["fortuneScore", "loveScore", "careerScore", "financeScore", "healthScore", "quote", "advice", "luckyColor", "luckyNumber"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      ...parsedResult,
      isSimulated: false
    });

  } catch (error) {
    console.error("Gemini Daily Fortune Error:", error);
    return res.json({
      ...mockScores,
      quote: "「順應天時而動，心安即是通達。」",
      advice: `在今日命盤中，【${card.name_zh}】的力量正緩緩注入您的星座領域。本卡牌的關鍵啟示在於注重能量的平衡，愛情與人際交往中宜傾聽，財務方面宜穩守退思。`,
      isSimulated: true
    });
  }
});

// 🔮 Fallback High-Fidelity Simulated Reading Builder
function generateSimulatedReading(question: string, spreadName: string, drawnCards: any[]) {
  const summaryPrefix = `方針針對你詢問的「${question}」，使用「${spreadName || "隨機"}」排演。抽出的牌：${drawnCards.map(c => `【${c.card.name_zh}(${c.isReversed ? '逆' : '正'})】`).join('、')}。`;
  
  const cardAnalyses = drawnCards.map((c, idx) => {
    const directionStr = c.isReversed ? "逆位" : "正位";
    const keywords = c.isReversed ? c.card.keywords_reversed : c.card.keywords_upright;
    
    let positionalInsight = "";
    if (c.positionName === "過去") {
      positionalInsight = `代表先前此事的根基與既成事实。${c.card.name_zh}顯現於此，說明過往有過關於${keywords[0]}的強烈印記，正默默引導今日的局勢。`;
    } else if (c.positionName === "現在") {
      positionalInsight = `映射占卜者當下面臨的心境與核心能量抗衡。${c.card.name_zh}代表著${keywords[0]}或對${keywords[1]}的探索，這正是你當前方寸大亂或倍感鼓舞的主因。`;
    } else if (c.positionName === "未來") {
      positionalInsight = `勾勒順應當下局勢的預期落點與自然反饋。${c.card.name_zh}指引了一條${keywords[0]}的道路，只要你留心克制逆位的弱點，將迎來美妙的成果。`;
    } else {
      positionalInsight = `在「${c.positionName || "未知牌位"}」中，${c.card.name_zh}${directionStr}象徵著對「${keywords.slice(0, 3).join('、')}」的啟迪，暗示該維度的局勢是本局的核心節點。`;
    }

    return {
      cardId: c.card.id,
      cardName: c.card.name_zh,
      position: c.positionName || `第 ${idx + 1} 牌位`,
      analysis: `${positionalInsight} 建議從中感知關於【${c.card.name_zh}】所代表的智慧：${c.isReversed ? c.card.meaning_reversed : c.card.meaning_upright}`
    };
  });

  return {
    overallSummary: `${summaryPrefix}本局展現了動靜相調的深刻卦象。各卡牌正逆位比例呼應了您當前靈魂深處對此問題的疑惑。它點明：您正站在一個新舊能量更迭、需要主動抉擇的十字路口。`,
    cardAnalyses,
    advice: "建議平心靜氣，多安排20分鐘的冥想或寫日記。在感情或待人接物上採取「以柔克剛」的溫良策略；在事業/策略上，不宜與周圍人硬碰硬，關注自我專業實力的精進。",
    warning: "一定要防範因盲目急躁、偏聽他人風言風語而做出的衝動决策。留意不要將過往的情感陰影帶入當下的問題，這會導致你選擇性逃避現實。",
    prediction: "未來一季度内，局勢會隨著你心態的擺正而緩步升溫。黑夜之後必有破曉，你將在大功告成之時，慶幸自己今日所做的忍耐與佈局。願星辰與你同在！"
  };
}

// 🔮 Fallback High-Fidelity Converational Chat Builder
function generateSimulatedChatResponse(message: string, context: string): string {
  const normalizedMsg = message.toLowerCase();
  
  if (normalizedMsg.includes("建議") || normalizedMsg.includes("怎麼做") || normalizedMsg.includes("如何")) {
    return "針對你尋求的實質方向（占卜師緩緩洗下一張牌）：核心智慧在於「內功內省」。剛才卡牌裡的訊息已然指明，外界的風浪只是鏡子的投影。我建議你，在接下來的七天內，先不要對這件事做出任何不可逆的決定。每天清晨寫下你腦袋裡的三個直覺想法，你会漸漸發現一條通往澄澈的平坦道路。";
  }
  
  if (normalizedMsg.includes("愛情") || normalizedMsg.includes("感情") || normalizedMsg.includes("他")) {
    return "（占卜師點亮一盞神秘香氛蠟燭）感情的事，最忌諱在不安時盲目試探。之前的卡牌透露出你當前跟對方的心靈頻率有些許偏差。別去追問『他到底愛不愛我』，先調整你的靈魂頻率，將注意力移回讓自己豐盛喜悅的事物。當你光芒萬丈時，關係的和諧與真誠自然不請自來。";
  }

  if (normalizedMsg.includes("工作") || normalizedMsg.includes("創業") || normalizedMsg.includes("錢") || normalizedMsg.includes("財")) {
    return "在事業和物質財富上，目前的卦象並非死胡同，而是一個重要的「整頓與休整站」。不要急著開源，而是先做好防守與細節修煉。如果是合約或者資金周轉的事，務必找專業人士核對條款。此時沉得住氣、展現匠人精神，才是在風浪中建立千載難富基業的穩固秘訣。";
  }

  return `收到你的溫馨回饋。關於你提到的「${message}」，這與剛才我們抽中的牌義產生了奇妙的和諧共鳴。在塔羅的世界裡，問題的出現本就是靈魂開始探索轉移的象徵。不用害怕當下的迷茫，放鬆你的雙肩，把手放在心房，感受那股自帶的直覺力量。你覺得之前牌義中哪一個詞彙最讓你內心為之一顫呢？我們可以以此再深入探討。`;
}

// 📦 Integrate Vite Middleware for Client-Side in Development & Host Static Content in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA Fallback for client routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔮 AI Tarot Master Backend Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
