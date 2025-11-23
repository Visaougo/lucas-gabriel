
import React, { useState, useEffect } from 'react';
import { Achievement, DailyQuest, Card, WolfState, WolfSkinType } from '../types';
import { Check, X, Gift } from 'lucide-react';
import { playSFX } from '../utils/audioUtils';

// --- Particle Burst System ---
export const ParticleBurst: React.FC<{ x: number, y: number }> = ({ x, y }) => {
    return (
        <div className="fixed pointer-events-none z-[100]" style={{ left: x, top: y }}>
            {Array.from({ length: 12 }).map((_, i) => (
                <div 
                    key={i} 
                    className="absolute w-4 h-4 rounded-full animate-explosion"
                    style={{
                        backgroundColor: ['#facc15', '#4ade80', '#60a5fa', '#f472b6'][i % 4],
                        transform: `rotate(${i * 30}deg) translate(0, 0)`,
                        animationDelay: `${Math.random() * 0.1}s`
                    }}
                ></div>
            ))}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce-short">⭐</div>
        </div>
    );
};

// --- Daily Reward Modal ---
export const DailyRewardModal: React.FC<{ day: number, onClose: () => void }> = ({ day, onClose }) => {
    useEffect(() => {
        playSFX('chest_open');
    }, []);

    const rewards = [
        { day: 1, label: "20 ESMERALDAS", icon: "💎", color: "text-green-400" },
        { day: 2, label: "30 ESMERALDAS", icon: "💎", color: "text-green-400" },
        { day: 3, label: "STICKER RARO", icon: "✨", color: "text-pink-400" },
        { day: 4, label: "40 ESMERALDAS", icon: "💎", color: "text-green-400" },
        { day: 5, label: "ITEM SURPRESA", icon: "🎁", color: "text-yellow-400" },
        { day: 6, label: "50 ESMERALDAS", icon: "💎", color: "text-green-400" },
        { day: 7, label: "SKIN ESPECIAL", icon: "👑", color: "text-purple-400" },
    ];

    const currentReward = rewards[(day - 1) % 7] || rewards[0];
    const isSpecialDay = day % 7 === 0 || day % 7 === 3 || day % 7 === 5;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
             <div className={`bg-stone-800 border-8 ${isSpecialDay ? 'border-yellow-500' : 'border-stone-600'} p-8 rounded-xl max-w-md w-full animate-pop-in text-center relative overflow-hidden`} onClick={e => e.stopPropagation()}>
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-500/10 to-transparent animate-pulse-slow pointer-events-none"></div>
                 
                 <h2 className="text-3xl text-yellow-400 font-bold uppercase mb-2">RECOMPENSA DIÁRIA</h2>
                 <p className="text-white uppercase mb-6">DIA {day} DE 7</p>

                 <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
                     {Array.from({length: 7}).map((_, i) => (
                         <div key={i} className={`flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-xs relative ${i + 1 === ((day - 1) % 7) + 1 ? 'bg-yellow-500 border-yellow-300 text-black animate-bounce z-10 scale-110' : i + 1 < ((day - 1) % 7) + 1 ? 'bg-green-600 border-green-400 text-white opacity-50' : 'bg-gray-700 border-gray-600 text-gray-500'}`}>
                             {i + 1 < ((day - 1) % 7) + 1 ? '✓' : i + 1}
                         </div>
                     ))}
                 </div>

                 <div className="text-8xl mb-4 animate-float drop-shadow-lg">{currentReward.icon}</div>
                 <h3 className={`text-4xl font-vt323 uppercase mb-8 ${currentReward.color}`}>{currentReward.label}</h3>

                 <button onClick={onClose} className="bg-green-600 border-b-8 border-green-800 text-white font-bold text-2xl py-3 px-8 rounded-lg uppercase w-full hover:bg-green-500 active:translate-y-1">
                     COLETAR!
                 </button>
             </div>
        </div>
    );
};

