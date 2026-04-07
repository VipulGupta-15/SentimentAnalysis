export interface Sentiment {
  label: 'Positive' | 'Neutral' | 'Negative';
  score: number;
}

export interface Emotion {
  label: 'Angry' | 'Disgusted' | 'Fearful' | 'Happy (Joy)' | 'Neutral' | 'Sad' | 'Surprised';
  score: number;
}

export interface AudienceReaction {
  prediction: string;
  growthPercent: number;
  keywords: string[];
}

export interface BrandSafety {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  flags: string[];
}

export interface AnalysisResult {
  sentiment: Sentiment;
  emotion: Emotion;
  audienceReaction: AudienceReaction;
  brandSafety: BrandSafety;
  executiveSummary: string;
  targetPlatform?: string;
  targetDemographic?: string;
}