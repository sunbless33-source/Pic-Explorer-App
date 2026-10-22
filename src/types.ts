export interface SequenceItem {
  name: string;
  symbol: string;
  colorTag?: string;
}

export interface PatternAnalysisResult {
  hasPattern: boolean;
  ruleType: string;
  shortExplanation: string;
  detailedExplanation: string;
  patternUnit: string[];
  sequenceItems: SequenceItem[];
  nextItem?: string;
  nextItemSymbol?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  adviceForRetake: string;
  cheerMessage: string;
}
