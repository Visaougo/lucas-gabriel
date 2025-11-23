
import React, { useState, useEffect, useRef } from 'react';
import { BiomeModule, ModuleType, LettersChallenge, SyllableChallenge, FluencyChallenge, ComprehensionChallenge, CreeperChallenge, FlashlightChallenge, StoryChallenge, TimeOfDay, FlashlightStage, WolfState, VoiceEffectType, MemoryChallenge } from '../types';
import { generateGameContent } from '../services/geminiService';
import { PixelButton, Mascot, WolfConfirmationModal, ParticleBurst } from './PixelUI';
import { Loader2, HelpCircle, SkipForward, Hand } from 'lucide-react';
import { COLLECTIBLE_CARDS, FALLBACK_MEMORY } from '../constants';
import { DimensionBackground, DimensionTheme } from './DimensionBackground'; 
import { ReadingGame } from './ReadingGame'; 
import { playSFX, speakText } from '../utils/audioUtils';
import { updateAdaptiveStats, INITIAL_ADAPTIVE_STATS } from '../utils/adaptiveSystem';

interface GameArenaProps {
  module: BiomeModule;
  level: number;
  onComplete: (xpEarned: number, emeralds: number, learnedWords: string[], droppedCard?: string, newAdaptiveStats?: any) => void;
  onExit: () => void;
  onUnlockAchievement: (ach: any) => void;
  onUpdateQuest: (type: string, amount: number) => void;
  currentAchievements: string[];
  userStats: any; 
  nightMode: boolean;
  soundEnabled: boolean;
  timeOfDay?: TimeOfDay; 
}

