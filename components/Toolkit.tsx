import React, { useState, useCallback } from 'react';
import { getWellnessToolContent, getMoodBalancerContent } from '../services/geminiService';
import type { WellnessTool } from '../services/geminiService';
import type { MoodBalancerResult } from '../types';
import { MoonIcon, SparklesIcon, SpeakerWaveIcon, GlobeAltIcon } from './icons/Icons';

const Toolkit: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState<string | null>(null);
    const [currentTool, setCurrentTool] = useState<string | null>(null);
    const [moodBalancerText, setMoodBalancerText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [moodBalancerResult, setMoodBalancerResult] = useState<MoodBalancerResult | null>(null);
    const [isBalancerLoading, setIsBalancerLoading] = useState(false);
    const [speakingText, setSpeakingText] = useState<string | null>(null);
    
    const handleGenerateContent = useCallback(async (tool: WellnessTool, topic: string) => {
        setIsLoading(true);
        setContent(null);
        setCurrentTool(`${tool}-${topic}`);
        try {
            const result = await getWellnessToolContent(tool, topic);
            setContent(result);
        } catch (error) {
            console.error(error);
            setContent("Sorry, I couldn't generate this tool right now. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleGenerateBalancerContent = useCallback(async () => {
        if (!moodBalancerText.trim()) return;
        setIsBalancerLoading(true);
        setMoodBalancerResult(null);
        try {
            const result = await getMoodBalancerContent(moodBalancerText, selectedLanguage);
            setMoodBalancerResult(result);
        } catch (error) {
            console.error(error);
            // In a real app, you might set an error state here to show in the UI
        } finally {
            setIsBalancerLoading(false);
        }
    }, [moodBalancerText, selectedLanguage]);

    const handleSpeak = (text: string) => {
        if (speakingText === text) {
            window.speechSynthesis.cancel();
            setSpeakingText(null);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        if (moodBalancerResult?.language) {
            const langCode = {
                'English': 'en-US', 'Hindi': 'hi-IN', 'Gujarati': 'gu-IN', 'Marathi': 'mr-IN',
                'Spanish': 'es-ES', 'French': 'fr-FR', 'Japanese': 'ja-JP',
                'Bengali': 'bn-IN', 'Tamil': 'ta-IN'
            }[moodBalancerResult.language];
            if (langCode) utterance.lang = langCode;
        }
        utterance.onend = () => setSpeakingText(null);
        utterance.onerror = () => setSpeakingText(null);
        window.speechSynthesis.cancel(); // Stop any currently playing utterance
        setSpeakingText(text);
        window.speechSynthesis.speak(utterance);
    };

    const SUPPORTED_LANGUAGES = [
        "English", "Hindi", "Gujarati", "Marathi", "Bengali",
        "Tamil", "Spanish", "French", "Japanese"
    ];

    const ToolCard: React.FC<{
        title: string;
        description: string;
        icon: React.ReactElement;
        options: { label: string; tool: WellnessTool; topic: string }[];
    }> = ({ title, description, icon, options }) => (
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center mb-3">
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6 mr-3 text-indigo-400"})}
                <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">{description}</p>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                     <button 
                        key={opt.topic}
                        onClick={() => handleGenerateContent(opt.tool, opt.topic)}
                        disabled={isLoading}
                        className="bg-slate-700 text-sm text-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-600 transition-colors duration-200 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 animate-fade-in-up">Well-being Toolkit</h2>
            
            {(isLoading || content) && (
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg animate-fade-in-up">
                    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Your Generated Tool</h3>
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            <span className="text-slate-400 text-sm">Generating...</span>
                        </div>
                    ) : (
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed prose prose-invert prose-p:my-2 prose-headings:text-cyan-400">
                            {content}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-6">
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <ToolCard 
                        title="Guided Meditations"
                        description="Find calm and focus with short, AI-generated meditation scripts."
                        icon={<MoonIcon />}
                        options={[
                            { label: 'For Anxiety', tool: 'meditation', topic: 'reducing anxiety' },
                            { label: 'For Focus', tool: 'meditation', topic: 'improving focus' },
                            { label: 'For Sleep', tool: 'meditation', topic: 'preparing for sleep' },
                        ]}
                    />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <ToolCard 
                        title="Positive Affirmations"
                        description="Build a positive mindset with powerful, uplifting affirmations."
                        icon={<SparklesIcon />}
                        options={[
                            { label: 'For Confidence', tool: 'affirmation', topic: 'building self-confidence' },
                            { label: 'For Gratitude', tool: 'affirmation', topic: 'cultivating gratitude' },
                            { label: 'For Self-Love', tool: 'affirmation', topic: 'practicing self-love' },
                        ]}
                    />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg transition-all duration-300">
                        <div className="flex items-center mb-3">
                            <GlobeAltIcon className="w-6 h-6 mr-3 text-indigo-400" />
                            <h3 className="text-xl font-bold">Multilingual Mood Balancer</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Express your feelings in your preferred language and receive a comforting story or activity to help you find balance.</p>
                        <div className="space-y-3">
                            <textarea
                                value={moodBalancerText}
                                onChange={(e) => setMoodBalancerText(e.target.value)}
                                placeholder="How are you feeling right now?"
                                className="w-full h-24 px-4 py-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                disabled={isBalancerLoading}
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    disabled={isBalancerLoading}
                                >
                                    {SUPPORTED_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                                <button
                                    onClick={handleGenerateBalancerContent}
                                    disabled={isBalancerLoading || !moodBalancerText.trim()}
                                    className="bg-indigo-600 text-sm text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed font-semibold"
                                >
                                    {isBalancerLoading ? 'Analyzing...' : 'Generate Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {isBalancerLoading && (
                    <div className="bg-slate-800/50 p-4 rounded-lg mt-6 animate-fade-in-up">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            <span className="text-slate-400 text-sm">Generating your comforting response...</span>
                        </div>
                    </div>
                )}

                {moodBalancerResult && !isBalancerLoading && (
                    <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg space-y-4 animate-fade-in-up border border-indigo-500/30">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                            <span>Emotion: <span className="font-semibold text-cyan-400">{moodBalancerResult.detected_emotion}</span></span>
                            <span>Intensity: <span className="font-semibold text-cyan-400">{moodBalancerResult.emotion_intensity}</span></span>
                            <span>Tone: <span className="font-semibold text-cyan-400">{moodBalancerResult.suggested_voice_tone}</span></span>
                        </div>
                        
                        <div className="border-t border-slate-700/50 pt-4 space-y-2">
                             <h4 className="font-semibold text-indigo-400">Your comforting message:</h4>
                            <div className="flex items-start gap-2">
                                <p className="flex-1 text-slate-300 whitespace-pre-wrap leading-relaxed">{moodBalancerResult.ai_reply_text}</p>
                                <button onClick={() => handleSpeak(moodBalancerResult.ai_reply_text)} aria-label="Play AI reply" className={`p-1 rounded-full transition-colors ${speakingText === moodBalancerResult.ai_reply_text ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                                    <SpeakerWaveIcon />
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4 space-y-2">
                            <h4 className="font-semibold text-indigo-400">A short story for you:</h4>
                            <div className="flex items-start gap-2">
                                <p className="flex-1 text-slate-300 italic whitespace-pre-wrap">"{moodBalancerResult.short_story_or_quote}"</p>
                                <button onClick={() => handleSpeak(moodBalancerResult.short_story_or_quote)} aria-label="Play story" className={`p-1 rounded-full transition-colors ${speakingText === moodBalancerResult.short_story_or_quote ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                                    <SpeakerWaveIcon />
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4 space-y-2">
                            <h4 className="font-semibold text-indigo-400">A gentle activity suggestion:</h4>
                             <div className="flex items-start gap-2">
                                <p className="flex-1 text-slate-300">{moodBalancerResult.activity_suggestion}</p>
                                <button onClick={() => handleSpeak(moodBalancerResult.activity_suggestion)} aria-label="Play activity suggestion" className={`p-1 rounded-full transition-colors ${speakingText === moodBalancerResult.activity_suggestion ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                                    <SpeakerWaveIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                 <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="bg-slate-800/50 p-4 rounded-lg opacity-60">
                         <div className="flex items-center mb-3">
                            <SpeakerWaveIcon className="w-6 h-6 mr-3 text-indigo-400" />
                            <h3 className="text-xl font-bold">Relaxing Soundscapes</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Listen to calming sounds to relax or focus. (Coming soon)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toolkit;