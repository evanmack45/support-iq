export interface TranscriptSegment {
  speaker: "Agent" | "Customer";
  text: string;
  sentimentScore: number; // 0 to 10
  timestamp?: string;
}

export interface CoachingInsights {
  strengths: string[];
  missedOpportunities: string[];
  summary: string;
}

export interface AnalysisResult {
  transcript: TranscriptSegment[];
  coaching: CoachingInsights;
  overallEngagementScore: number; // 0 to 100
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
