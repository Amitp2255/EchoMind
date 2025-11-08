import React, { useState, useCallback, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { auth } from './services/firebase';
import type { ChatMessage, MoodEntry, View, CustomMapping } from './types';
import { Emotion } from './types';
import ChatInterface from './components/ChatInterface';
import MoodDashboard from './components/MoodDashboard';
import Toolkit from './components/Toolkit';
import { getEmpatheticReplyAndEmotion, getDashboardInsights } from './services/geminiService';
import { ChatIcon, ChartBarIcon, SparklesIcon, LogoutIcon } from './components/icons/Icons';

interface AppProps {
  user: User;
}

const App: React.FC<AppProps> = ({ user }) => {
  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [customMappings, setCustomMappings] = useState<CustomMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardInsight, setDashboardInsight] = useState<string | null>(null);

  useEffect(() => {
    // Set initial welcome message if there are no messages
    if (messages.length === 0) {
      setMessages([
        {
          id: 'initial-ai-message',
          sender: 'ai',
          text: `Hello, ${user.displayName || 'there'}. This is a private, safe space to reflect. How are you feeling today?`,
          emotion: Emotion.Calm,
          timestamp: new Date(),
        },
      ]);
    }
  }, []); // Run only once on mount

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setIsLoading(true);

    try {
      const historyForAPI = currentHistory.slice(-6);
      const aiResponse = await getEmpatheticReplyAndEmotion(text, historyForAPI, customMappings);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse.reply,
        emotion: aiResponse.emotion,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

      const newMoodEntry: MoodEntry = {
        id: `mood-${Date.now()}`,
        timestamp: new Date(),
        emotion: aiResponse.emotion,
        summary: aiResponse.summary,
      };
      setMoodHistory(prevMoodHistory => [...prevMoodHistory, newMoodEntry]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        emotion: Emotion.Anxiety,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, customMappings]);

  const handleGenerateInsights = useCallback(async () => {
    if (moodHistory.length < 3) {
      setDashboardInsight("There isn't enough data yet to generate insights. Keep journaling to see your patterns.");
      return;
    }
    setIsLoading(true);
    setDashboardInsight(null);
    try {
      const insights = await getDashboardInsights(moodHistory);
      setDashboardInsight(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      setDashboardInsight("Sorry, I couldn't generate insights at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [moodHistory]);
  
  const handleSetReaction = useCallback((messageId: string, reaction?: Emotion) => {
    setMessages(prevMessages => 
        prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, reaction: reaction } : msg
        )
    );
  }, []);

  const handleAddMapping = useCallback(async (keyword: string, emotion: Emotion) => {
    if (!keyword.trim()) return;
    const newMapping: CustomMapping = {
        id: `map-${Date.now()}`,
        keyword: keyword.toLowerCase().trim(),
        emotion: emotion,
    };
    setCustomMappings(prevMappings => [...prevMappings, newMapping]);
  }, []);

  const handleDeleteMapping = useCallback(async (mappingId: string) => {
    setCustomMappings(prevMappings => prevMappings.filter(m => m.id !== mappingId));
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // FIX: Updated the type for the 'icon' prop to specify that it can accept a className. This resolves the TypeScript error with React.cloneElement.
  const NavButton = ({ targetView, icon, label }: { targetView: View; icon: React.ReactElement<{ className?: string }>, label: string }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
        view === targetView 
        ? 'bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg' 
        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }`}
      aria-label={label}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900/50 backdrop-blur-xl text-slate-100 font-sans max-w-3xl mx-auto border-x border-slate-700/50">
      <header className="p-4 flex justify-between items-center text-center border-b border-slate-700/50">
        <div className="w-10"></div> {/* Spacer */}
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400" style={{ fontFamily: "'Lora', serif" }}>
            EchoMind
          </h1>
          <p className="text-sm text-slate-400">Your AI-Powered Emotional Co-Pilot</p>
        </div>
        <div className="w-10 flex justify-end">
           <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" aria-label="Sign out">
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main key={view} className="flex-1 overflow-y-auto p-4 animate-fade-in">
        {view === 'chat' && (
          <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} onSetReaction={handleSetReaction} />
        )}
        {view === 'dashboard' && (
          <MoodDashboard 
            moodHistory={moodHistory} 
            onGenerateInsights={handleGenerateInsights}
            isLoading={isLoading}
            insight={dashboardInsight}
            customMappings={customMappings}
            onAddMapping={handleAddMapping}
            onDeleteMapping={handleDeleteMapping}
          />
        )}
        {view === 'toolkit' && <Toolkit />}
      </main>

      <nav className="flex sticky bottom-0 left-0 right-0 p-2 border-t border-slate-700/50 bg-slate-800/90 backdrop-blur-sm gap-2">
        <NavButton targetView="chat" icon={<ChatIcon />} label="Chat" />
        <NavButton targetView="dashboard" icon={<ChartBarIcon />} label="Dashboard" />
        <NavButton targetView="toolkit" icon={<SparklesIcon />} label="Toolkit" />
      </nav>
    </div>
  );
};

export default App;
