export interface TarotCard {
  id: number;
  name_zh: string;
  name_en: string;
  type: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  keywords_upright: string[];
  keywords_reversed: string[];
  meaning_upright: string;
  meaning_reversed: string;
  love: string;
  career: string;
  finance: string;
  health: string;
}

export interface CardReadingItem {
  card: TarotCard;
  isReversed: boolean;
  positionName: string;
  positionDescription: string;
}

export interface TarotReading {
  id: string;
  timestamp: number;
  question: string;
  spreadId: string;
  spreadName: string;
  drawnCards: CardReadingItem[];
  interpretation: {
    overallSummary: string;
    cardAnalyses: {
      cardId: number;
      cardName: string;
      position: string;
      analysis: string;
    }[];
    advice: string;
    warning: string;
    prediction: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface DailyFortune {
  date: string;
  fortuneScore: number;
  card: TarotCard;
  isReversed: boolean;
  loveScore: number;
  careerScore: number;
  financeScore: number;
  healthScore: number;
  quote: string;
  advice: string;
  luckyColor: string;
  luckyNumber: string;
}
