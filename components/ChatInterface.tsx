import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Emotion } from '../types';
import { EMOTION_COLORS, EMOTION_ICONS } from '../constants';
import { PaperAirplaneIcon, MicrophoneIcon, SpeakerWaveIcon } from './icons/Icons';
import useAudioRecorder from '../hooks/useAudioRecorder';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSetReaction: (messageId: string, reaction?: Emotion) => void;
}

const TypingIndicator = () => (
    <div className="flex justify-start mb-8 animate-fade-in-up">
        <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-md flex items-center space-x-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
        </div>
    </div>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, onSetReaction }) => {
  const [inputText, setInputText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isRecording, transcript, startRecording, stopRecording, isSupported } = useAudioRecorder();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (transcript) {
        setInputText(transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isRecording) {
      handleSend();
    }
  };
  
  const handleSpeak = (message: ChatMessage) => {
    if (speakingMessageId === message.id) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
    }
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
  }

  const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const emotion = message.emotion || Emotion.Neutral;
    const bubbleColor = isUser ? 'bg-indigo-600' : 'bg-slate-700';
    const alignment = isUser ? 'justify-end' : 'justify-start';
    const bubbleShape = isUser ? 'rounded-br-none' : 'rounded-bl-none';
    const emotionColor = EMOTION_COLORS[emotion] || EMOTION_COLORS[Emotion.Neutral];
    const emotionIcon = EMOTION_ICONS[emotion] || EMOTION_ICONS[Emotion.Neutral];
    const isSpeaking = speakingMessageId === message.id;

    const REACTION_OPTIONS = [Emotion.Love, Emotion.Joy, Emotion.Surprise, Emotion.Gratitude, Emotion.Amusement];

    return (
      <div className={`flex ${alignment} mb-8 group animate-fade-in-up`}>
        <div className="relative">
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${bubbleColor} ${bubbleShape}`}>
                <p className="text-white whitespace-pre-wrap">{message.text}</p>
                {!isUser && (
                    <div className="flex justify-between items-center mt-2">
                        <div className={`flex items-center text-xs ${emotionColor}`}>
                        {React.cloneElement(emotionIcon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4 mr-1' })}
                        <span>{emotion}</span>
                        </div>
                        <button onClick={() => handleSpeak(message)} className={`transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 ${isSpeaking ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                            <SpeakerWaveIcon />
                        </button>
                    </div>
                )}
            </div>

            {!isUser && (
            <>
                {/* Reaction Palette on Hover */}
                <div className="absolute -top-5 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center bg-slate-800/80 backdrop-blur-sm p-1 rounded-full shadow-lg space-x-1">
                {REACTION_OPTIONS.map(reactionEmotion => (
                    <button
                        key={reactionEmotion}
                        onClick={() => onSetReaction(message.id, message.reaction === reactionEmotion ? undefined : reactionEmotion)}
                        className={`p-1.5 rounded-full hover:bg-slate-700 transition-transform hover:scale-125 ${message.reaction === reactionEmotion ? 'bg-indigo-600 scale-110' : ''}`}
                        title={reactionEmotion}
                        aria-label={`React with ${reactionEmotion}`}
                    >
                        {React.cloneElement(EMOTION_ICONS[reactionEmotion] as React.ReactElement<{ className?: string }>, { className: `w-5 h-5 ${message.reaction === reactionEmotion ? 'text-white' : EMOTION_COLORS[reactionEmotion]}` })}
                    </button>
                ))}
                </div>
                {/* Selected Reaction Display */}
                {message.reaction && (
                <div 
                    className="absolute top-full mt-1.5 flex items-center text-xs bg-slate-700 px-2 py-0.5 rounded-full border border-slate-600 cursor-pointer hover:border-red-500/50" 
                    onClick={() => onSetReaction(message.id, undefined)}
                    title="Remove reaction"
                >
                    {React.cloneElement(EMOTION_ICONS[message.reaction] as React.ReactElement<{ className?: string }>, { className: `w-3 h-3 mr-1 ${EMOTION_COLORS[message.reaction]}` })}
                    <span className="text-slate-300">{message.reaction}</span>
                </div>
                )}
            </>
            )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2">
        {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        <div className={`flex items-center space-x-2 p-2 bg-slate-800/80 backdrop-blur-sm rounded-full transition-shadow duration-300 ${isRecording ? 'shadow-lg shadow-indigo-500/50' : ''}`}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Listening..." : "Share your thoughts..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-400 px-4 py-2"
            disabled={isLoading}
          />
          {isSupported && (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-3 rounded-full transition-colors duration-200 ${isRecording ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                disabled={isLoading}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                <MicrophoneIcon />
              </button>
          )}
          <button
            onClick={handleSend}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
            disabled={isLoading || !inputText.trim()}
            aria-label="Send message"
          >
            <PaperAirplaneIcon />
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-3 text-center">
            <button
              onClick={() => onSendMessage("I had a long day.")}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-700/60 text-slate-300 text-xs rounded-full hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I had a long day.
            </button>
            <button
              onClick={() => onSendMessage("Something great happened!")}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-700/60 text-slate-300 text-xs rounded-full hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Something great happened!
            </button>
            <button
              onClick={() => onSendMessage("I'm feeling anxious.")}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-700/60 text-slate-300 text-xs rounded-full hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I'm feeling anxious.
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;