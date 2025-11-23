
import { BiomeModule, ModuleType, ShopItem, SkinType, Achievement, UserState, DailyQuest, Card, StoryChallenge, FlashlightChallenge } from './types';

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 5000];
export const MASCOT_THRESHOLDS = [0, 50, 200, 500, 1000]; // Mascot levels based on XP

export const BIOMES: BiomeModule[] = [
  {
    id: 'letters_workshop',
    title: 'NÍVEL 0: OFICINA DAS LETRAS',
    type: ModuleType.LETTERS,
    description: 'MONTE PALAVRAS USANDO A BANCADA DE TRABALHO!',
    icon: '🔤',
    color: 'bg-orange-600',
    borderColor: 'border-orange-800',
    minLevel: 0,
    emeraldReward: 2
  },
  {
    id: 'syllables_biome',
    title: 'NÍVEL 1: PLANÍCIE DAS SÍLABAS',
    type: ModuleType.SYLLABLES,
    description: 'CONSTRUA PALAVRAS JUNTANDO OS BLOCOS DE SOM!',
    icon: '🟩',
    color: 'bg-green-600',
    borderColor: 'border-green-800',
    minLevel: 1,
    emeraldReward: 3
  },
  {
    id: 'fluency_forest',
    title: 'NÍVEL 2: FLORESTA DA FLUÊNCIA',
    type: ModuleType.FLUENCY,
    description: 'CAMINHE PELA FLORESTA LENDO FRASES PEDACINHO POR PEDACINHO.',
    icon: '🌲',
    color: 'bg-emerald-700',
    borderColor: 'border-emerald-900',
    minLevel: 1, 
    emeraldReward: 4
  },
  {
    id: 'story_library',
    title: 'NÍVEL 3: BIBLIOTECA MÁGICA',
    type: ModuleType.STORY,
    description: 'LEIA LIVRINHOS INTERATIVOS E RESPONDA PERGUNTAS!',
    icon: '📖',
    color: 'bg-blue-800',
    borderColor: 'border-blue-950',
    minLevel: 1,
    emeraldReward: 8
  },
  {
    id: 'mission_village',
    title: 'NÍVEL 4: VILA DAS MISSÕES',
    type: ModuleType.COMPREHENSION,
    description: 'ENTENDA O QUE OS ALDEÕES PEDEM E GANHE RECOMPENSAS.',
    icon: '🏡',
    color: 'bg-amber-600',
    borderColor: 'border-amber-800',
    minLevel: 1,
    emeraldReward: 5
  },
  {
    id: 'dark_cave',
    title: 'NÍVEL 5: CAVERNA ESCURA',
    type: ModuleType.FLASHLIGHT,
    description: 'USE A LANTERNA PARA ACHAR PALAVRAS ESCONDIDAS NO ESCURO!',
    icon: '🔦',
    color: 'bg-gray-900',
    borderColor: 'border-gray-950',
    minLevel: 1,
    emeraldReward: 12
  },
  {
    id: 'creeper_cave',
    title: 'NÍVEL 6: DESAFIO DO CREEPER',
    type: ModuleType.CREEPER,
    description: 'LEIA RÁPIDO ANTES QUE O CREEPER EXPLODA! CUIDADO!',
    icon: '🧨',
    color: 'bg-stone-700',
    borderColor: 'border-stone-900',
    minLevel: 1,
    emeraldReward: 10
  }
];

export const BOSS_BIOME: BiomeModule = {
  id: 'ender_dragon_lair',
  title: 'CHEFE FINAL: O FIM',
  type: ModuleType.BOSS,
  description: 'DERROTE O CHEFÃO PARA SALVAR O MUNDO DA LEITURA!',
  icon: '🐲',
  color: 'bg-purple-900',
  borderColor: 'border-purple-950',
  minLevel: 5,
  emeraldReward: 50
};

export const MINI_GAMES: BiomeModule[] = [
  {
    id: 'mini_memory',
    title: 'JOGO DA MEMÓRIA',
    type: ModuleType.MEMORY,
    description: 'ENCONTRE OS PARES DE SÍLABAS E IMAGENS!',
    icon: '🧠',
    color: 'bg-pink-600',
    borderColor: 'border-pink-800',
    minLevel: 0,
    emeraldReward: 5
  }
];

export const SKINS: {id: SkinType; label: string; color: string}[] = [
  { id: 'steve', label: 'STEVE', color: 'bg-cyan-600' },
  { id: 'alex', label: 'ALEX', color: 'bg-green-600' },
  { id: 'zombie', label: 'ZUMBI', color: 'bg-green-800' },
  { id: 'skeleton', label: 'ESQUELETO', color: 'bg-gray-300' }
];

