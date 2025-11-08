export type Sender = 'user' | 'ai';

export enum Emotion {
  // Existing
  Joy = 'Joy',
  Sadness = 'Sadness',
  Anger = 'Anger',
  Fear = 'Fear',
  Anxiety = 'Anxiety',
  Optimism = 'Optimism',
  Calm = 'Calm',
  Stress = 'Stress',
  Neutral = 'Neutral',
  // New from GoEmotions
  Amusement = 'Amusement',
  Gratitude = 'Gratitude',
  Love = 'Love',
  Surprise = 'Surprise',
  Confusion = 'Confusion',
  Curiosity = 'Curiosity',
  Disappointment = 'Disappointment',
  Excitement = 'Excitement',
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  emotion?: Emotion;
  timestamp: Date;
  reaction?: Emotion;
}

export interface MoodEntry {
  id:string;
  timestamp: Date;
  emotion: Emotion;
  summary: string;
}

export interface CustomMapping {
  id: string;
  keyword: string;
  emotion: Emotion;
}

export type View = 'chat' | 'dashboard' | 'toolkit';

export interface MoodBalancerResult {
  detected_emotion: string;
  emotion_intensity: string;
  suggested_voice_tone: string;
  short_story_or_quote: string;
  activity_suggestion: string;
  ai_reply_text: string;
  language: string;
}
