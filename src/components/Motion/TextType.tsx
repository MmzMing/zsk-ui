import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TextTypeProps {
  text: string | string[];
  asElement?: React.ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | React.ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  textColors?: string[][];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
  hideCursorOnComplete?: boolean;
}

const TextType: React.FC<TextTypeProps> = ({
  text,
  asElement: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorBlinkDuration = 0.5,
  cursorClassName = '',
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  hideCursorOnComplete = false,
}) => {
  const texts = React.useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  const shouldStart = !startOnVisible || isInView;

  useEffect(() => {
    if (!shouldStart) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleTyping = () => {
      const fullText = texts[currentTextIndex];
      
      if (!isDeleting && currentText.length < fullText.length) {
        // Typing
        setIsTyping(true);
        setIsFinished(false);
        const nextChar = fullText.charAt(currentText.length);
        setCurrentText(prev => prev + nextChar);
        
        const speed = variableSpeed 
          ? Math.floor(Math.random() * (variableSpeed.max - variableSpeed.min + 1) + variableSpeed.min)
          : typingSpeed;
          
        timeout = setTimeout(handleTyping, speed);
      } else if (!isDeleting && currentText.length === fullText.length) {
        // Finished typing
        setIsTyping(false);
        if (onSentenceComplete) onSentenceComplete(fullText, currentTextIndex);
        
        if (loop || currentTextIndex < texts.length - 1) {
          timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
        } else {
          // Completely finished (no loop, no more texts)
          setIsFinished(true);
        }
      } else if (isDeleting && currentText.length > 0) {
        // Deleting
        setIsTyping(true);
        setIsFinished(false);
        setCurrentText(prev => prev.slice(0, -1));
        timeout = setTimeout(handleTyping, deletingSpeed);
      } else if (isDeleting && currentText.length === 0) {
        // Finished deleting
        setIsTyping(false);
        setIsDeleting(false);
        setIsFinished(false);
        setCurrentTextIndex(prev => (prev + 1) % texts.length);
        timeout = setTimeout(handleTyping, typingSpeed);
      }
    };

    if (currentText === '' && !isDeleting) {
      timeout = setTimeout(handleTyping, initialDelay);
    } else {
      timeout = setTimeout(handleTyping, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [
    currentText, 
    isDeleting, 
    currentTextIndex, 
    texts, 
    typingSpeed, 
    deletingSpeed, 
    pauseDuration, 
    initialDelay, 
    loop, 
    shouldStart,
    variableSpeed,
    onSentenceComplete
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = Component as any;

  return (
    <Tag ref={containerRef} className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      {showCursor && (!hideCursorWhileTyping || !isTyping) && (!hideCursorOnComplete || !isFinished) && (
        <motion.span
          className={`ml-0.5 ${cursorClassName}`}
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: cursorBlinkDuration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {cursorCharacter}
        </motion.span>
      )}
    </Tag>
  );
};

export { TextType };
export default TextType;
