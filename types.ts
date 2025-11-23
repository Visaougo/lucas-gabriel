
export enum ModuleType {
  SYLLABLES = 'SYLLABLES',     // Consciência Fonológica
  FLUENCY = 'FLUENCY',         // Leitura Fluente
  COMPREHENSION = 'COMPREHENSION', // Compreensão
  CREEPER = 'CREEPER',          // Desafio Rápido (Ortografia/Automatização)
  LETTERS = 'LETTERS',           // Montar palavras (Alfabetização)
  BOSS = 'BOSS',                 // Desafio Final
  STORY = 'STORY',               // Livrinhos Interativos
  FLASHLIGHT = 'FLASHLIGHT',      // Modo Mistério
  MEMORY = 'MEMORY'              // Mini-game Memória
}

export enum WolfState {
  IDLE = 'IDLE',           // Normal state
  LISTENING = 'LISTENING', // Waiting for user to click a syllable
  CONFIRMING = 'CONFIRMING', // Modal is open "Is this the syllable?"
  SPEAKING = 'SPEAKING',   // Currently reading
  NO_CHARGES = 'NO_CHARGES', // Out of energy
  SLEEPING = 'SLEEPING',    // Inactive for too long
  WAKING = 'WAKING',        // Transition from sleep
  CELEBRATING = 'CELEBRATING', // Level complete
  WORRIED = 'WORRIED'       // User is taking too long or making mistakes
}

export type SkinType = 'steve' | 'alex' | 'zombie' | 'skeleton';
export type WolfSkinType = 'DEFAULT' | 'MAGIC' | 'SPACE' | 'PIRATE' | 'NINJA';
export type VoiceEffectType = 'NORMAL' | 'ECHO' | 'HIGH' | 'ROBOT';
export type ThemeType = 'DEFAULT' | 'FOREST' | 'ICE' | 'DESERT' | 'NEON';

export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type WeatherType = 'CLEAR' | 'RAIN' | 'SNOW' | 'FOG';
export type CardRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type CardType = 'CARD' | 'STICKER' | 'MEDAL';

export interface Card {
  id: string;
  name: string;
  image: string; // Emoji or Icon
  rarity: CardRarity;
  type: CardType;
  description: string;
}

export interface BiomeModule {
  id: string;
  title: string;
  type: ModuleType;
  description: string;
  icon: string;
  color: string;
  borderColor: string;
  minLevel: number;
  emeraldReward: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (user: UserState) => boolean;
}

export interface DailyQuest {
  id: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  isClaimed: boolean;
  type: 'PLAY_GAME' | 'CORRECT_ANSWERS' | 'EARN_EMERALDS';
}

// --- ADAPTIVE LEARNING (INVISIBLE TEACHER) ---
export interface AdaptiveStats {
  errorCount: Record<string, number>; // Maps syllable/type to error count
  averageResponseTime: number;
  totalQuestions: number;
  difficultyMultiplier: number; // 0.8 (Easier) to 1.5 (Harder)
}

export interface UserState {
  name: string; // "Lucas Gabriel"
  skin: SkinType;
  xp: number;
  level: number;
  emeralds: number;
  completedModules: string[];
  inventory: string[];
  achievements: string[]; 
  learnedWords: string[]; 
  dailyQuests: DailyQuest[];
  collectedCards: string[];
  mascotXp: number;
  mascotLevel: number;
  lastLoginDate: string;
  
  // Daily Streak System
  loginStreak: number;
  lastRewardClaimedDate: string;

  // Adaptive System
  adaptiveStats: AdaptiveStats;
  
  // New Customization State
  equippedWolfSkin: WolfSkinType;
  equippedVoiceEffect: VoiceEffectType;
  equippedTheme: ThemeType;

  settings: {
    nightMode: boolean; 
    soundEnabled: boolean;
  };
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  category: 'ITEM' | 'VOUCHER' | 'WOLF_SKIN' | 'VOICE_EFFECT' | 'THEME';
  value?: string; // The internal value (e.g., 'PIRATE')
}

// --- Game Content Interfaces ---

export interface SyllableChallenge {
  id: string;
  word: string;
  emoji: string;
  syllables: string[]; 
  distractors: string[]; 
}

export interface FluencyChallenge {
  id: string;
  fullText: string;
  chunks: string[]; 
}

export interface ComprehensionChallenge {
  id: string;
  sentence: string;
  options: { emoji: string; label: string; isCorrect: boolean }[];
}

export interface CreeperChallenge {
  id: string;
  word: string;
  options: { emoji: string; isCorrect: boolean }[];
}

export interface LettersChallenge {
  id: string;
  word: string;
  emoji: string;
}

export interface FlashlightStage {
  level: 1 | 2 | 3;
  instruction: string;
  type: 'FIND_WORDS' | 'BUILD_WORD' | 'MIXED';
  targets: string[]; 
  hiddenItems: { 
    id: string; 
    content: string; 
    x: number; 
    y: number; 
    type: 'WORD' | 'SYLLABLE' | 'OBSTACLE';
    isTarget: boolean; 
  }[];
}

export interface FlashlightChallenge {
  id: string;
  stages: FlashlightStage[];
}

export interface StoryPage {
  text: string;
  image: string; 
  animation?: string;
}

export interface StoryChallenge {
  id: string;
  title: string;
  pages: StoryPage[];
  quiz: {
    question: string;
    options: { text: string; isCorrect: boolean }[];
  };
}

export interface MemoryChallenge {
  id: string;
  pairs: { id: string; content: string; type: 'TEXT' | 'IMAGE' }[];
}

export type GameContent = 
  | SyllableChallenge 
  | FluencyChallenge 
  | ComprehensionChallenge 
  | CreeperChallenge 
  | LettersChallenge
  | FlashlightChallenge
  | StoryChallenge
  | MemoryChallenge;