// --- Pixel Button ---
interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyle = "font-bold py-4 px-8 text-xl md:text-3xl uppercase transition-all active:scale-95 border-b-8 focus:outline-none relative font-vt323 touch-manipulation select-none animate-float rounded-lg";
  
  const variants = {
    primary: "bg-green-600 text-white border-green-800 hover:bg-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]",
    secondary: "bg-stone-600 text-white border-stone-800 hover:bg-stone-500",
    danger: "bg-red-600 text-white border-red-800 hover:bg-red-500",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none`}
      onClick={(e) => {
          if(!props.disabled) playSFX('click');
          props.onClick?.(e);
      }}
      {...props}
    >
      <div className="absolute inset-0 border-2 border-white opacity-20 pointer-events-none rounded-lg"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 hover:opacity-100 transition-opacity rounded-lg">
        <div className="w-full h-full animate-shine absolute top-0 left-0"></div>
      </div>
      {children}
    </button>
  );
};

// --- Pixel Card ---
interface PixelCardProps {
  children: React.ReactNode;
  title?: string;
  color?: string; 
  className?: string;
}

export const PixelCard: React.FC<PixelCardProps> = ({ 
  children, 
  title, 
  color = 'bg-stone-800', 
  className = '' 
}) => {
  return (
    <div className={`relative p-2 ${className} animate-pop-in`}>
      <div className="absolute inset-0 bg-black opacity-30 translate-y-2 translate-x-2 rounded-lg"></div>
      <div className={`${color} border-4 md:border-8 border-stone-600 relative text-white p-6 md:p-8 h-full shadow-xl rounded-lg`}>
        {title && (
          <h3 className="text-3xl md:text-4xl mb-6 text-center text-yellow-300 drop-shadow-md border-b-4 border-white/10 pb-2 font-vt323 tracking-wider uppercase">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

// --- XP Bar ---
interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

export const XPBar: React.FC<XPBarProps> = ({ current, max, level }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto mb-6 font-vt323 uppercase">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-green-400 text-2xl animate-pulse-slow">LVL {level}</span>
        <span className="text-gray-400 text-xl">{current} / {max} XP</span>
      </div>
      <div className="h-8 w-full bg-stone-900 border-4 border-stone-600 relative p-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-1000 ease-out pixel-shadow-sm relative rounded-full"
          style={{ width: `${percentage}%` }}
        >
          <div className="w-full h-2 bg-green-300 opacity-50"></div>
          <div className="absolute inset-0 animate-shine opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

// --- Wolf Confirmation Modal ---
interface WolfConfirmationModalProps {
  syllable: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WolfConfirmationModal: React.FC<WolfConfirmationModalProps> = ({ syllable, onConfirm, onCancel }) => {
  useEffect(() => {
    playSFX('confirm');
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-stone-800 border-8 border-blue-500 p-8 rounded-xl max-w-md w-full animate-pop-in shadow-[0_0_50px_rgba(59,130,246,0.6)]">
         <div className="flex flex-col items-center">
             <div className="text-7xl mb-6 animate-bounce">🐺</div>
             <p className="text-white text-3xl text-center uppercase font-vt323 mb-6 leading-none">É ESSA SÍLABA AQUI?</p>
             
             <div className="bg-white text-black text-6xl font-bold px-10 py-6 rounded-lg border-8 border-stone-900 mb-8 uppercase shadow-inner">
                 {syllable}
             </div>

             <div className="flex gap-6 w-full">
                 <button 
                  onClick={onCancel}
                  className="flex-1 bg-red-600 border-b-8 border-red-800 text-white font-bold text-2xl py-4 rounded-lg uppercase active:translate-y-2 hover:bg-red-500 transition-colors"
                 >
                   <X className="inline mr-2 w-8 h-8"/> NÃO
                 </button>
                 <button 
                  onClick={onConfirm}
                  className="flex-1 bg-green-600 border-b-8 border-green-800 text-white font-bold text-2xl py-4 rounded-lg uppercase active:translate-y-2 animate-pulse hover:bg-green-500 transition-colors"
                 >
                   <Check className="inline mr-2 w-8 h-8"/> SIM
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

// --- Mascot Component (SKINNABLE & RESPONSIVE FIX + LIP SYNC + EYE TRACKING) ---
interface MascotProps {
  mood?: 'happy' | 'neutral' | 'sad' | 'excited' | 'worried';
  nightMode?: boolean;
  xp?: number;
  level?: number;
  inventory?: string[];
  onHelp?: () => void;
  charges?: number;
  wolfState?: WolfState;
  wolfSkin?: WolfSkinType; // New prop
}

export const Mascot: React.FC<MascotProps> = ({ 
  mood = 'neutral', 
  nightMode = false, 
  xp = 0, 
  level = 1,
  inventory = [],
  onHelp,
  charges = 0,
  wolfState = WolfState.IDLE,
  wolfSkin = 'DEFAULT'
}) => {
  const [quote, setQuote] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isWolf, setIsWolf] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  // Eye Tracking State
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (inventory.includes('wolf')) {
      setIsWolf(true);
    }
  }, [inventory]);

  // Eye tracking logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 4; // range -2 to 2
        const y = (e.clientY / window.innerHeight - 0.5) * 4; // range -2 to 2
        setEyeOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isListening = wolfState === WolfState.LISTENING;
  const isSpeaking = wolfState === WolfState.SPEAKING;
  const isSleeping = wolfState === WolfState.SLEEPING;
  const isCelebrating = wolfState === WolfState.CELEBRATING;
  const isWorried = wolfState === WolfState.WORRIED || mood === 'worried';

  // React to mood changes
  useEffect(() => {
     if(mood === 'happy' || mood === 'excited' || wolfState === WolfState.CELEBRATING) {
         setIsVisible(true);
         setQuote(mood === 'excited' ? "UAU! INCRÍVEL!" : "ISSO AÍ!");
         setTimeout(() => setIsVisible(false), 2000);
     } else if (isWorried) {
         setIsVisible(true);
         setQuote("HUMMM... TENTE DE NOVO?");
         setTimeout(() => setIsVisible(false), 3000);
     }
  }, [mood, wolfState]);

  const handleMascotClick = () => {
    setClickCount(c => c + 1);
    setTimeout(() => setClickCount(0), 1000);
    
    if (clickCount >= 2) {
        playSFX('secret');
        setQuote("VOCÊ ACHOU UM SEGREDO!");
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 2000);
    }

    if (isSleeping) {
        playSFX('wake');
        if (onHelp) onHelp();
    } else if (!isWolf) {
      setIsVisible(true);
      setQuote("OLÁ AMIGO!");
      setTimeout(() => setIsVisible(false), 2000);
      playSFX('click');
    } else {
       if (onHelp) onHelp();
    }
  };

  const activeScale = isWolf ? 1.1 : 1.0;

  // -- RENDER SVG BASED ON SKIN --
  const renderWolfSVG = () => {
      const baseColor = isListening ? "#cbd5e1" : "#9ca3af";
      const eyeColor = isListening ? "#3b82f6" : "black";
      
      // Dynamic Eye Shape
      let leftEyeH = 4;
      let rightEyeH = 4;
      let mouthY = 35;
      
      if (isSleeping) { leftEyeH = 1; rightEyeH = 1; }
      if (isCelebrating) { leftEyeH = 6; rightEyeH = 6; }
      if (isWorried) { mouthY = 38; } 

      // Apply eye offset only if awake
      const eyeX = isSleeping ? 0 : eyeOffset.x;
      const eyeY = isSleeping ? 0 : eyeOffset.y;

      // LIP SYNC ANIMATION STYLE
      // Simple scaling animation for the mouth
      const mouthStyle = isSpeaking ? { animation: 'pulse 0.2s infinite' } : {};

      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Zzz for sleep */}
            {isSleeping && (
                <text x="80" y="20" fontSize="14" fill="white" className="animate-float">Zzz</text>
            )}

            {/* Base Body */}
            <rect x="20" y="30" width="60" height="50" fill={wolfSkin === 'NINJA' ? '#1f2937' : baseColor} stroke="black" strokeWidth="2" />
            <rect x="35" y="40" width="30" height="40" fill={wolfSkin === 'SPACE' ? '#e0f2fe' : "#e5e7eb"} />
            
            {/* Head */}
            <rect x="25" y="10" width="50" height="40" fill={wolfSkin === 'NINJA' ? '#374151' : baseColor} stroke="black" strokeWidth="2" />
            
            {/* Ears */}
            <polygon points="25,10 35,0 45,10" fill={wolfSkin === 'MAGIC' ? '#c084fc' : "#4b5563"} stroke="black" strokeWidth="2" className={isListening || isCelebrating ? "animate-shake" : ""}/>
            <polygon points="55,10 65,0 75,10" fill={wolfSkin === 'MAGIC' ? '#c084fc' : "#4b5563"} stroke="black" strokeWidth="2" className={isListening || isCelebrating ? "animate-shake" : ""}/>
            
            {/* Eyes Group with Tracking */}
            <g transform={`translate(${eyeX}, ${eyeY})`}>
                <rect x="35" y="25" width="8" height="8" fill="white" />
                <rect x="39" y={27 + (4 - leftEyeH)/2} width="4" height={leftEyeH} fill={eyeColor} />
                <rect x="57" y="25" width="8" height="8" fill="white" />
                
                {wolfSkin === 'PIRATE' ? (
                    <rect x="55" y="23" width="12" height="12" fill="black" /> // Eye Patch
                ) : (
                    <rect x="61" y={27 + (4 - rightEyeH)/2} width="4" height={rightEyeH} fill={eyeColor} />
                )}
            </g>

            {/* Mouth/Snout - LIP SYNC */}
            <rect x="40" y={mouthY} width="20" height="12" fill="#e5e7eb" />
            {/* Animated Mouth Opening */}
            <rect 
                x="45" 
                y={isSpeaking ? "38" : mouthY + 5} 
                width="10" 
                height={isSpeaking ? "6" : "2"} 
                fill="black" 
                className={isSpeaking ? "animate-pulse" : ""}
                style={{ transformBox: 'fill-box', transformOrigin: 'center', ...mouthStyle }}
            />

            {/* SKIN EXTRAS */}
            {wolfSkin === 'MAGIC' && <text x="15" y="15" fontSize="20">✨</text>}
            {wolfSkin === 'MAGIC' && <text x="70" y="50" fontSize="20" className="animate-spin">🌟</text>}
            
            {wolfSkin === 'SPACE' && (
                <circle cx="50" cy="30" r="35" fill="blue" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
            )}

            {wolfSkin === 'PIRATE' && (
                <path d="M25,10 Q50,-5 75,10" fill="red" stroke="black" strokeWidth="3" />
            )}
            
            {wolfSkin === 'NINJA' && (
                 <rect x="25" y="22" width="50" height="10" fill="red" opacity="0.8" />
            )}

            {/* Tail */}
            <path d="M80,60 Q95,50 90,80" fill="#9ca3af" stroke="black" strokeWidth="2" className={mood === 'happy' || isCelebrating ? "animate-wiggle" : isSleeping ? "" : "animate-pulse"} />
        </svg>
      );
  };

  return (
    <div 
      className={`fixed bottom-2 left-2 md:bottom-6 md:left-6 z-50 flex flex-col items-center transition-all duration-300 select-none touch-manipulation ${isWolf ? 'cursor-pointer hover:scale-105' : 'pointer-events-none'}`} 
      style={{ 
        transform: `scale(${activeScale})`, 
        transformOrigin: 'bottom left' 
      }}
      onClick={handleMascotClick}
    >
        {/* Helper Bubble */}
        {isVisible && (
            <div className="bg-white text-black p-2 md:p-4 border-4 border-black rounded-xl mb-2 md:mb-4 font-vt323 text-lg md:text-2xl animate-pop-in relative uppercase text-center min-w-[150px] md:min-w-[200px] max-w-[200px] md:max-w-[250px] shadow-lg">
                {quote}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[16px] border-t-white"></div>
            </div>
        )}

        {/* Listening Indicator */}
        {isListening && (
           <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 text-4xl md:text-6xl animate-bounce drop-shadow-lg z-50">
              👂
           </div>
        )}

        {/* Audio Pulse Icon when speaking */}
        {isSpeaking && (
           <div className="absolute top-0 right-0 text-3xl md:text-4xl animate-ping text-blue-500">
               🔊
           </div>
        )}

        {/* Charges Indicator for Wolf */}
        {isWolf && onHelp && (
           <div className="flex gap-1 md:gap-2 mb-1 md:mb-2 bg-black/60 p-1 md:p-2 rounded-full border-2 border-white/20">
              {[...Array(3)].map((_, i) => (
                 <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-colors ${i < charges ? 'bg-blue-400 border border-blue-200 shadow-[0_0_8px_blue]' : 'bg-gray-700'}`}></div>
              ))}
           </div>
        )}
        
        {/* Render Mascot SVG */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 drop-shadow-2xl relative ${isListening ? 'animate-pulse' : isSleeping ? 'opacity-80' : 'animate-float'}`}>
            {isWolf ? renderWolfSVG() : (
              // DEFAULT MASCOT
              <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="20" y="20" width="60" height="60" fill="#f0abfc" stroke="black" strokeWidth="4" />
                  <rect x="30" y="40" width="10" height="10" fill="white" />
                  <rect x="35" y="42" width="4" height="4" fill="black" />
                  <rect x="60" y="40" width="10" height="10" fill="white" />
                  <rect x="65" y="42" width="4" height="4" fill="black" />
                  <rect x="40" y="60" width="20" height="10" fill="#db2777" />
                  {/* Hat for high level */}
                  {level > 5 && <path d="M20,20 L50,0 L80,20 Z" fill="cyan" stroke="black" strokeWidth="2" />}
              </svg>
            )}
        </div>
        
        {/* Level Tag */}
        <div className={`bg-black/90 text-white px-2 py-0.5 md:px-4 md:py-1 rounded-full text-xs md:text-sm font-bold mt-1 md:mt-2 uppercase border-2 ${isListening ? 'border-blue-400 text-blue-300 animate-pulse' : 'border-white/30'}`}>
            {isWolf ? (isListening ? 'OUVINDO...' : isSleeping ? 'ZZZ...' : wolfSkin.replace('DEFAULT', 'COMPANHEIRO')) : `LVL ${level}`}
        </div>
    </div>
  );
};

// --- Collectible Card Component ---
export const CardComponent: React.FC<{ card: Card, isNew?: boolean }> = ({ card, isNew }) => {
  const borderColor = 
    card.rarity === 'LEGENDARY' ? 'border-yellow-400' : 
    card.rarity === 'EPIC' ? 'border-purple-500' : 
    card.rarity === 'RARE' ? 'border-blue-400' : 'border-gray-400';

  const bgGradient = 
    card.rarity === 'LEGENDARY' ? 'bg-gradient-to-b from-yellow-800 to-yellow-900' :
    card.rarity === 'EPIC' ? 'bg-gradient-to-b from-purple-800 to-purple-900' :
    card.rarity === 'RARE' ? 'bg-gradient-to-b from-blue-800 to-blue-900' : 'bg-gray-800';

  return (
    <div className={`
      relative w-40 h-60 md:w-48 md:h-72 border-8 ${borderColor} ${bgGradient} 
      rounded-xl flex flex-col items-center justify-between p-3 shadow-2xl 
      ${isNew ? 'animate-pop-in' : 'hover:scale-105 transition-transform'}
      ${card.rarity === 'LEGENDARY' ? 'card-legendary' : ''}
    `}>
      {card.rarity !== 'COMMON' && <div className="absolute inset-0 card-holo opacity-50 z-10 pointer-events-none rounded-lg"></div>}

      <div className="w-full flex justify-between text-xs font-bold text-white/70 uppercase px-1 z-20">
        <span>{card.rarity}</span>
        <span>#{card.id}</span>
      </div>

      <div className="flex-grow flex items-center justify-center text-7xl md:text-8xl z-20 drop-shadow-xl animate-float">
        {card.image}
      </div>

      <div className="bg-black/60 w-full p-3 text-center rounded-lg z-20 border border-white/10">
         <div className="flex justify-center mb-1">
             <span className={`text-[10px] px-2 rounded-full font-bold uppercase ${card.type === 'STICKER' ? 'bg-pink-600 text-white' : card.type === 'MEDAL' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}`}>
                 {card.type}
             </span>
         </div>
         <h4 className="text-white font-bold text-sm md:text-base uppercase leading-tight">{card.name}</h4>
         <p className="text-[10px] text-gray-300 mt-1 leading-tight">{card.description}</p>
      </div>
      
      {isNew && <div className="absolute -top-4 -right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-bounce z-30 border-2 border-white shadow-lg">NOVA!</div>}
    </div>
  );
};

// --- Weather Overlay ---
export const WeatherOverlay: React.FC<{ type: any }> = ({ type }) => {
  if (type === 'CLEAR') return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {type === 'RAIN' && Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="rain-drop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random()}s` }}></div>
      ))}
      {type === 'SNOW' && Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="snow-flake" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}></div>
      ))}
      {type === 'FOG' && <div className="w-full h-full bg-white opacity-20 animate-pulse"></div>}
    </div>
  );
};