export const COLLECTIBLE_CARDS: Card[] = [
  { id: 'c1', name: 'PORQUINHO CURIOSO', image: '🐷', rarity: 'COMMON', type: 'CARD', description: 'UM AMIGO ROSINHA.' },
  { id: 'c2', name: 'OVELHA COLORIDA', image: '🐑', rarity: 'COMMON', type: 'CARD', description: 'DÁ LÃ MACIA.' },
  { id: 'c3', name: 'ESPADA DE MADEIRA', image: '🗡️', rarity: 'COMMON', type: 'CARD', description: 'ARMA PARA INICIANTES.' },
  { id: 'c4', name: 'DIAMANTE BRILHANTE', image: '💎', rarity: 'RARE', type: 'CARD', description: 'MUITO VALIOSO!' },
  { id: 'c5', name: 'ENDERMAN TÍMIDO', image: '👾', rarity: 'RARE', type: 'STICKER', description: 'NÃO OLHE NOS OLHOS.' },
  { id: 'c6', name: 'CREEPER AMIGÁVEL', image: '🧨', rarity: 'EPIC', type: 'STICKER', description: 'ELE NÃO EXPLODE (AS VEZES).' },
  { id: 'c7', name: 'DRAGÃO DO FIM', image: '🐲', rarity: 'LEGENDARY', type: 'MEDAL', description: 'O REI DO MUNDO.' },
  { id: 'c8', name: 'HEROBRINE', image: '👻', rarity: 'LEGENDARY', type: 'MEDAL', description: 'UMA LENDA MISTERIOSA.' },
  { id: 's1', name: 'LOBO FELIZ', image: '🐺', rarity: 'RARE', type: 'STICKER', description: 'SEU MELHOR AMIGO.' },
  { id: 's2', name: 'POÇÃO MÁGICA', image: '🧪', rarity: 'EPIC', type: 'STICKER', description: 'BRILHA NO ESCURO.' },
];

export const SHOP_ITEMS: ShopItem[] = [
  // Itens Essenciais
  { id: 'wolf', name: 'LOBO DOMESTICADO', price: 25, icon: '🐺', description: 'UM AMIGO QUE LÊ PARA VOCÊ.', category: 'ITEM' },
  
  // Skins de Lobo
  { id: 'skin_wolf_magic', name: 'LOBO MÁGICO', price: 40, icon: '🦄', description: 'UM LOBO COM PODERES MÍSTICOS.', category: 'WOLF_SKIN', value: 'MAGIC' },
  { id: 'skin_wolf_space', name: 'LOBO ESPACIAL', price: 45, icon: '👨‍🚀', description: 'PRONTO PARA VIAJAR NAS ESTRELAS.', category: 'WOLF_SKIN', value: 'SPACE' },
  { id: 'skin_wolf_pirate', name: 'LOBO PIRATA', price: 40, icon: '🏴‍☠️', description: 'EM BUSCA DE TESOUROS.', category: 'WOLF_SKIN', value: 'PIRATE' },
  { id: 'skin_wolf_ninja', name: 'LOBO NINJA', price: 50, icon: '🥷', description: 'SILENCIOSO E RÁPIDO.', category: 'WOLF_SKIN', value: 'NINJA' },

  // Efeitos de Voz
  { id: 'voice_robot', name: 'VOZ DE ROBÔ', price: 30, icon: '🤖', description: 'FALA DIVERTIDA DE ROBÔ.', category: 'VOICE_EFFECT', value: 'ROBOT' },
  { id: 'voice_echo', name: 'VOZ COM ECO', price: 30, icon: '📢', description: 'PARECE QUE ESTÁ NUMA CAVERNA.', category: 'VOICE_EFFECT', value: 'ECHO' },
  { id: 'voice_high', name: 'VOZ DE ESQUILO', price: 30, icon: '🐿️', description: 'UMA VOZ FINA E ENGRAÇADA.', category: 'VOICE_EFFECT', value: 'HIGH' },

  // Temas de Mundo
  { id: 'theme_neon', name: 'MUNDO NEON', price: 60, icon: '🌆', description: 'CORES BRILHANTES NO ESCURO.', category: 'THEME', value: 'NEON' },
  { id: 'theme_ice', name: 'PLANETA GELADO', price: 55, icon: '❄️', description: 'TUDO CONGELADO E AZUL.', category: 'THEME', value: 'ICE' },
  { id: 'theme_desert', name: 'DESERTO QUENTE', price: 55, icon: '🌵', description: 'AREIA E SOL FORTE.', category: 'THEME', value: 'DESERT' },

  // Outros Itens
  { id: 'diamond_sword', name: 'ESPADA DE DIAMANTE', price: 10, icon: '⚔️', description: 'UMA ESPADA BRILHANTE.', category: 'ITEM' },
  { id: 'map', name: 'MAPA DO TESOURO', price: 8, icon: '🗺️', description: 'LEVA A LUGARES SECRETOS.', category: 'ITEM' },
  
  // Vales Reais
  { id: 'voucher_mod', name: 'VALE MOD', price: 50, icon: '📦', description: 'INSTALAR UM MOD NOVO.', category: 'VOUCHER' },
  { id: 'voucher_build', name: 'VALE CONSTRUÇÃO', price: 70, icon: '🏠', description: 'CONSTRUÇÃO ESPECIAL PARA VOCÊ.', category: 'VOUCHER' },
  { id: 'voucher_creative', name: 'VALE CRIATIVO', price: 35, icon: '🎨', description: '20 MIN DE MODO CRIATIVO.', category: 'VOUCHER' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'PRIMEIROS PASSOS',
    description: 'COMPLETE SEU PRIMEIRO NÍVEL.',
    icon: '👢',
    condition: (u) => u.completedModules.length >= 1
  },
  {
    id: 'rich_player',
    title: 'RICO EM ESMERALDAS',
    description: 'JUNTE 20 ESMERALDAS.',
    icon: '💎',
    condition: (u) => u.emeralds >= 20
  },
  {
    id: 'reader_master',
    title: 'MESTRE DA LEITURA',
    description: 'COMPLETE 5 NÍVEIS DIFERENTES.',
    icon: '🎓',
    condition: (u) => u.completedModules.length >= 5
  },
  {
    id: 'shopper',
    title: 'CLIENTE VIP',
    description: 'COMPRE UM ITEM NA LOJA.',
    icon: '🛍️',
    condition: (u) => u.inventory.length >= 1
  },
  {
    id: 'boss_slayer',
    title: 'HERÓI DO MUNDO',
    description: 'DERROTE O CHEFÃO FINAL.',
    icon: '🏆',
    condition: (u) => u.completedModules.includes('ender_dragon_lair')
  },
  {
    id: 'word_collector',
    title: 'COLECIONADOR',
    description: 'APRENDA 10 PALAVRAS.',
    icon: '📚',
    condition: (u) => u.learnedWords.length >= 10
  }
];

