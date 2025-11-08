import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, MoodEntry, CustomMapping, MoodBalancerResult } from '../types';
import { Emotion } from '../types';
import { SYSTEM_PROMPT, EMOTIONS } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        emotion: {
            type: Type.STRING,
            enum: EMOTIONS,
            description: "The dominant emotion detected in the user's message."
        },
        reply: {
            type: Type.STRING,
            description: "Your empathetic, conversational reply to the user."
        },
        summary: {
            type: Type.STRING,
            description: "A brief, 1-3 word summary of the user's input."
        }
    },
    required: ["emotion", "reply", "summary"],
};

export async function getEmpatheticReplyAndEmotion(
    userMessage: string,
    history: ChatMessage[],
    customMappings: CustomMapping[],
): Promise<{ reply: string; emotion: Emotion; summary:string }> {

    const historyContent = history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    let customMappingsInstructions = '';
    if (customMappings.length > 0) {
        const mappingsList = customMappings.map(m => `- If the user says "${m.keyword}", the emotion is ${m.emotion}.`).join('\n');
        customMappingsInstructions = `
        The user has provided personal emotion mappings. Please prioritize these when determining the emotion:
        ---
        ${mappingsList}
        ---
        `;
    }

    const fullPrompt = `
    ${customMappingsInstructions}
    This is the recent conversation history for context:
    ---
    ${historyContent}
    ---
    Now, here is the new message from the user: "${userMessage}"
    
    Please analyze the user's new message in the context of the history and their custom mappings, then respond according to your instructions.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            }
        });

        const text = response.text.trim();
        const parsed = JSON.parse(text);
        
        const emotion = Object.values(Emotion).find(e => e.toLowerCase() === parsed.emotion.toLowerCase()) || Emotion.Neutral;

        return {
            reply: parsed.reply,
            emotion: emotion,
            summary: parsed.summary,
        };
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return {
            reply: "I'm having a little trouble understanding right now. Could you perhaps rephrase that?",
            emotion: Emotion.Anxiety,
            summary: "API Error",
        };
    }
}

export async function getDashboardInsights(moodHistory: MoodEntry[]): Promise<string> {
    const prompt = `
    You are EchoMind, an AI emotional companion. Your task is to analyze a user's emotional history and provide gentle, encouraging, and insightful observations.
    - Identify patterns, trends, or potential triggers.
    - Frame your insights positively and reflectively.
    - Avoid making diagnoses or giving direct advice. Instead, pose gentle questions for self-reflection.
    - Keep the insight concise, warm, and easy to understand.

    Here is the user's recent mood history:
    ${moodHistory.map(entry => `- ${entry.timestamp.toLocaleDateString()}: ${entry.emotion} (Summary: ${entry.summary})`).join('\n')}

    Based on this data, provide one or two key insights for the user.
    For example: "I've noticed you seem to feel more calm after moments of optimism. It's wonderful that you're finding light even on challenging days."
    Another example: "It looks like stress has been a recurring feeling over the last week. I'm here to listen if you'd like to explore what might be contributing to that."
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini insights API call failed:", error);
        throw new Error("Failed to generate insights.");
    }
}

export type WellnessTool = 'meditation' | 'affirmation';

export async function getWellnessToolContent(tool: WellnessTool, topic: string): Promise<string> {
    let prompt = '';

    if (tool === 'meditation') {
        prompt = `You are a mindfulness expert and meditation guide named EchoMind. Your tone is gentle, calming, and reassuring. Write a short, soothing guided meditation script designed to be read aloud for about 2-3 minutes. The script should focus on helping the user with ${topic}. Structure it with clear pauses (indicated by "..."), simple instructions, and a concluding sentence that brings them back gently.`;
    } else if (tool === 'affirmation') {
        prompt = `You are an optimistic and empowering AI coach named EchoMind. Your tone is encouraging and positive. Generate a list of 5 powerful, first-person affirmations to help someone with ${topic}. Each affirmation should be on its own line and be easy to remember and repeat.`;
    }

    if (!prompt) {
        throw new Error("Invalid wellness tool specified.");
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini wellness tool API call failed:", error);
        throw new Error(`Failed to generate content for ${tool}.`);
    }
}

export async function getMoodBalancerContent(userText: string, language: string): Promise<MoodBalancerResult> {
    const moodBalancerSystemPrompt = `Analyze the user’s message for their emotion, intensity, and mood trend.
Then create a voice-ready empathetic reply that includes:

A short comforting message (first line) ❤️

A 1-minute story, quote, or gentle activity suggestion to help improve their mood 🎧

A voice tone style (e.g., calm, cheerful, hopeful, relaxed, energetic) 🗣️

Language output according to language_preference (${language}).

The goal: help the user move from their current emotion → to a “normal” or “positive” state.
Keep tone emotionally intelligent, kind, and natural.
`;

    const moodBalancerResponseSchema = {
        type: Type.OBJECT,
        properties: {
            detected_emotion: { type: Type.STRING },
            emotion_intensity: { type: Type.STRING },
            suggested_voice_tone: { type: Type.STRING },
            short_story_or_quote: { type: Type.STRING },
            activity_suggestion: { type: Type.STRING },
            ai_reply_text: { type: Type.STRING },
            language: { type: Type.STRING },
        },
        required: [
            "detected_emotion", "emotion_intensity", "suggested_voice_tone", 
            "short_story_or_quote", "activity_suggestion", "ai_reply_text", "language"
        ],
    };

    const prompt = `User message: "${userText}"\nLanguage preference: "${language}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: moodBalancerSystemPrompt,
                responseMimeType: "application/json",
                responseSchema: moodBalancerResponseSchema,
            }
        });

        const text = response.text.trim();
        const parsed = JSON.parse(text);
        return parsed as MoodBalancerResult;

    } catch (error) {
        console.error("Gemini Mood Balancer API call failed:", error);
        throw new Error("Failed to generate Mood Balancer content.");
    }
}