// --- Achievement Popup ---
export const AchievementPopup: React.FC<{ achievement: Achievement, onClose: () => void }> = ({ achievement, onClose }) => {
    useEffect(() => {
        playSFX('success');
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 right-4 z-[100] animate-pop-in bg-stone-900 border-4 border-yellow-500 p-6 shadow-2xl flex items-center gap-6 max-w-sm rounded-lg">
            <div className="text-5xl animate-bounce">{achievement.icon}</div>
            <div>
                <h4 className="text-yellow-400 font-bold uppercase text-xl">NOVA CONQUISTA!</h4>
                <p className="text-white uppercase font-vt323 text-2xl">{achievement.title}</p>
            </div>
        </div>
    );
};

// --- Daily Quest Widget ---
export const QuestWidget: React.FC<{ quests: DailyQuest[], onClaim: (id: string) => void }> = ({ quests, onClaim }) => {
    const completedCount = quests.filter(q => q.current >= q.target).length;

    return (
        <div className="bg-stone-900/90 border-4 border-stone-600 p-4 rounded-xl w-full max-w-sm mx-auto md:mx-0 mb-6 backdrop-blur-md shadow-xl">
            <h4 className="text-yellow-400 font-bold uppercase text-center mb-4 border-b-2 border-stone-700 pb-2 text-xl">MISSÕES DIÁRIAS ({completedCount}/3)</h4>
            <div className="space-y-3">
                {quests.map(quest => {
                    const isComplete = quest.current >= quest.target;
                    return (
                        <div key={quest.id} className="flex items-center justify-between text-white bg-black/40 p-2 rounded-lg border border-stone-700">
                            <div className="flex-1">
                                <p className="uppercase text-sm font-bold">{quest.description}</p>
                                <div className="w-full bg-stone-700 h-3 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full transition-all" style={{width: `${Math.min(100, (quest.current/quest.target)*100)}%`}}></div>
                                </div>
                            </div>
                            <div className="ml-3">
                                {isComplete && !quest.isClaimed ? (
                                    <button onClick={() => onClaim(quest.id)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded font-bold animate-pulse uppercase text-sm border-2 border-yellow-700">
                                        PEGAR
                                    </button>
                                ) : (
                                    <span className={`text-sm font-bold ${quest.isClaimed ? 'text-green-500' : 'text-gray-400'}`}>
                                        {quest.isClaimed ? <Check size={20}/> : `${quest.current}/${quest.target}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Word Block ---
export const WordBlock: React.FC<{ word: string }> = ({ word }) => {
    const speak = () => {
        playSFX('click');
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <button 
            onClick={speak}
            className="w-full aspect-square bg-orange-200 border-b-8 border-r-4 border-orange-400 flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation rounded-lg group"
        >
             <span className="text-3xl md:text-4xl font-bold text-orange-900 uppercase break-all px-1 group-hover:text-orange-700">{word}</span>
             <div className="mt-2 text-orange-800 opacity-50 group-hover:opacity-100 group-hover:animate-pulse">🔊</div>
        </button>
    );
};

// --- Toggle Button ---
export const ToggleButton: React.FC<{ isOn: boolean, onToggle: () => void, onIcon: React.ReactNode, offIcon: React.ReactNode }> = ({ isOn, onToggle, onIcon, offIcon }) => (
    <button 
        onClick={() => {
            playSFX('click');
            onToggle();
        }} 
        className={`p-3 rounded-lg border-4 transition-colors ${isOn ? 'bg-green-600 border-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-700 border-gray-500 text-gray-300'}`}
    >
        {isOn ? onIcon : offIcon}
    </button>
);