export const DAILY_QUEST_TEMPLATES: Omit<DailyQuest, 'id' | 'current' | 'isClaimed'>[] = [
  { description: 'ACERTE 3 PALAVRAS', target: 3, reward: 5, type: 'CORRECT_ANSWERS' },
  { description: 'JOGUE 2 FASES', target: 2, reward: 5, type: 'PLAY_GAME' },
  { description: 'GANHE 10 ESMERALDAS', target: 10, reward: 8, type: 'EARN_EMERALDS' },
  { description: 'COMPLETE O MODO CREEPER', target: 1, reward: 10, type: 'PLAY_GAME' }
];

export const INITIAL_USER_STATE: UserState = {
  name: 'LUCAS GABRIEL', // Personalized default
  skin: 'steve' as SkinType,
  xp: 0,
  level: 1,
  emeralds: 0,
  completedModules: [],
  inventory: [],
  achievements: [],
  learnedWords: [],
  dailyQuests: [],
  collectedCards: [],
  mascotXp: 0,
  mascotLevel: 1,
  lastLoginDate: new Date().toDateString(),
  
  // Daily Streak System
  loginStreak: 1,
  lastRewardClaimedDate: "",

  // Adaptive System
  adaptiveStats: {
    errorCount: {},
    averageResponseTime: 5000,
    totalQuestions: 0,
    difficultyMultiplier: 1.0
  },
  
  // Defaults for new customization
  equippedWolfSkin: 'DEFAULT',
  equippedVoiceEffect: 'NORMAL',
  equippedTheme: 'DEFAULT',

  settings: {
    nightMode: false,
    soundEnabled: true
  }
};

// --- FALLBACK CONTENT ---
// (Fallback content remains unchanged, keeping it concise for this update)
export const FALLBACK_LETTERS = [
  { id: '1', word: 'SOL', emoji: '☀️' },
  { id: '2', word: 'LUA', emoji: '🌙' },
  { id: '3', word: 'UVA', emoji: '🍇' },
  { id: '4', word: 'OVO', emoji: '🥚' },
  { id: '5', word: 'BOLA', emoji: '⚽' }
];

