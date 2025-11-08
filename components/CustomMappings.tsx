import React, { useState } from 'react';
import type { CustomMapping } from '../types';
import { Emotion } from '../types';
import { EMOTIONS, EMOTION_COLORS } from '../constants';
import { TrashIcon } from './icons/Icons';

interface CustomMappingsProps {
    mappings: CustomMapping[];
    onAddMapping: (keyword: string, emotion: Emotion) => void;
    onDeleteMapping: (id: string) => void;
}

const CustomMappings: React.FC<CustomMappingsProps> = ({ mappings, onAddMapping, onDeleteMapping }) => {
    const [keyword, setKeyword] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(Emotion.Neutral);

    const handleAdd = () => {
        if (keyword.trim()) {
            onAddMapping(keyword, selectedEmotion);
            setKeyword('');
            setSelectedEmotion(Emotion.Neutral);
        }
    };
    
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg">
            <p className="text-sm text-slate-400 mb-4">
                Teach EchoMind how you express yourself. Map a keyword or phrase to an emotion to improve analysis. For example, mapping "productive" to "Joy".
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input 
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter keyword or phrase"
                    className="flex-1 px-4 py-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <select 
                    value={selectedEmotion}
                    onChange={(e) => setSelectedEmotion(e.target.value as Emotion)}
                    className="px-4 py-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                    {EMOTIONS.map(emotion => (
                        <option key={emotion} value={emotion}>{emotion}</option>
                    ))}
                </select>
                <button 
                    onClick={handleAdd}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed text-sm font-semibold"
                >
                    Add
                </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {mappings.length > 0 ? (
                    mappings.map(mapping => (
                        <div key={mapping.id} className="bg-slate-700/70 p-2 rounded-lg flex justify-between items-center text-sm">
                            <div>
                                <span className="text-slate-300 font-medium">"{mapping.keyword}"</span>
                                <span className="text-slate-400 mx-2">→</span>
                                <span className={`${EMOTION_COLORS[mapping.emotion]} font-semibold`}>{mapping.emotion}</span>
                            </div>
                            <button onClick={() => onDeleteMapping(mapping.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <TrashIcon />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 text-sm py-4">No custom mappings yet.</p>
                )}
            </div>
        </div>
    );
};

export default CustomMappings;