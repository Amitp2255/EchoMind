import React, { useState, useEffect } from 'react';

const TypingEffect: React.FC<{ text: string; speed?: number }> = ({ text, speed = 25 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset on new text
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
            setDisplayedText(prev => prev + text.charAt(i));
            i++;
        } else {
            clearInterval(intervalId);
        }
      }, speed);
      return () => clearInterval(intervalId);
    }
  }, [text, speed]);

  return <p className="text-slate-300 italic">"{displayedText}"</p>;
};

export default TypingEffect;