export const FALLBACK_SYLLABLES = [
  {
    id: 's1',
    word: 'BOLA',
    emoji: '⚽',
    syllables: ['BO', 'LA'],
    distractors: ['BA', 'LE', 'LO']
  },
  {
    id: 's2',
    word: 'CASA',
    emoji: '🏠',
    syllables: ['CA', 'SA'],
    distractors: ['CO', 'SE', 'SU']
  },
  {
    id: 's3',
    word: 'GATO',
    emoji: '🐱',
    syllables: ['GA', 'TO'],
    distractors: ['GO', 'TA', 'TE']
  }
];

export const FALLBACK_FLUENCY = [
  {
    id: 'f1',
    fullText: 'O SOL BRILHA.',
    chunks: ['O SOL', 'BRILHA.'] 
  },
  {
    id: 'f2',
    fullText: 'A BOLA ROLA.',
    chunks: ['A BOLA', 'ROLA.']
  }
];

export const FALLBACK_COMPREHENSION = [
  {
    id: 'c1',
    sentence: 'SOU AMARELA E GOSTO DE MACACOS.',
    options: [
      { emoji: '🍌', label: 'BANANA', isCorrect: true },
      { emoji: '🍎', label: 'MAÇÃ', isCorrect: false },
      { emoji: '🍇', label: 'UVA', isCorrect: false }
    ]
  }
];

export const FALLBACK_CREEPER = [
  {
    id: 'cr1',
    word: 'MESA',
    options: [
      { emoji: '🪑', isCorrect: true },
      { emoji: '🛌', isCorrect: false },
      { emoji: '🚪', isCorrect: false }
    ]
  }
];

export const FALLBACK_STORIES: StoryChallenge[] = [
  {
    id: 'story_1',
    title: 'O PORQUINHO',
    pages: [
      { text: 'O PORQUINHO SAIU DE CASA.', image: '🐷', animation: 'walk' },
      { text: 'ELE VIU UMA MAÇÃ NO CHÃO.', image: '🍎', animation: 'shake' },
      { text: 'NHAC! ELE COMEU TUDO.', image: '😋', animation: 'jump' },
      { text: 'AGORA ELE ESTÁ FELIZ.', image: '😊', animation: 'spin' }
    ],
    quiz: {
      question: 'O QUE O PORQUINHO COMEU?',
      options: [
        { text: 'UMA MAÇÃ', isCorrect: true },
        { text: 'UMA BANANA', isCorrect: false }
      ]
    }
  }
];

export const FALLBACK_FLASHLIGHT: FlashlightChallenge[] = [
  {
    id: 'flash_campaign_1',
    stages: [
      {
        level: 1,
        instruction: "ENCONTRE: PATO, BOLA, SAPO",
        type: "FIND_WORDS",
        targets: ["PATO", "BOLA", "SAPO"],
        hiddenItems: [
          { id: "1", content: "PATO", x: 20, y: 30, type: "WORD", isTarget: true },
          { id: "2", content: "BOLA", x: 80, y: 20, type: "WORD", isTarget: true },
          { id: "3", content: "SAPO", x: 50, y: 80, type: "WORD", isTarget: true },
          { id: "4", content: "MALA", x: 10, y: 60, type: "WORD", isTarget: false }
        ]
      },
      {
        level: 2,
        instruction: "MONTE A PALAVRA: COMER",
        type: "BUILD_WORD",
        targets: ["CO", "MER"],
        hiddenItems: [
          { id: "1", content: "CO", x: 15, y: 25, type: "SYLLABLE", isTarget: true },
          { id: "2", content: "MER", x: 75, y: 75, type: "SYLLABLE", isTarget: true },
          { id: "3", content: "PA", x: 40, y: 40, type: "SYLLABLE", isTarget: false }
        ]
      },
      {
        level: 3,
        instruction: "ENCONTRE: LUA, SOL, MAR",
        type: "FIND_WORDS",
        targets: ["LUA", "SOL", "MAR"],
        hiddenItems: [
           { id: "obs1", content: "🦇", x: 50, y: 50, type: "OBSTACLE", isTarget: false },
           { id: "1", content: "LUA", x: 10, y: 10, type: "WORD", isTarget: true },
           { id: "2", content: "SOL", x: 90, y: 10, type: "WORD", isTarget: true },
           { id: "3", content: "MAR", x: 50, y: 90, type: "WORD", isTarget: true }
        ]
      }
    ]
  }
];

export const FALLBACK_MEMORY = [
  {
    id: "mem1",
    pairs: [
      { id: "p1", content: "BO", type: "TEXT" },
      { id: "p1", content: "🍰", type: "IMAGE" }, // Bolo
      { id: "p2", content: "CA", type: "TEXT" },
      { id: "p2", content: "🐶", type: "IMAGE" }, // Cachorro
      { id: "p3", content: "SO", type: "TEXT" },
      { id: "p3", content: "🛋️", type: "IMAGE" }, // Sofá
    ]
  }
];
