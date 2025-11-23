
import React, { useState, useEffect, useRef } from 'react';
import { FluencyChallenge } from '../types';
import { PixelButton } from './PixelUI';
import { Play, RotateCcw, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { splitSentenceIntoSyllables } from '../utils/textUtils';
import { playSFX } from '../utils/audioUtils';

interface ReadingGameProps {
  item: FluencyChallenge;
  onComplete: () => void;
  wolfMode?: boolean;
  onWolfInteract?: (text: string) => void;
}

export const ReadingGame: React.FC<ReadingGameProps> = ({ item, onComplete, wolfMode, onWolfInteract }) => {
  const [syllables, setSyllables] = useState<string[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(-1); // Points to the last visible syllable index
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Process the text into syllables including spaces
    const text = item.fullText || "";
    const split = splitSentenceIntoSyllables(text);
    setSyllables(split);
    setVisibleIndex(-1);
    setIsCompleted(false);
  }, [item]);

  // Scroll to bottom when new syllables are added
  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleIndex]);

  const handleNextSyllable = () => {
    playSFX('click');
    if (visibleIndex < syllables.length - 1) {
      let nextIdx = visibleIndex + 1;
      
      // Automatically skip/include space if the next item is a space
      // We want to show the syllable AFTER the space immediately
      if (syllables[nextIdx] === ' ') {
          nextIdx++;
      }
      
      setVisibleIndex(Math.min(nextIdx, syllables.length - 1));
    }
  };

  const handlePrevSyllable = () => {
    playSFX('click');
    if (visibleIndex >= 0) {
      let prevIdx = visibleIndex - 1;
      
      // If we are removing a syllable and the previous item is a space, remove that too
      if (syllables[prevIdx] === ' ') {
          prevIdx--;
      }
      
      setVisibleIndex(Math.max(-1, prevIdx));
    }
  };

  const handleShowAll = () => {
    playSFX('click');
    setVisibleIndex(syllables.length - 1);
  };

  const handleConfirm = () => {
      onComplete();
  };

  const handleSyllableClick = (syl: string) => {
      if (wolfMode && onWolfInteract && syl !== ' ') {
          onWolfInteract(syl);
      }
  };

  const isFullTextVisible = visibleIndex >= syllables.length - 1;

  // -- RENDER --

  return (
    <div className="flex flex-col items-center justify-between min-h-[60vh] w-full py-4 md:py-8 relative animate-fade-in">
        
        {/* Header/Instruction */}
        <div className="mb-4 text-center">
             <div className="bg-black/40 px-6 py-2 rounded-full border border-white/20 backdrop-blur-sm">
                 <p className="text-white text-lg md:text-xl uppercase font-vt323 tracking-widest flex items-center gap-2">
                    <span className="animate-pulse">📖</span> LEITURA GUIADA
                 </p>
             </div>
        </div>

        {/* READING AREA - Accumulating Text */}
        <div 
            className="flex-grow flex items-center justify-center w-full max-w-4xl px-2 mb-6"
        >
            <div 
                ref={containerRef}
                className="bg-stone-900/80 border-4 border-stone-600 rounded-lg p-6 md:p-10 w-full min-h-[200px] md:min-h-[300px] shadow-2xl relative overflow-y-auto max-h-[50vh]"
            >
                {visibleIndex === -1 ? (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                        <p className="text-white text-xl uppercase animate-pulse">CLIQUE EM "PRÓXIMA" PARA COMEÇAR</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-1 content-center h-full">
                        {syllables.map((syl, i) => {
                            if (i > visibleIndex) return null; // Don't render future syllables

                            const isSpace = syl === ' ';
                            const isLast = i === visibleIndex;

                            if (isSpace) {
                                return <span key={i} className="w-4 md:w-6 block"></span>;
                            }

                            return (
                                <div 
                                    key={i} 
                                    onClick={() => handleSyllableClick(syl)}
                                    className={`
                                        relative px-2 py-1 md:px-3 md:py-2 rounded
                                        text-3xl md:text-5xl font-vt323 font-bold uppercase text-white
                                        transition-all duration-300
                                        ${isLast && !wolfMode ? 'bg-yellow-500/20 text-yellow-200 scale-110 animate-pop-in' : 'text-stone-300'}
                                        ${wolfMode ? 'cursor-help animate-pulse ring-4 ring-blue-500 bg-blue-900/40 hover:bg-blue-800' : ''}
                                    `}
                                >
                                    {syl}
                                    {/* Underline for separation visual aid */}
                                    <div className={`absolute bottom-0 left-1 right-1 h-1 rounded ${isLast ? 'bg-yellow-400' : 'bg-stone-700'}`}></div>
                                </div>
                            );
                        })}
                        
                        {/* Cursor Blinking at the end */}
                        {!wolfMode && <div className="w-4 h-8 md:h-12 bg-white/50 animate-pulse ml-1"></div>}
                    </div>
                )}
            </div>
        </div>

        {/* Controls Bar */}
        <div className={`w-full max-w-2xl grid grid-cols-3 gap-3 px-4 ${wolfMode ? 'opacity-50 pointer-events-none' : ''}`}>
             {/* Back Button */}
             <button 
                onClick={handlePrevSyllable}
                disabled={visibleIndex === -1}
                className="col-span-1 bg-red-600 border-b-4 border-red-800 text-white rounded p-3 md:p-4 flex flex-col items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-colors shadow-lg"
             >
                 <ArrowLeft size={24} className="md:w-8 md:h-8" />
                 <span className="text-[10px] md:text-sm uppercase font-bold mt-1">VOLTAR</span>
             </button>

             {/* Finish/Show All Logic */}
             {isFullTextVisible ? (
                 <button 
                    onClick={handleConfirm}
                    className="col-span-2 bg-green-600 border-b-4 border-green-800 text-white rounded p-3 md:p-4 flex flex-row items-center justify-center gap-3 active:scale-95 hover:bg-green-500 transition-colors shadow-lg animate-pulse"
                 >
                     <Check size={28} className="md:w-10 md:h-10" />
                     <span className="text-sm md:text-xl uppercase font-bold">CONCLUIR LEITURA</span>
                 </button>
             ) : (
                <>
                    {/* Show Full Phrase Shortcut */}
                    <button 
                        onClick={handleShowAll}
                        className="col-span-1 bg-blue-600 border-b-4 border-blue-800 text-white rounded p-3 md:p-4 flex flex-col items-center justify-center active:scale-95 hover:bg-blue-500 transition-colors shadow-lg"
                    >
                        <Check size={24} className="md:w-8 md:h-8" />
                        <span className="text-[10px] md:text-sm uppercase font-bold mt-1">FRASE COMPLETA</span>
                    </button>

                     {/* Next Syllable */}
                     <button 
                        onClick={handleNextSyllable}
                        className="col-span-1 bg-yellow-600 border-b-4 border-yellow-800 text-white rounded p-3 md:p-4 flex flex-col items-center justify-center active:scale-95 hover:bg-yellow-500 transition-colors shadow-lg group"
                    >
                        <ArrowRight size={24} className="md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
                        <span className="text-[10px] md:text-sm uppercase font-bold mt-1">PRÓXIMA</span>
                    </button>
                </>
             )}
        </div>
    </div>
  );
};