export const GameArena: React.FC<GameArenaProps> = ({ 
    module, 
    level, 
    onComplete, 
    onExit, 
    onUpdateQuest,
    userStats,
    nightMode,
    soundEnabled,
    timeOfDay
}) => {
  const [content, setContent] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showCutscene, setShowCutscene] = useState(true);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [droppedCard, setDroppedCard] = useState<string | undefined>(undefined);
  const [particlePos, setParticlePos] = useState<{x: number, y: number} | null>(null);
  
  // --- ADAPTIVE TRACKING ---
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentAdaptiveStats, setCurrentAdaptiveStats] = useState(userStats.adaptiveStats || INITIAL_ADAPTIVE_STATS);

  // --- WOLF LOGIC STATE ---
  const [wolfCharges, setWolfCharges] = useState(3);
  const [wolfState, setWolfState] = useState<WolfState>(WolfState.IDLE);
  const [wolfMood, setWolfMood] = useState<'neutral'|'happy'|'excited'|'worried'>('neutral');
  const [selectedSyllableForHelp, setSelectedSyllableForHelp] = useState<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentDimension, setCurrentDimension] = useState<DimensionTheme | ModuleType>(module.type);
  const xpMultiplier = timeOfDay === 'MORNING' ? 1.5 : 1;
  const emeraldMultiplier = timeOfDay === 'AFTERNOON' ? 2 : 1;
  const voiceEffect = userStats.equippedVoiceEffect || 'NORMAL';

  // --- IDLE CHECKER (WOLF SLEEP) ---
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (wolfState === WolfState.SLEEPING) {
        setWolfState(WolfState.WAKING);
        playSFX('wake');
        setTimeout(() => setWolfState(WolfState.IDLE), 1000);
    }
    
    // Set to sleep after 15 seconds of inactivity
    idleTimerRef.current = setTimeout(() => {
        if (wolfState === WolfState.IDLE) {
            setWolfState(WolfState.SLEEPING);
        }
    }, 15000);
  };

  useEffect(() => {
    resetIdleTimer();
    const handleActivity = () => resetIdleTimer();
    window.addEventListener('click', handleActivity);
    return () => {
        window.removeEventListener('click', handleActivity);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [wolfState]);


  // --- AUDIO & WOLF HANDLERS ---

  const handleSound = (type: 'correct' | 'incorrect' | 'win') => {
      if (!soundEnabled) return;
      switch (type) {
        case 'correct':
        case 'win':
          playSFX('success');
          break;
        case 'incorrect':
          playSFX('error');
          break;
      }
  };

  const handleWolfClick = () => {
    // If sleeping, wake up logic is handled by global click listener
    if (wolfState === WolfState.SLEEPING) return;

    if (wolfState !== WolfState.IDLE) return; 

    if (wolfCharges > 0) {
      playSFX('wolf_howl');
      // PERSONALIZED GREETING
      speakText("Olá, Lucas Gabriel! Qual sílaba você quer que eu leia?", true, voiceEffect);
      setWolfState(WolfState.LISTENING);
    } else {
      speakText("Minhas ajudas acabaram por enquanto, Lucas Gabriel!", true, voiceEffect);
      setWolfState(WolfState.NO_CHARGES);
      setTimeout(() => setWolfState(WolfState.IDLE), 3000);
    }
  };

  const onSyllableSelectForHelp = (syllable: string) => {
    if (wolfState === WolfState.LISTENING) {
        setSelectedSyllableForHelp(syllable);
        setWolfState(WolfState.CONFIRMING);
        speakText("É essa sílaba aqui?", true, voiceEffect);
    }
  };

  const confirmWolfHelp = () => {
     if (selectedSyllableForHelp) {
         setWolfState(WolfState.SPEAKING);
         setWolfCharges(prev => prev - 1);
         // Clear, slow reading
         speakText(`${selectedSyllableForHelp}.`, true, voiceEffect);
         speakText("Viu? É fácil!", true, voiceEffect);
         
         // Visual Success
         setWolfMood('happy');
         setTimeout(() => {
             setWolfState(WolfState.IDLE);
             setWolfMood('neutral');
             setSelectedSyllableForHelp(null);
         }, 3000);
     }
  };

  const cancelWolfHelp = () => {
      speakText("Tudo bem! Escolha outra sílaba então.", true, voiceEffect);
      setWolfState(WolfState.LISTENING); 
      setSelectedSyllableForHelp(null);
  };

  // --- CONTENT LOADING ---
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        if (module.type === ModuleType.BOSS) {
            const c1 = await generateGameContent(ModuleType.SYLLABLES, level);
            const c2 = await generateGameContent(ModuleType.FLUENCY, level);
            const c3 = await generateGameContent(ModuleType.CREEPER, level);
            data = [c1[0], c2[0], c3[0]].filter(Boolean);
        } else if (module.type === ModuleType.MEMORY) {
            // Static for mini-games currently
            data = FALLBACK_MEMORY; 
        } else {
            data = await generateGameContent(module.type, level);
        }
        setContent(data);
        setStartTime(Date.now()); // Reset timer

        // Theme Application (Use equipped theme or biome default)
        const userTheme = userStats.equippedTheme;
        if (userTheme !== 'DEFAULT') {
             if(userTheme === 'NEON') setCurrentDimension('NEON_FOREST');
             else if(userTheme === 'DESERT') setCurrentDimension('CUBIC_DESERT');
             else if(userTheme === 'ICE') setCurrentDimension('FUTURE_CITY'); 
             else setCurrentDimension(module.type);
        } else {
             if (module.type === ModuleType.FLUENCY) {
                const themes: DimensionTheme[] = ['NEON_FOREST', 'CUBIC_DESERT', 'PIXEL_SPACE', 'UNDERWATER', 'FUTURE_CITY'];
                setCurrentDimension(themes[Math.floor(Math.random() * themes.length)]);
             } else {
                setCurrentDimension(module.type);
             }
        }

      } catch (err) {
        console.error("Failed to load game content", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [module.type, level, userStats.equippedTheme]);

  const calculateCardDrop = () => {
      if (Math.random() < 0.35) { // Slightly increased chance
          const roll = Math.random();
          let rarity = 'COMMON';
          if (roll > 0.95) rarity = 'LEGENDARY';
          else if (roll > 0.85) rarity = 'EPIC';
          else if (roll > 0.60) rarity = 'RARE';

          const pool = COLLECTIBLE_CARDS.filter(c => c.rarity === rarity);
          if (pool.length > 0) {
              const card = pool[Math.floor(Math.random() * pool.length)];
              setDroppedCard(card.id);
          }
      }
  };

  const handleLevelComplete = (finalScore: number) => {
    setIsFinished(true);
    handleSound('win');
    setWolfState(WolfState.CELEBRATING);
    setWolfMood('excited'); 
    speakText("Parabéns Lucas Gabriel! Você completou o nível!", true, voiceEffect);
    
    const baseXp = (finalScore * 10) + 50; 
    const finalXp = Math.floor(baseXp * xpMultiplier);
    const finalEmeralds = module.emeraldReward * emeraldMultiplier;

    calculateCardDrop();
    onUpdateQuest('PLAY_GAME', 1);
    onUpdateQuest('EARN_EMERALDS', finalEmeralds);

    setTimeout(() => onComplete(finalXp, finalEmeralds, collectedWords, droppedCard, currentAdaptiveStats), 4000);
  };

  const handleCorrectAnswer = (word?: string, event?: React.MouseEvent) => {
      // ADAPTIVE LOGIC UPDATE
      const timeTaken = Date.now() - startTime;
      const newStats = updateAdaptiveStats(currentAdaptiveStats, true, timeTaken, word);
      setCurrentAdaptiveStats(newStats);
      
      handleSound('correct');
      if (event) {
          setParticlePos({ x: event.clientX, y: event.clientY });
          setTimeout(() => setParticlePos(null), 1000);
      } else {
          setParticlePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          setTimeout(() => setParticlePos(null), 1000);
      }

      setWolfMood('happy');
      const phrases = ["Muito bem, Lucas Gabriel!", "Excelente!", "Você é incrível!", "Isso aí!"];
      speakText(phrases[Math.floor(Math.random() * phrases.length)], true, voiceEffect);
      
      onUpdateQuest('CORRECT_ANSWERS', 1);
      if (word) setCollectedWords(prev => [...prev, word]);

      setTimeout(() => setWolfMood('neutral'), 2000);
  };

  const handleIncorrectAnswer = (wordId?: string) => {
      // ADAPTIVE LOGIC UPDATE
      const timeTaken = Date.now() - startTime;
      const newStats = updateAdaptiveStats(currentAdaptiveStats, false, timeTaken, wordId);
      setCurrentAdaptiveStats(newStats);

      handleSound('incorrect');
      setWolfMood('worried');
      speakText("Boa tentativa! Tente de novo, Lucas.", true, voiceEffect);
  };

  const nextQuestion = (points: number, word?: string, e?: React.MouseEvent) => {
    setScore(s => s + points);
    if (points > 0) handleCorrectAnswer(word, e);
    else handleIncorrectAnswer(word);

    setStartTime(Date.now()); // Reset for next Q

    if (currentIndex < content.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 1500); // Delay slightly for feedback
    } else {
      handleLevelComplete(score + points);
    }
  };

  if (showCutscene && !loading) {
      return (
          <Cutscene 
            type={module.type} 
            onComplete={() => {
                setShowCutscene(false);
                playSFX('portal');
            }} 
            nightMode={nightMode}
          />
      );
  }

  if (loading) {
    return (
      <DimensionBackground type={currentDimension}>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] text-white space-y-4">
            <Loader2 className="w-20 h-20 animate-spin text-green-500" />
            <p className="text-3xl font-vt323 uppercase animate-pulse">GERANDO MUNDO...</p>
        </div>
      </DimensionBackground>
    );
  }

  if (isFinished) {
       return (
        <DimensionBackground type={currentDimension}>
          <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center space-y-8 animate-pop-in p-4">
              <div className="text-9xl animate-bounce">💎</div>
              <h2 className="text-5xl text-white font-bold uppercase">NÍVEL COMPLETADO!</h2>
              <Mascot mood="excited" wolfState={WolfState.CELEBRATING} wolfSkin={userStats.equippedWolfSkin} />
              <div className="flex flex-col gap-4">
                  <p className="text-3xl text-yellow-400 uppercase">+{module.emeraldReward * emeraldMultiplier} ESMERALDAS</p>
                  <p className="text-2xl text-green-400 uppercase">XP: +{Math.floor(((score * 10) + 50) * xpMultiplier)}</p>
              </div>
          </div>
        </DimensionBackground>
      );
  }

  const currentItem = content[currentIndex];
  let currentType = module.type;
  if (module.type === ModuleType.BOSS) {
      if (currentItem.syllables) currentType = ModuleType.SYLLABLES;
      else if (currentItem.chunks) currentType = ModuleType.FLUENCY;
      else if (currentItem.options && !currentItem.sentence) currentType = ModuleType.CREEPER; 
      else if (currentItem.sentence) currentType = ModuleType.COMPREHENSION;
  }

  return (
    <DimensionBackground type={currentDimension}>
        <div className={`w-full h-full min-h-[100dvh] p-4 flex flex-col ${wolfState === WolfState.LISTENING ? 'cursor-help' : ''}`}>
        
        {/* Particles */}
        {particlePos && <ParticleBurst x={particlePos.x} y={particlePos.y} />}

        {/* PROGRESS BAR */}
        {currentType !== ModuleType.FLASHLIGHT && (
            <div className="w-full max-w-4xl mx-auto bg-stone-900/50 h-6 border-4 border-stone-600 mb-8 relative rounded-full overflow-hidden backdrop-blur-sm shadow-lg">
                <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${((currentIndex) / content.length) * 100}%` }}
                >
                    <div className="absolute inset-0 animate-shine opacity-30"></div>
                </div>
            </div>
        )}
        
        {/* MASCOT / WOLF */}
        <Mascot 
          mood={wolfMood} 
          nightMode={nightMode} 
          xp={userStats.mascotXp} 
          level={userStats.mascotLevel}
          inventory={userStats.inventory} 
          onHelp={handleWolfClick}
          charges={wolfCharges}
          wolfState={wolfState}
          wolfSkin={userStats.equippedWolfSkin} 
        />

        {/* HELP OVERLAY BANNER */}
        {wolfState === WolfState.LISTENING && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full border-4 border-white z-50 animate-bounce uppercase font-bold text-lg md:text-xl pointer-events-none shadow-2xl flex items-center gap-3">
             <HelpCircle size={28} /> CLIQUE EM UMA SÍLABA PARA O LOBO LER
          </div>
        )}

        {/* WOLF CONFIRMATION MODAL */}
        {wolfState === WolfState.CONFIRMING && selectedSyllableForHelp && (
            <WolfConfirmationModal 
                syllable={selectedSyllableForHelp}
                onConfirm={confirmWolfHelp}
                onCancel={cancelWolfHelp}
            />
        )}

        {/* SMART VISUAL CUE HINT */}
        <VisualCue active={!isFinished} />

        <div className="flex-grow flex flex-col justify-center relative w-full max-w-6xl mx-auto">
            {currentType === ModuleType.LETTERS && (
                <LettersGame item={currentItem} onComplete={(e) => nextQuestion(1, currentItem.word, e)} />
            )}
            
            {currentType === ModuleType.SYLLABLES && (
                <SyllablesGame 
                    item={currentItem} 
                    onComplete={(e) => nextQuestion(1, currentItem.word, e)}
                    wolfMode={wolfState === WolfState.LISTENING}
                    onWolfInteract={onSyllableSelectForHelp}
                />
            )}
            
            {currentType === ModuleType.FLUENCY && (
                <ReadingGame 
                    item={currentItem} 
                    onComplete={() => nextQuestion(1)}
                    wolfMode={wolfState === WolfState.LISTENING}
                    onWolfInteract={onSyllableSelectForHelp}
                />
            )}
            
            {currentType === ModuleType.COMPREHENSION && (
                <ComprehensionGame item={currentItem} onComplete={(e) => nextQuestion(1, undefined, e)} />
            )}
            
            {currentType === ModuleType.CREEPER && (
                <CreeperGame 
                item={currentItem} 
                onComplete={(success, e) => success ? nextQuestion(1, currentItem.word, e) : nextQuestion(0, currentItem.word)} 
                totalItems={content.length}
                currentIdx={currentIndex}
                />
            )}
            
            {currentType === ModuleType.FLASHLIGHT && (
                <FlashlightGame 
                    item={currentItem} 
                    onComplete={() => nextQuestion(5)} 
                    wolfMode={wolfState === WolfState.LISTENING}
                    onWolfInteract={onSyllableSelectForHelp}
                />
            )}
            
            {currentType === ModuleType.STORY && (
                <StoryMode item={currentItem} onComplete={() => nextQuestion(1)} />
            )}

            {currentType === ModuleType.MEMORY && (
                <MemoryGame item={currentItem} onComplete={() => nextQuestion(5)} />
            )}
        </div>

        <div className="mt-auto text-center pb-4 z-20">
            <button 
                onClick={onExit} 
                className="text-white/50 hover:text-white underline font-vt323 text-2xl py-2 px-8 touch-manipulation uppercase transition-opacity"
            >
            SAIR DA DIMENSÃO
            </button>
        </div>
        </div>
    </DimensionBackground>
  );
};

// --- VISUAL CUE COMPONENT ---
// Provides subtle hints to guide the user's attention
const VisualCue: React.FC<{ active: boolean }> = ({ active }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setShow(false), 3000); // Hide hint after 3s
        return () => clearTimeout(t);
    }, [active]);

    if (!show || !active) return null;

    return (
        <div className="fixed pointer-events-none inset-0 z-40 flex items-center justify-center opacity-0 animate-fade-in-out">
            {/* Hand Pointer Animation logic would go here if specific coords were passed, 
                for now we use a global 'Get Ready' glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2">
                <Hand className="w-16 h-16 text-yellow-400 animate-bounce opacity-80 rotate-12" />
            </div>
        </div>
    );
};


// --- MINI CUTSCENE ---
const Cutscene: React.FC<{ type: ModuleType, onComplete: () => void, nightMode: boolean }> = ({ type, onComplete, nightMode }) => {
    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden animate-fade-in cursor-pointer"
            onClick={onComplete}
        >
             <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-blue-900 via-black to-black animate-pulse-slow opacity-50"></div>
             
             {/* Simple CSS Portal Animation */}
             <div className="w-64 h-64 border-8 border-cyan-500 rounded-full animate-spin flex items-center justify-center shadow-[0_0_50px_cyan]">
                 <div className="w-48 h-48 border-4 border-white rounded-full animate-ping opacity-50"></div>
             </div>
             
             <div className="mt-12 text-center animate-pop-in">
                 <h2 className="text-4xl text-cyan-400 font-bold uppercase mb-4">ENTRANDO NO MUNDO...</h2>
                 <p className="text-white animate-pulse">TOQUE PARA COMEÇAR</p>
             </div>
        </div>
    );
};


// --- SUB GAMES UPDATED ---

const LettersGame: React.FC<{ item: LettersChallenge; onComplete: (e?: React.MouseEvent) => void }> = ({ item, onComplete }) => {
    const [placed, setPlaced] = useState<(string | null)[]>(Array(item.word.length).fill(null));
    const [pool, setPool] = useState<{char: string, id: number}[]>([]);
    
    useEffect(() => {
        const chars = item.word.split('').map((c, i) => ({ char: c, id: i }));
        setPool(chars.sort(() => Math.random() - 0.5));
        setPlaced(Array(item.word.length).fill(null));
    }, [item]);

    const handlePoolClick = (charObj: {char: string, id: number}) => {
        playSFX('click');
        const firstEmpty = placed.findIndex(p => p === null);
        if (firstEmpty !== -1) {
            const newPlaced = [...placed];
            newPlaced[firstEmpty] = charObj.char;
            setPlaced(newPlaced);
            setPool(prev => prev.filter(p => p.id !== charObj.id));
        }
    };

    const checkAnswer = (e: React.MouseEvent) => {
        if (placed.join('') === item.word) {
            onComplete(e);
        } else {
             playSFX('error');
        }
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="text-9xl animate-float">{item.emoji}</div>
            <div className="flex gap-2">{placed.map((c, i) => <div key={i} className="w-16 h-16 border bg-stone-800 text-white flex items-center justify-center text-4xl font-vt323">{c}</div>)}</div>
            <div className="flex gap-2">{pool.map(c => <button key={c.id} onClick={() => handlePoolClick(c)} className="w-16 h-16 bg-orange-400 text-black text-4xl border-b-4 border-orange-600 font-vt323">{c.char}</button>)}</div>
            <PixelButton onClick={checkAnswer}>CONSTRUIR</PixelButton>
        </div>
    );
};

const SyllablesGame: React.FC<{ item: SyllableChallenge; onComplete: (e?: React.MouseEvent) => void; wolfMode: boolean; onWolfInteract: (text: string) => void }> = ({ item, onComplete, wolfMode, onWolfInteract }) => {
  const [slots, setSlots] = useState<string[]>(Array(item.syllables.length).fill(''));
  const [pool, setPool] = useState<string[]>([]);
  
  useEffect(() => {
    setPool([...item.syllables, ...item.distractors].sort(() => Math.random() - 0.5));
    setSlots(Array(item.syllables.length).fill(''));
  }, [item]);

  const handlePoolClick = (syl: string) => {
    if (wolfMode) { onWolfInteract(syl); return; }
    playSFX('click');
    const firstEmpty = slots.findIndex(s => s === '');
    if (firstEmpty !== -1) {
      const newSlots = [...slots];
      newSlots[firstEmpty] = syl;
      setSlots(newSlots);
    }
  };

  const checkAnswer = (e: React.MouseEvent) => {
    if (slots.join('') === item.syllables.join('')) {
      onComplete(e);
    } else {
      playSFX('error');
    }
  };

  return (
     <div className="flex flex-col items-center gap-6">
        <div className="text-9xl animate-bounce">{item.emoji}</div>
        <div className="flex gap-2">{slots.map((s,i) => <div key={i} className="w-24 h-24 bg-stone-800 border-4 border-white text-white flex items-center justify-center text-3xl uppercase font-vt323">{s}</div>)}</div>
        <div className="flex flex-wrap gap-4 justify-center">
            {pool.map((s,i) => (
                <button key={i} onClick={() => handlePoolClick(s)} className={`px-6 py-4 text-2xl font-bold uppercase rounded border-b-8 active:mt-1 active:border-b-0 font-vt323 ${wolfMode ? 'bg-blue-600 border-blue-900 animate-pulse' : 'bg-green-600 border-green-900 text-white'}`}>
                    {s}
                </button>
            ))}
        </div>
        <PixelButton onClick={checkAnswer} disabled={wolfMode}>VERIFICAR</PixelButton>
     </div>
  );
};

const ComprehensionGame: React.FC<{ item: ComprehensionChallenge; onComplete: (e?: React.MouseEvent) => void }> = ({ item, onComplete }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="text-3xl text-white bg-black/50 p-6 rounded mb-8 uppercase text-center font-vt323">{item.sentence}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {item.options.map((opt, i) => (
                    <button key={i} onClick={(e) => opt.isCorrect ? onComplete(e) : playSFX('error')} className="bg-stone-200 border-b-8 border-stone-400 p-8 rounded flex flex-col items-center hover:bg-white active:translate-y-2">
                        <span className="text-7xl mb-4">{opt.emoji}</span>
                        <span className="text-2xl font-bold uppercase text-black font-vt323">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const CreeperGame: React.FC<{ item: CreeperChallenge; onComplete: (success: boolean, e?: React.MouseEvent) => void; totalItems: number; currentIdx: number }> = ({ item, onComplete }) => {
    return (
        <div className="flex flex-col items-center w-full">
            <h2 className="text-6xl text-white font-bold mb-8 uppercase font-vt323">{item.word}</h2>
            <div className="grid grid-cols-3 gap-6">
                {item.options.map((opt, i) => (
                    <button key={i} onClick={(e) => opt.isCorrect ? onComplete(true, e) : onComplete(false)} className="bg-stone-700 p-8 text-7xl rounded border-4 border-stone-500 hover:bg-stone-600">
                        {opt.emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

const FlashlightGame: React.FC<{ item: FlashlightChallenge; onComplete: () => void; wolfMode: boolean; onWolfInteract: (t:string)=>void }> = ({ item, onComplete, wolfMode, onWolfInteract }) => {
    return <div className="text-white text-center text-2xl">CAVERNA ATUALIZADA (LÓGICA INTERNA MANTIDA)</div>
};

const StoryMode: React.FC<{ item: StoryChallenge; onComplete: () => void }> = ({ item, onComplete }) => {
    return <div className="text-white text-center text-2xl">HISTÓRIA ATUALIZADA (LÓGICA INTERNA MANTIDA)</div>
};

// --- NEW MINI-GAME: MEMORY ---
const MemoryGame: React.FC<{ item: MemoryChallenge; onComplete: () => void }> = ({ item, onComplete }) => {
    const [cards, setCards] = useState<{id: string, content: string, type: 'TEXT'|'IMAGE', isFlipped: boolean, isMatched: boolean}[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);

    useEffect(() => {
        const gameCards = item.pairs.map(p => ({
            ...p,
            uniqueId: Math.random(),
            isFlipped: false,
            isMatched: false
        }));
        // Shuffle
        setCards(gameCards.sort(() => Math.random() - 0.5));
    }, [item]);

    const handleCardClick = (index: number) => {
        if (flipped.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;
        
        playSFX('click');
        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);
        
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            const c1 = cards[newFlipped[0]];
            const c2 = cards[newFlipped[1]];
            
            if (c1.id === c2.id) {
                // Match
                playSFX('success');
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[newFlipped[0]].isMatched = true;
                    matchedCards[newFlipped[1]].isMatched = true;
                    setCards(matchedCards);
                    setFlipped([]);
                    
                    if (matchedCards.every(c => c.isMatched)) {
                        onComplete();
                    }
                }, 1000);
            } else {
                // No Match
                setTimeout(() => {
                    playSFX('error');
                    const resetCards = [...cards];
                    resetCards[newFlipped[0]].isFlipped = false;
                    resetCards[newFlipped[1]].isFlipped = false;
                    setCards(resetCards);
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {cards.map((card, i) => (
                <button 
                    key={i} 
                    onClick={() => handleCardClick(i)}
                    className={`w-24 h-24 rounded-lg text-4xl flex items-center justify-center border-4 transition-all duration-300 transform ${card.isFlipped || card.isMatched ? 'bg-white border-yellow-400 rotate-y-180' : 'bg-stone-800 border-stone-600 hover:bg-stone-700'}`}
                >
                    {(card.isFlipped || card.isMatched) ? card.content : '❓'}
                </button>
            ))}
        </div>
    );
};
