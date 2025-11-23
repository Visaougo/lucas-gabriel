
import React from 'react';
import { ModuleType } from '../types';
import { playSFX } from '../utils/audioUtils';

export type DimensionTheme = 
  | 'FOREST' 
  | 'MOUNTAIN' 
  | 'CAVE' 
  | 'MECHANICAL' 
  | 'DARK_ROOM' 
  | 'NEON_FOREST' 
  | 'CUBIC_DESERT' 
  | 'PIXEL_SPACE' 
  | 'UNDERWATER' 
  | 'FUTURE_CITY';

interface DimensionBackgroundProps {
  type: ModuleType | DimensionTheme;
  children: React.ReactNode;
}

export const DimensionBackground: React.FC<DimensionBackgroundProps> = ({ type, children }) => {
  let bgClass = '';
  let particleType: 'firefly' | 'ember' | 'sparkle' | 'dust' | 'bubble' | 'star' | 'digital' = 'dust';

  // Map types to themes
  switch (type) {
    // Legacy mapping
    case ModuleType.LETTERS:
      bgClass = 'bg-gradient-to-b from-green-900 via-green-800 to-green-950'; // Forest
      particleType = 'firefly';
      break;
    case ModuleType.SYLLABLES:
      bgClass = 'bg-gradient-to-b from-stone-500 via-stone-700 to-stone-900'; // Mountain
      particleType = 'ember';
      break;
    case ModuleType.FLUENCY:
    case 'NEON_FOREST':
      bgClass = 'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-900 via-purple-900 to-black'; 
      particleType = 'firefly';
      break;
    case 'CUBIC_DESERT':
      bgClass = 'bg-gradient-to-tr from-orange-400 via-amber-700 to-orange-900';
      particleType = 'dust';
      break;
    case 'PIXEL_SPACE':
      bgClass = 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black';
      particleType = 'star';
      break;
    case 'UNDERWATER':
      bgClass = 'bg-gradient-to-b from-cyan-600 via-blue-800 to-blue-950';
      particleType = 'bubble';
      break;
    case 'FUTURE_CITY':
      bgClass = 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900';
      particleType = 'digital';
      break;
    case ModuleType.COMPREHENSION:
      bgClass = 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900'; // Crystal Cave
      particleType = 'sparkle';
      break;
    case ModuleType.CREEPER:
      bgClass = 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 via-stone-900 to-black'; // Danger
      particleType = 'ember';
      break;
    case ModuleType.FLASHLIGHT:
    case 'DARK_ROOM':
      bgClass = 'bg-black'; // Dark Room
      particleType = 'dust';
      break;
    default:
      bgClass = 'bg-stone-900';
  }

  // Easter Eggs Handlers
  const handleBgClick = (e: React.MouseEvent) => {
      // Prevent triggering if clicking UI elements
      if (e.target !== e.currentTarget) return;
      playSFX('secret');
  };

  // Dimension Specific Decors
  const renderDecor = () => {
      if (type === 'NEON_FOREST' || type === ModuleType.FLUENCY) {
          return (
              <>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
                <div className="absolute top-10 left-10 w-20 h-20 bg-fuchsia-500 blur-[50px] opacity-40 animate-pulse-slow pointer-events-auto cursor-pointer hover:opacity-100 transition-opacity" onClick={() => playSFX('secret')}></div>
              </>
          );
      }
      if (type === 'CUBIC_DESERT') {
          return (
              <>
                 <div className="absolute bottom-0 w-full h-24 bg-amber-800 opacity-50 clip-path-hills"></div>
                 <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-200 rounded-full blur-xl opacity-60 pointer-events-auto cursor-pointer" onClick={() => playSFX('portal')}></div>
              </>
          );
      }
      if (type === 'PIXEL_SPACE') {
          return (
              <div className="absolute inset-0 stars-bg opacity-80" onClick={() => playSFX('click')}></div>
          );
      }
      if (type === 'UNDERWATER') {
          return (
             <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay animate-pulse-slow"></div>
          );
      }
      if (type === 'FUTURE_CITY') {
          return (
              <div className="absolute bottom-0 w-full flex items-end justify-center gap-2 opacity-30">
                  <div className="w-12 h-32 bg-blue-400"></div>
                  <div className="w-16 h-48 bg-blue-500"></div>
                  <div className="w-10 h-24 bg-blue-300"></div>
                  <div className="w-20 h-40 bg-blue-600"></div>
              </div>
          );
      }
      return null;
  };

  return (
    <div 
        className={`relative w-full min-h-full flex-grow overflow-hidden ${bgClass} transition-colors duration-1000`}
        onClick={handleBgClick}
    >
      {/* Dynamic Decor */}
      {renderDecor()}

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-60 
                ${particleType === 'firefly' ? 'w-2 h-2 bg-yellow-300 animate-float shadow-[0_0_5px_yellow]' : ''}
                ${particleType === 'ember' ? 'w-1 h-1 bg-red-500 animate-rain reverse-direction' : ''}
                ${particleType === 'sparkle' ? 'w-1 h-1 bg-white animate-pulse-slow shadow-[0_0_5px_white]' : ''}
                ${particleType === 'dust' ? 'w-1 h-1 bg-gray-400 animate-float opacity-20' : ''}
                ${particleType === 'bubble' ? 'w-3 h-3 border border-white/50 bg-white/10 animate-float' : ''}
                ${particleType === 'star' ? 'w-1 h-1 bg-white animate-pulse' : ''}
                ${particleType === 'digital' ? 'w-1 h-4 bg-green-400/50 animate-rain' : ''}
            `}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <div className="pointer-events-auto w-full h-full">
            {children}
        </div>
      </div>
    </div>
  );
};
