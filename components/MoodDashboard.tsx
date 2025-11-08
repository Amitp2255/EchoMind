import React, { useMemo, useState } from 'react';
import type { MoodEntry, CustomMapping } from '../types';
import { Emotion } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EMOTION_COLORS } from '../constants';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import CustomMappings from './CustomMappings';
import TypingEffect from './TypingEffect';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface MoodDashboardProps {
  moodHistory: MoodEntry[];
  onGenerateInsights: () => void;
  isLoading: boolean;
  insight: string | null;
  customMappings: CustomMapping[];
  onAddMapping: (keyword: string, emotion: Emotion) => void;
  onDeleteMapping: (id: string) => void;
}

const MoodDashboard: React.FC<MoodDashboardProps> = ({ 
  moodHistory, 
  onGenerateInsights, 
  isLoading, 
  insight,
  customMappings,
  onAddMapping,
  onDeleteMapping,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (moodHistory.length === 0) {
    return (
      <div className="text-center text-slate-400 p-8 animate-fade-in-up">
        <h2 className="text-xl font-semibold mb-2">Your Mood Dashboard</h2>
        <p>Start a conversation to see your emotional journey visualized here.</p>
      </div>
    );
  }

  const emotionCounts = moodHistory.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {} as Record<Emotion, number>);

  const emotionDistributionData = Object.entries(emotionCounts).map(([name, count]) => ({
    name,
    count,
    fill: EMOTION_COLORS[name as Emotion]?.replace('text-', '#').replace('-400', '').replace('-500', ''),
  }));

  const dominantMoodsByDay = useMemo(() => {
    const moods: { [key: string]: Emotion } = {};
    const dayStrings = moodHistory.map(entry => format(entry.timestamp, 'yyyy-MM-dd'));
    const uniqueDayStrings = [...new Set(dayStrings)];

    uniqueDayStrings.forEach(dayString => {
        const entriesForDay = moodHistory.filter(entry => format(entry.timestamp, 'yyyy-MM-dd') === dayString);
        const emotionCountsForDay = entriesForDay.reduce((acc, entry) => {
            acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
            return acc;
        }, {} as Record<Emotion, number>);
        
        const dominantEmotion = Object.keys(emotionCountsForDay).reduce((a, b) => 
            emotionCountsForDay[a as Emotion] > emotionCountsForDay[b as Emotion] ? a : b
        ) as Emotion;
        
        moods[dayString] = dominantEmotion;
    });

    return moods;
  }, [moodHistory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-2 border border-slate-700 rounded-md shadow-lg">
          <p className="label text-slate-300">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const MoodCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
            <ChevronLeftIcon />
          </button>
          <h3 className="font-bold text-lg text-slate-200">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
            <ChevronRightIcon />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
            {dayNames.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dominantMood = dominantMoodsByDay[dayKey];
            const moodColor = dominantMood ? EMOTION_COLORS[dominantMood]?.replace('text-', 'bg-') : '';

            return (
              <div
                key={day.toString()}
                className={`h-10 flex items-center justify-center rounded-lg transition-colors text-sm ${
                  !isSameMonth(day, currentMonth) ? 'text-slate-600' : 'text-slate-300'
                } ${isToday(day) ? 'bg-indigo-600/50 font-bold' : ''}`}
              >
                <div className="relative">
                  <span>{format(day, 'd')}</span>
                  {dominantMood && isSameMonth(day, currentMonth) && (
                    <div title={dominantMood} className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 ${moodColor} rounded-full`}></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Emotion Distribution</h2>
        <div className="h-64 w-full bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12}/>
              <YAxis stroke="#94a3b8" fontSize={12}/>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(71, 85, 105, 0.5)'}}/>
              <Bar dataKey="count" fill="#8884d8" name="Count"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Mood Calendar</h2>
        <MoodCalendar />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Recent Entries</h2>
         <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {moodHistory.slice().reverse().map(entry => {
                const emotionBarColor = EMOTION_COLORS[entry.emotion]?.replace('text-', 'bg-') || 'bg-slate-500';
                return (
                    <div key={entry.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center space-x-3 transition-all duration-300 hover:bg-slate-700/70 hover:shadow-lg">
                        <div className={`w-1.5 h-10 rounded-full ${emotionBarColor}`}></div>
                        <div className="flex-1">
                            <p className={`font-semibold ${EMOTION_COLORS[entry.emotion]}`}>{entry.emotion}</p>
                            <p className="text-sm text-slate-400">{`"${entry.summary}"`}</p>
                        </div>
                        <p className="text-xs text-slate-500">{format(entry.timestamp as Date, 'MMM d, h:mm a')}</p>
                    </div>
                )
            })}
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI Insights</h2>
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg min-h-[100px] flex flex-col justify-center">
            {insight && <TypingEffect text={insight} />}
             <button 
                onClick={onGenerateInsights} 
                disabled={isLoading}
                className="mt-4 self-start bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed text-sm"
            >
                {isLoading ? 'Generating...' : 'Generate New Insight'}
            </button>
        </div>
      </div>
      
      <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Personalize Analysis</h2>
        <CustomMappings 
            mappings={customMappings}
            onAddMapping={onAddMapping}
            onDeleteMapping={onDeleteMapping}
        />
      </div>
    </div>
  );
};

export default MoodDashboard;