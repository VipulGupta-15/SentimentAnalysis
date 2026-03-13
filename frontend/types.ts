export interface Sentiment {
  label: 'Positive' | 'Neutral' | 'Negative';
  score: number;
}

export interface Emotion {
  label: string;
  score: number;
}

export interface AnalysisResult {
  sentiment: Sentiment;
  emotion: Emotion;
  userReaction: string[];
}