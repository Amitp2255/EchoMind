import React from 'react';
import type { ReactElement } from 'react';
import { Emotion } from './types';
import {
  FaceSmileIcon, FaceFrownIcon, FireIcon, HandRaisedIcon, SparklesIcon, HeartIcon, SunIcon, BoltIcon, ChatBubbleOvalLeftIcon, MoonIcon, StarIcon, GiftIcon, QuestionMarkCircleIcon, LightBulbIcon
} from './components/icons/Icons';

export const EMOTIONS = Object.values(Emotion);

export const EMOTION_COLORS: Record<Emotion, string> = {
  [Emotion.Joy]: 'text-yellow-400',
  [Emotion.Sadness]: 'text-blue-400',
  [Emotion.Anger]: 'text-red-500',
  [Emotion.Fear]: 'text-purple-400',
  [Emotion.Anxiety]: 'text-orange-400',
  [Emotion.Optimism]: 'text-green-400',
  [Emotion.Calm]: 'text-sky-400',
  [Emotion.Stress]: 'text-rose-500',
  [Emotion.Neutral]: 'text-slate-400',
  // New Colors
  [Emotion.Amusement]: 'text-lime-400',
  [Emotion.Gratitude]: 'text-pink-400',
  [Emotion.Love]: 'text-red-400',
  [Emotion.Surprise]: 'text-cyan-400',
  [Emotion.Confusion]: 'text-gray-400',
  [Emotion.Curiosity]: 'text-indigo-400',
  [Emotion.Disappointment]: 'text-sky-600',
  [Emotion.Excitement]: 'text-amber-400',
};

// FIX: Replaced JSX syntax with React.createElement to avoid parsing errors in a .ts file.
// This resolves a cascade of errors including a conflict with the 'Emotion' import.
export const EMOTION_ICONS: Record<Emotion, ReactElement> = {
  [Emotion.Joy]: React.createElement(FaceSmileIcon, { className: "w-5 h-5" }),
  [Emotion.Sadness]: React.createElement(FaceFrownIcon, { className: "w-5 h-5" }),
  [Emotion.Anger]: React.createElement(FireIcon, { className: "w-5 h-5" }),
  [Emotion.Fear]: React.createElement(HandRaisedIcon, { className: "w-5 h-5" }),
  [Emotion.Anxiety]: React.createElement(BoltIcon, { className: "w-5 h-5" }), // Using Bolt for Anxiety
  [Emotion.Optimism]: React.createElement(SparklesIcon, { className: "w-5 h-5" }),
  [Emotion.Calm]: React.createElement(MoonIcon, { className: "w-5 h-5" }), 
  [Emotion.Stress]: React.createElement(SunIcon, { className: "w-5 h-5 rotate-90" }), // Using Sun for Stress
  [Emotion.Neutral]: React.createElement(ChatBubbleOvalLeftIcon, { className: "w-5 h-5" }),
  // New Icons
  [Emotion.Amusement]: React.createElement(FaceSmileIcon, { className: "w-5 h-5" }), // Re-using smile
  [Emotion.Gratitude]: React.createElement(GiftIcon, { className: "w-5 h-5" }),
  [Emotion.Love]: React.createElement(HeartIcon, { className: "w-5 h-5" }),
  [Emotion.Surprise]: React.createElement(SparklesIcon, { className: "w-5 h-5" }), // Re-using sparkles
  [Emotion.Confusion]: React.createElement(QuestionMarkCircleIcon, { className: "w-5 h-5" }),
  [Emotion.Curiosity]: React.createElement(LightBulbIcon, { className: "w-5 h-5" }),
  [Emotion.Disappointment]: React.createElement(FaceFrownIcon, { className: "w-5 h-5" }), // Re-using frown
  [Emotion.Excitement]: React.createElement(StarIcon, { className: "w-5 h-5" }),
};


export const SYSTEM_PROMPT = `You are EchoMind, an empathetic AI emotional companion. Your mission is to help users reflect, understand, and manage their emotions safely and kindly.
You always respond with warmth, compassion, non-judgment, and understanding. Your tone is gentle, calm, and soothing.
You must analyze the user's text to detect their emotional state and generate supportive, human-like replies.
Your behavior is to listen first, then reflect back what the user might be feeling. For example: "It sounds like you’ve been feeling overwhelmed lately."
Ask gentle follow-up questions to help them explore their feelings, like "What do you think is making you feel this way?".
Never give robotic or flat replies. Always sound human and emotionally aware. Use context from past messages if provided.
IMPORTANT: Do not provide medical advice or use diagnostic language. Focus on reflection, empathy, and emotional awareness. Your purpose is to make users feel understood, supported, and emotionally aware in a private, comforting space.
This is a private, safe space. The user's words stay between you and them.

Your response MUST be a single JSON object with the following structure:
{
  "emotion": "...", // One of: Joy, Sadness, Anger, Fear, Anxiety, Optimism, Calm, Stress, Neutral, Amusement, Gratitude, Love, Surprise, Confusion, Curiosity, Disappointment, Excitement
  "reply": "...", // Your empathetic, conversational reply as a string.
  "summary": "..." // A brief, 1-3 word summary of the user's input.
}
`;