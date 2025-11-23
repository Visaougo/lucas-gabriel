
import React, { useState, useEffect } from 'react';
import { BIOMES, BOSS_BIOME, INITIAL_USER_STATE, SHOP_ITEMS, SKINS, ACHIEVEMENTS, DAILY_QUEST_TEMPLATES, COLLECTIBLE_CARDS, MASCOT_THRESHOLDS, MINI_GAMES } from './constants';
import { UserState, BiomeModule, SkinType, Achievement, DailyQuest, ModuleType, TimeOfDay, WeatherType } from './types';
import { PixelButton, PixelCard, AchievementPopup, Mascot, QuestWidget, ToggleButton, WordBlock, XPBar, CardComponent, WeatherOverlay, DailyRewardModal } from './components/PixelUI';
import { GameArena } from './components/GameArena';
import { ParentPortal } from './components/ParentPortal';
import { Settings, Map as MapIcon, User, ShoppingCart, Lock, Menu, Info, BookOpen, Volume2, VolumeX, Moon, Sun, Trophy, Gift, Sticker, Gamepad2 } from 'lucide-react';
import { playSFX, setAudioConfig } from './utils/audioUtils';

type ViewState = 'HOME' | 'MAP' | 'GAME' | 'PARENTS' | 'PROFILE' | 'SHOP' | 'WORD_WALL' | 'PROGRESS' | 'PRIZES' | 'ALBUM' | 'EXTRAS';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('craftingReadersState');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATE;
  });
  const [activeModule, setActiveModule] = useState<BiomeModule | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [voucher, setVoucher] = useState<string | null>(null);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [droppedCardId, setDroppedCardId] = useState<string | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);

  // Living Map State
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('MORNING');
  const [weather, setWeather] = useState<WeatherType>('CLEAR');
  const [weeklyEvent, setWeeklyEvent] = useState<string>('NENHUM');

  // --- SIDE EFFECTS ---

  useEffect(() => {
    localStorage.setItem('craftingReadersState', JSON.stringify(user));
  }, [user]);

  // Audio Config update
  useEffect(() => {
      setAudioConfig({ isNightMode: user.settings.nightMode });
  }, [user.settings.nightMode]);

  // Biome Cycling / Time System & Weekly Events
  useEffect(() => {
    const updateEnvironment = () => {
        const hour = new Date().getHours();
        let newTime: TimeOfDay = 'MORNING';
        
        // Auto Night Mode logic (8 PM)
        if (hour >= 20 || hour < 6) {
             newTime = 'NIGHT';
             // Optionally auto-set calm mode if not manually overridden could go here
        } else if (hour >= 12) {
             newTime = 'AFTERNOON';
        }
        
        setTimeOfDay(newTime);

        // Random Weather change
        if (Math.random() > 0.7) {
            const weathers: WeatherType[] = ['RAIN', 'SNOW', 'FOG', 'CLEAR'];
            setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
        } else {
            setWeather('CLEAR');
        }

        // Determine Weekly Event based on week number
        const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
        const events = ["SEMANA DO LOBO ESPACIAL", "FLORESTA MÁGICA", "CAÇA AOS STICKERS", "PORTAL PERDIDO"];
        setWeeklyEvent(events[weekNum % events.length]);
    };
    
    updateEnvironment();
    const interval = setInterval(updateEnvironment, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Daily Quests & Daily Login Streak
  useEffect(() => {
      const today = new Date().toDateString();
      if (user.lastLoginDate !== today) {
          // Calculate Streak
          const lastLogin = new Date(user.lastLoginDate);
          const diffDays = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
          
          let newStreak = user.loginStreak;
          if (diffDays === 1) {
              newStreak += 1; // Consecutive day
          } else if (diffDays > 2) { // Allow 48h (missing 1 day breaks streak on the 2nd missed day login)
              newStreak = 1; // Broken streak
          }
          
          // Reset quests
          const newQuests: DailyQuest[] = DAILY_QUEST_TEMPLATES
             .sort(() => 0.5 - Math.random())
             .slice(0, 3)
             .map((q, i) => ({...q, id: `q_${Date.now()}_${i}`, current: 0, isClaimed: false }));
          
          setUser(prev => ({
              ...prev,
              lastLoginDate: today,
              dailyQuests: newQuests,
              loginStreak: newStreak,
              lastRewardClaimedDate: prev.lastRewardClaimedDate // Don't reset this yet
          }));

          // Show Reward Modal if haven't claimed today
          if (user.lastRewardClaimedDate !== today) {
              setShowDailyReward(true);
          }
      }
  }, [user.lastLoginDate]);

  // Check achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(ach => {
        if (!user.achievements.includes(ach.id) && ach.condition(user)) {
            handleUnlockAchievement(ach);
        }
    });
  }, [user]);

  // --- HANDLERS ---

  const handleClaimDailyReward = () => {
      const today = new Date().toDateString();
      const streakDay = user.loginStreak;
      const dayCycle = (streakDay - 1) % 7 + 1; // 1 to 7
      
      let emeraldBonus = 0;
      let rewardMessage = "";
      
      // Reward Logic
      if (dayCycle === 1) emeraldBonus = 20;
      else if (dayCycle === 2) emeraldBonus = 30;
      else if (dayCycle === 4) emeraldBonus = 40;
      else if (dayCycle === 6) emeraldBonus = 50;

      // Special Rewards
      if (dayCycle === 3) {
          // Give Sticker
          const sticker = COLLECTIBLE_CARDS.find(c => c.type === 'STICKER' && !user.collectedCards.includes(c.id)) 
                        || COLLECTIBLE_CARDS[Math.floor(Math.random() * COLLECTIBLE_CARDS.length)];
          if (sticker) {
             setDroppedCardId(sticker.id);
             setUser(prev => ({...prev, collectedCards: [...prev.collectedCards, sticker.id]}));
          }
      }
      if (dayCycle === 5) {
          // Item or Coins
          emeraldBonus = 100; // Simplified for now
      }
      if (dayCycle === 7) {
          // Skin or Big Coins
          if (!user.inventory.includes('skin_wolf_magic')) {
             setUser(prev => ({...prev, inventory: [...prev.inventory, 'skin_wolf_magic']}));
             rewardMessage = "VOCÊ GANHOU A SKIN: LOBO MÁGICO!";
             setVoucher(rewardMessage);
          } else {
             emeraldBonus = 150;
          }
      }
      
      setUser(prev => ({
          ...prev,
          emeralds: prev.emeralds + emeraldBonus,
          lastRewardClaimedDate: today
      }));
      
      playSFX('success');
      setShowDailyReward(false);
  };

  const handleUnlockAchievement = (ach: Achievement) => {
      setUser(prev => ({
          ...prev,
          achievements: [...prev.achievements, ach.id]
      }));
      setCurrentAchievement(ach);
  };

  const updateQuestProgress = (type: string, amount: number) => {
      setUser(prev => ({
          ...prev,
          dailyQuests: prev.dailyQuests.map(q => {
              if (q.type === type && !q.isClaimed) {
                  return { ...q, current: Math.min(q.target, q.current + amount) };
              }
              return q;
          })
      }));
  };

  const claimQuest = (id: string) => {
      const quest = user.dailyQuests.find(q => q.id === id);
      if (quest && quest.current >= quest.target && !quest.isClaimed) {
          playSFX('success');
          setUser(prev => ({
              ...prev,
              emeralds: prev.emeralds + quest.reward,
              dailyQuests: prev.dailyQuests.map(q => q.id === id ? { ...q, isClaimed: true } : q)
          }));
      }
  };

  const handleStartGame = (module: BiomeModule) => {
    const index = BIOMES.findIndex(b => b.id === module.id);
    const isLocked = index > 0 && !user.completedModules.includes(BIOMES[index-1].id);
    // Mini-games are always unlocked
    const isMiniGame = MINI_GAMES.some(m => m.id === module.id);

    if (isLocked && module.type !== ModuleType.BOSS && !isMiniGame) {
        playSFX('error');
        return;
    }
    
    playSFX('portal');
    setActiveModule(module);
    setView('GAME');
  };

  const handleGameComplete = (xpEarned: number, emeraldsEarned: number, learnedWords: string[], droppedCard?: string, newAdaptiveStats?: any) => {
    setUser(prev => {
        const newLearnedWords = Array.from(new Set([...prev.learnedWords, ...learnedWords]));
        const newCollectedCards = droppedCard ? [...prev.collectedCards, droppedCard] : prev.collectedCards;
        
        // Calculate Mascot Level
        const newMascotXp = (prev.mascotXp || 0) + xpEarned; 
        let newMascotLevel = prev.mascotLevel || 1;
        for(let i=0; i<MASCOT_THRESHOLDS.length; i++) {
            if(newMascotXp >= MASCOT_THRESHOLDS[i]) newMascotLevel = i + 1;
        }

        return {
            ...prev,
            xp: prev.xp + xpEarned,
            emeralds: prev.emeralds + emeraldsEarned,
            learnedWords: newLearnedWords,
            collectedCards: newCollectedCards,
            mascotXp: newMascotXp,
            mascotLevel: newMascotLevel,
            completedModules: activeModule && !MINI_GAMES.some(m => m.id === activeModule.id)
                ? [...new Set([...prev.completedModules, activeModule.id])] 
                : prev.completedModules,
            adaptiveStats: newAdaptiveStats || prev.adaptiveStats
        };
    });

    if (droppedCard) {
        setDroppedCardId(droppedCard);
    }
    
    setActiveModule(null);
    setView('MAP');
  };

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (user.emeralds >= item.price) {
        playSFX('success');
        
        // Equip immediately logic
        let updates: Partial<UserState> = {
            emeralds: user.emeralds - item.price,
            inventory: [...user.inventory, item.id]
        };

        if (item.category === 'WOLF_SKIN') updates.equippedWolfSkin = item.value as any;
        if (item.category === 'VOICE_EFFECT') updates.equippedVoiceEffect = item.value as any;
        if (item.category === 'THEME') updates.equippedTheme = item.value as any;

        setUser(prev => ({...prev, ...updates}));
        
        if (item.category === 'VOUCHER') {
            setVoucher(`VOCÊ GANHOU: ${item.name.toUpperCase()}`);
        }
        updateQuestProgress('EARN_EMERALDS', 0); 
    } else {
        playSFX('error');
        alert("ESMERALDAS INSUFICIENTES!");
    }
  };

  const toggleNightMode = () => {
      setUser(prev => ({
          ...prev,
          settings: { ...prev.settings, nightMode: !prev.settings.nightMode }
      }));
  };

  const toggleSound = () => {
      setUser(prev => ({
          ...prev,
          settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled }
      }));
  };

  const selectSkin = (skin: SkinType) => {
      playSFX('click');
      setUser(prev => ({ ...prev, skin }));
  };

  // --- VIEWS ---

  // Skin Selector
  if (user.xp === 0 && user.completedModules.length === 0 && view === 'HOME') {
       return (
          <div className="min-h-[100dvh] bg-stone-900 flex items-center justify-center p-4">
              <PixelCard title="ESCOLHA SEU PERSONAGEM" className="max-w-2xl w-full text-center">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                      {SKINS.map(skin => (
                          <div 
                            key={skin.id} 
                            onClick={() => selectSkin(skin.id)}
                            className={`cursor-pointer p-4 border-4 hover:scale-105 transition-transform ${user.skin === skin.id ? 'border-yellow-400 bg-white/10' : 'border-stone-600'}`}
                          >
                              <div className={`w-16 h-16 mx-auto mb-2 ${skin.color}`}></div>
                              <p className="text-white font-vt323 text-xl uppercase">{skin.label}</p>
                          </div>
                      ))}
                  </div>
                  <PixelButton onClick={() => setView('MAP')} className="w-full">CONFIRMAR</PixelButton>
              </PixelCard>
          </div>
      );
  }

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center flex-grow text-center space-y-8 animate-fade-in py-10 relative overflow-hidden w-full">
      {/* Living Map Background */}
      <div className={`absolute inset-0 -z-20 opacity-30 ${
        user.settings.nightMode || timeOfDay === 'NIGHT' ? 'animate-sky-night' :
        timeOfDay === 'MORNING' ? 'animate-sky-morning' : 
        'animate-sky-afternoon'
      }`}></div>
      {(timeOfDay === 'NIGHT' || user.settings.nightMode) && <div className="absolute inset-0 stars-bg -z-10 opacity-50"></div>}
      <WeatherOverlay type={weather} />
      
      {/* Event Banner */}
      <div className="absolute top-20 w-full bg-indigo-900/80 text-center py-1 border-y border-indigo-400 transform -rotate-1">
          <p className="text-indigo-200 uppercase text-sm animate-pulse">EVENTO: {weeklyEvent}</p>
      </div>
      
      <div className="animate-float mt-8">
          <h1 className="text-6xl md:text-8xl text-white drop-shadow-[4px_4px_0_#000] font-bold tracking-widest font-vt323 leading-none uppercase relative">
            MUNDO DA<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 animate-pulse-slow">LEITURA</span>
          </h1>
      </div>
      
      <Mascot mood="happy" nightMode={user.settings.nightMode || timeOfDay === 'NIGHT'} xp={user.mascotXp} level={user.mascotLevel} wolfSkin={user.equippedWolfSkin} inventory={user.inventory} />

      <div className="flex flex-col gap-4 w-full max-w-xs px-4 z-10">
          <PixelButton variant="primary" className="text-2xl py-6 px-12 w-full animate-pop-in" onClick={() => setView('MAP')}>
            INICIAR AVENTURA
          </PixelButton>
          <div className="grid grid-cols-2 gap-4">
            <PixelButton variant="secondary" onClick={() => setView('SHOP')} className="text-sm md:text-xl">
                🛒 LOJA
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => setView('EXTRAS')} className="text-sm md:text-xl bg-purple-700 border-purple-900 hover:bg-purple-600">
                🎮 JOGOS EXTRAS
            </PixelButton>
          </div>
           <PixelButton variant="secondary" onClick={() => setView('ALBUM')} className="text-sm md:text-xl w-full">
                🃏 MEU ÁLBUM
          </PixelButton>
          <div className="grid grid-cols-2 gap-4">
             <PixelButton variant="secondary" onClick={() => setView('PARENTS')} className="text-sm md:text-xl w-full">
                    👪 PAIS
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => setView('PROGRESS')} className="text-sm md:text-xl w-full">
                📈 PROGRESSO
            </PixelButton>
          </div>
      </div>
    </div>
  );

  const renderExtras = () => (
      <div className="max-w-4xl mx-auto pb-10 px-2">
          <button onClick={() => setView('HOME')} className="mb-4 text-white hover:underline uppercase">← VOLTAR AO INÍCIO</button>
          <h2 className="text-3xl md:text-4xl text-white uppercase text-center mb-8 border-b-4 border-white/20 pb-4">MINI-JOGOS EXTRAS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MINI_GAMES.map(game => (
                  <div key={game.id} onClick={() => handleStartGame(game)} className="cursor-pointer group relative overflow-hidden bg-stone-800 border-4 border-pink-500 rounded-lg p-6 hover:scale-105 transition-transform">
                      <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-2 py-1 font-bold">NOVO</div>
                      <div className="flex items-center gap-4">
                          <div className="text-5xl group-hover:animate-bounce">{game.icon}</div>
                          <div>
                              <h3 className="text-2xl text-pink-400 font-bold uppercase">{game.title}</h3>
                              <p className="text-gray-400 text-sm uppercase">{game.description}</p>
                          </div>
                      </div>
                  </div>
              ))}
              
              {/* Coming Soon Placeholder */}
              <div className="bg-stone-900 border-4 border-dashed border-stone-700 rounded-lg p-6 opacity-50 flex items-center gap-4">
                   <div className="text-5xl grayscale">🎈</div>
                   <div>
                       <h3 className="text-2xl text-gray-500 font-bold uppercase">ESTOURA BOLHAS</h3>
                       <p className="text-gray-600 text-sm uppercase">EM BREVE...</p>
                   </div>
              </div>
          </div>
      </div>
  );

  const renderMap = () => {
      const allMainBiomesComplete = BIOMES.every(b => user.completedModules.includes(b.id));
      
      return (
        <div className="w-full max-w-6xl mx-auto pb-12 flex flex-col md:flex-row gap-6">
           <div className="w-full md:w-3/4">
                <Mascot mood="neutral" nightMode={user.settings.nightMode || timeOfDay === 'NIGHT'} xp={user.mascotXp} level={user.mascotLevel} wolfSkin={user.equippedWolfSkin} inventory={user.inventory} />
                
                <div className="flex justify-between items-center mb-6 md:mb-8 text-white px-2">
                    <h2 className="text-3xl md:text-4xl drop-shadow-md uppercase">MAPA - {timeOfDay === 'MORNING' ? 'MANHÃ' : timeOfDay === 'AFTERNOON' ? 'TARDE' : 'NOITE'}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setView('WORD_WALL')} className="bg-stone-700 hover:bg-stone-600 border-b-4 border-stone-900 text-white px-3 py-1 rounded text-sm uppercase flex items-center gap-1 font-bold">
                            <BookOpen size={16} /> PALAVRAS
                        </button>
                        <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-green-800">
                            <span className="text-2xl animate-pulse-slow">💎</span>
                            <span className="text-2xl text-green-400">{user.emeralds}</span>
                        </div>
                    </div>
                </div>
                
                <div className="relative px-2">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-4 bg-stone-700 -z-10 transform -translate-y-1/2 hidden md:block border-y-2 border-black"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                        {BIOMES.map((biome, index) => {
                            const isPreviousCompleted = index === 0 || user.completedModules.includes(BIOMES[index-1].id);
                            const isCompleted = user.completedModules.includes(biome.id);
                            const isLocked = !isPreviousCompleted;

                            return (
                            <div key={biome.id} className="relative group w-full animate-pop-in" style={{animationDelay: `${index * 100}ms`}}>
                                <div 
                                    onClick={() => !isLocked && handleStartGame(biome)}
                                    className={`
                                        h-32 sm:h-40 md:h-48 w-full border-4 transition-all transform cursor-pointer flex flex-col items-center justify-center bg-stone-800
                                        ${isLocked ? 'border-stone-600 grayscale opacity-60' : `${biome.borderColor} active:scale-95 md:hover:-translate-y-2 md:hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                                        ${isCompleted ? 'ring-4 ring-yellow-400' : ''}
                                    `}
                                >
                                    <div className={`text-4xl md:text-6xl mb-2 ${!isLocked && 'animate-float'}`}>{biome.icon}</div>
                                    <div className="bg-black/70 w-full text-center text-white py-1 text-xs md:text-sm font-bold uppercase">
                                        {biome.title.split(':')[1]}
                                    </div>
                                    {isCompleted && <div className="absolute top-2 right-2 text-yellow-400 text-2xl animate-spin">★</div>}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* Boss Section */}
                {allMainBiomesComplete && (
                    <div className="mt-12 flex justify-center animate-pop-in">
                         <div 
                            onClick={() => handleStartGame(BOSS_BIOME)}
                            className={`w-full max-w-md h-48 bg-purple-900 border-8 border-purple-950 cursor-pointer relative overflow-hidden group hover:scale-105 transition-transform`}
                         >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                                <span className="text-6xl animate-bounce">🐲</span>
                                <h3 className="text-3xl font-bold uppercase mt-2 text-purple-200">DESAFIO FINAL</h3>
                                <p className="text-sm uppercase animate-pulse text-red-400">CLIQUE PARA ENFRENTAR!</p>
                            </div>
                         </div>
                    </div>
                )}
           </div>

           <div className="w-full md:w-1/4 flex flex-col gap-4">
                <QuestWidget quests={user.dailyQuests} onClaim={claimQuest} />
                {/* Mini Profile Summary */}
                <div className="bg-stone-800 border-4 border-stone-600 p-4 hidden md:block">
                    <h4 className="text-gray-400 uppercase mb-2 text-center">PERFIL</h4>
                    <div className="flex items-center gap-4 justify-center mb-2">
                        <div className={`w-12 h-12 ${SKINS.find(s=>s.id===user.skin)?.color}`}></div>
                        <div>
                            <div className="text-white uppercase">{user.name}</div>
                            <div className="text-green-400 text-sm uppercase">LVL {user.level}</div>
                            <div className="text-xs text-yellow-500 uppercase">PET LVL {user.mascotLevel}</div>
                        </div>
                    </div>
                </div>
           </div>
        </div>
      );
  };

  const renderWordWall = () => (
      <div className="max-w-4xl mx-auto pb-10 px-2">
          <button onClick={() => setView('MAP')} className="mb-4 text-white hover:underline uppercase">← VOLTAR AO MAPA</button>
          <h2 className="text-3xl md:text-4xl text-white uppercase text-center mb-8 border-b-4 border-white/20 pb-4">MURAL DE PALAVRAS</h2>
          
          {user.learnedWords.length === 0 ? (
              <div className="text-center text-gray-500 text-xl uppercase py-20 border-4 border-dashed border-gray-700">
                  VOCÊ AINDA NÃO APRENDEU NENHUMA PALAVRA.<br/>JOGUE PARA COMPLETAR O MURAL!
              </div>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {user.learnedWords.map((word, i) => (
                      <WordBlock key={i} word={word} />
                  ))}
              </div>
          )}
      </div>
  );

  const renderProgress = () => (
      <div className="max-w-4xl mx-auto pb-10 px-2">
           <button onClick={() => setView('HOME')} className="mb-4 text-white hover:underline uppercase">← VOLTAR AO INÍCIO</button>
           <PixelCard title="MEU PROGRESSO" className="bg-stone-900">
               <div className="grid md:grid-cols-2 gap-8 mt-4">
                   {/* Left Column */}
                   <div className="space-y-6">
                       <div className="flex items-center gap-4">
                            <div className={`w-24 h-24 border-4 border-white ${SKINS.find(s=>s.id===user.skin)?.color}`}></div>
                            <div>
                                <h3 className="text-2xl text-white uppercase">{user.name}</h3>
                                <div className="text-green-400 text-xl uppercase font-bold">NÍVEL {user.level}</div>
                            </div>
                       </div>
                       <XPBar current={user.xp} max={1000 * user.level} level={user.level} />
                       
                       <div className="grid grid-cols-2 gap-4 text-center">
                           <div className="bg-stone-800 p-4 border-2 border-stone-600">
                               <div className="text-4xl mb-2">💎</div>
                               <div className="text-2xl text-white font-bold">{user.emeralds}</div>
                               <div className="text-xs text-gray-400 uppercase">ESMERALDAS</div>
                           </div>
                           <div className="bg-stone-800 p-4 border-2 border-stone-600">
                               <div className="text-4xl mb-2">📚</div>
                               <div className="text-2xl text-white font-bold">{user.learnedWords.length}</div>
                               <div className="text-xs text-gray-400 uppercase">PALAVRAS</div>
                           </div>
                       </div>
                   </div>

                   {/* Right Column - Achievements */}
                   <div className="bg-stone-800 p-4 border-2 border-stone-600 max-h-[400px] overflow-y-auto">
                       <h4 className="text-yellow-400 uppercase border-b border-stone-700 mb-4 pb-2 flex items-center gap-2">
                           <Trophy size={20}/> CONQUISTAS
                       </h4>
                       <div className="space-y-4">
                           {ACHIEVEMENTS.map(ach => {
                               const unlocked = user.achievements.includes(ach.id);
                               return (
                                   <div key={ach.id} className={`flex items-center gap-4 p-2 rounded ${unlocked ? 'bg-green-900/30 border border-green-700' : 'opacity-50 grayscale'}`}>
                                       <div className="text-3xl">{ach.icon}</div>
                                       <div>
                                           <div className={`uppercase font-bold text-sm ${unlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</div>
                                           <div className="text-xs text-gray-400 uppercase">{ach.description}</div>
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
               </div>
           </PixelCard>
      </div>
  );

  const renderAlbum = () => (
      <div className="max-w-4xl mx-auto pb-10 px-2">
          <button onClick={() => setView('HOME')} className="mb-4 text-white hover:underline uppercase">← VOLTAR AO INÍCIO</button>
          <h2 className="text-3xl md:text-4xl text-white uppercase text-center mb-8 border-b-4 border-white/20 pb-4">ÁLBUM DE FIGURINHAS</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {COLLECTIBLE_CARDS.map((card) => {
                  const isOwned = user.collectedCards.includes(card.id);
                  if (isOwned) {
                      return <CardComponent key={card.id} card={card} />;
                  } else {
                      return (
                          <div key={card.id} className="w-32 h-48 md:w-40 md:h-56 border-4 border-dashed border-stone-700 bg-stone-900/50 rounded-lg flex flex-col items-center justify-center opacity-50">
                              <span className="text-3xl grayscale opacity-20">{card.image}</span>
                              <span className="text-xs text-stone-500 mt-2 uppercase">BLOQUEADO</span>
                          </div>
                      );
                  }
              })}
          </div>
      </div>
  );

  const renderPrizes = () => {
    const prizes = SHOP_ITEMS.filter(item => user.inventory.includes(item.id) && item.category === 'VOUCHER');
    
    return (
        <div className="max-w-4xl mx-auto pb-10 px-2">
            <button onClick={() => setView('HOME')} className="mb-4 text-white hover:underline uppercase">← VOLTAR AO INÍCIO</button>
            <h2 className="text-3xl md:text-4xl text-white uppercase text-center mb-8 border-b-4 border-white/20 pb-4">MEUS PRÊMIOS</h2>

            {prizes.length === 0 ? (
                <div className="text-center text-gray-500 text-xl uppercase py-20 border-4 border-dashed border-gray-700 bg-black/20">
                    <Gift size={48} className="mx-auto mb-4 opacity-50"/>
                    VOCÊ AINDA NÃO TEM NENHUM VALE.<br/>VISITE A LOJA PARA COMPRAR PRÊMIOS ESPECIAIS!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prizes.map((item, i) => (
                        <div key={i} className="animate-pop-in" style={{animationDelay: `${i*100}ms`}}>
                             <div className="bg-gradient-to-br from-yellow-700 to-yellow-900 border-4 border-yellow-500 p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-20"><Gift size={64}/></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="text-6xl bg-black/30 p-4 rounded border-2 border-yellow-400/30">{item.icon}</div>
                                    <div>
                                        <h3 className="text-2xl text-yellow-300 uppercase font-bold">{item.name}</h3>
                                        <p className="text-white uppercase text-sm mt-1 mb-2">{item.description}</p>
                                        <div className="bg-black/40 text-yellow-100 text-xs px-2 py-1 inline-block rounded uppercase">
                                            ITEM RARO
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-yellow-500/30 text-center text-yellow-200 text-xs uppercase">
                                    MOSTRE ESTE CARTÃO PARA RESGATAR SEU PRÊMIO!
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };

  const renderShop = () => {
      return (
          <div className="max-w-4xl mx-auto pb-10">
              <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('HOME')} className="text-white hover:underline uppercase text-sm md:text-base">← VOLTAR</button>
                    <h2 className="text-3xl md:text-4xl text-white uppercase">LOJA</h2>
                </div>
                <div className="text-2xl md:text-3xl text-green-400">💎 {user.emeralds}</div>
              </div>
    
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-2">
                  {SHOP_ITEMS.map(item => {
                      const owned = user.inventory.includes(item.id);
                      // Visual distinction for Vouchers
                      const isVoucher = item.category === 'VOUCHER';
                      const cardColor = isVoucher ? 'bg-indigo-900 border-indigo-700' : undefined;

                      return (
                          <PixelCard key={item.id} color={isVoucher ? 'bg-slate-800' : undefined} className={`flex flex-col items-center text-center h-full justify-between ${isVoucher ? 'border-indigo-500' : ''}`}>
                              <div>
                                {isVoucher && <div className="text-xs text-yellow-400 uppercase font-bold mb-2 tracking-widest">⭐ PRÊMIO REAL</div>}
                                <div className="text-5xl md:text-6xl mb-4 animate-float">{item.icon}</div>
                                <h3 className={`text-xl md:text-2xl mb-2 uppercase ${isVoucher ? 'text-indigo-300' : 'text-yellow-300'}`}>{item.name}</h3>
                                <p className="text-gray-400 text-xs md:text-sm mb-4 min-h-[40px] uppercase">{item.description}</p>
                              </div>
                              <PixelButton 
                                disabled={owned || user.emeralds < item.price}
                                onClick={() => handleBuy(item)}
                                className={`w-full text-sm py-3 ${owned ? 'bg-gray-600' : isVoucher ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800' : ''}`}
                              >
                                  {owned ? (isVoucher ? 'RESGATADO' : 'COMPRADO') : `${item.price} 💎`}
                              </PixelButton>
                          </PixelCard>
                      );
                  })}
              </div>
    
              {voucher && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setVoucher(null)}>
                      <div className="bg-stone-900 p-6 md:p-8 max-w-sm w-full text-center border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] animate-pop-in relative">
                          <div className="absolute -top-6 -left-6 text-6xl animate-bounce">🎁</div>
                          <div className="absolute -bottom-6 -right-6 text-6xl animate-bounce delay-100">🎁</div>
                          <h3 className="text-3xl font-bold mb-4 text-yellow-400 uppercase">PARABÉNS!</h3>
                          <p className="text-xl mb-6 uppercase text-white">{voucher}</p>
                          <p className="text-sm text-gray-400 uppercase">VEJA NA ABA "MEUS PRÊMIOS"</p>
                          <button className="mt-4 bg-green-600 hover:bg-green-500 text-white border-b-4 border-green-800 py-2 px-6 text-lg uppercase font-bold rounded">FECHAR</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col relative overflow-x-hidden font-vt323 text-base md:text-lg transition-colors duration-1000 ${user.settings.nightMode || timeOfDay === 'NIGHT' ? 'bg-slate-900 text-slate-100' : 'bg-[#1a1a1a] text-white'}`}>
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      ></div>

      {/* MODALS */}
      {showDailyReward && (
          <DailyRewardModal day={user.loginStreak} onClose={handleClaimDailyReward} />
      )}

      {droppedCardId && (
         <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4" onClick={() => setDroppedCardId(null)}>
             <div className="flex flex-col items-center animate-pop-in">
                 <h2 className="text-4xl text-yellow-400 font-bold mb-8 uppercase animate-bounce">NOVA CARTA ENCONTRADA!</h2>
                 <div className="transform scale-125 mb-8">
                     <CardComponent card={COLLECTIBLE_CARDS.find(c => c.id === droppedCardId)!} isNew={true} />
                 </div>
                 <p className="text-gray-400 uppercase text-lg">CLIQUE PARA FECHAR</p>
             </div>
         </div>
      )}

      {currentAchievement && (
          <AchievementPopup 
            achievement={currentAchievement} 
            onClose={() => setCurrentAchievement(null)} 
          />
      )}

      {/* Navbar */}
      <nav className={`relative z-20 border-b-4 p-3 md:p-4 sticky top-0 shadow-xl ${user.settings.nightMode || timeOfDay === 'NIGHT' ? 'bg-slate-800 border-slate-900' : 'bg-stone-900 border-stone-700'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <button onClick={() => setView('HOME')} className="text-yellow-400 text-xl md:text-2xl font-bold flex items-center gap-2 hover:text-yellow-300 group">
             <div className="w-8 h-8 bg-green-600 border-2 border-green-400 block relative overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                 <div className={`w-full h-full ${SKINS.find(s=>s.id===user.skin)?.color || 'bg-cyan-600'}`}></div>
             </div>
             <span className="hidden xs:inline uppercase">MUNDO DA LEITURA</span>
             <span className="xs:hidden uppercase">MUNDO</span>
           </button>

           <div className="flex gap-2 md:gap-4 items-center">
              {/* Settings Toggles */}
              <div className="flex gap-1 mr-2 border-r border-gray-600 pr-2">
                  <ToggleButton isOn={user.settings.nightMode} onToggle={toggleNightMode} onIcon={<Sun size={16}/>} offIcon={<Moon size={16}/>} />
                  <ToggleButton isOn={user.settings.soundEnabled} onToggle={toggleSound} onIcon={<Volume2 size={16}/>} offIcon={<VolumeX size={16}/>} />
              </div>

              {view !== 'HOME' && (
                  <button onClick={() => setView('MAP')} className="text-white hover:text-green-400 p-2"><MapIcon size={24} /></button>
              )}
              {view !== 'HOME' && (
                  <button onClick={() => setView('SHOP')} className="text-white hover:text-yellow-400 p-2"><ShoppingCart size={24} /></button>
              )}
           </div>
        </div>
      </nav>

      <main className="relative z-10 flex-grow p-4 md:p-8 flex flex-col w-full">
        {view === 'HOME' && renderHome()}
        {view === 'MAP' && renderMap()}
        {view === 'SHOP' && renderShop()}
        {view === 'ALBUM' && renderAlbum()}
        {view === 'EXTRAS' && renderExtras()}
        {view === 'WORD_WALL' && renderWordWall()}
        {view === 'PROGRESS' && renderProgress()}
        {view === 'PRIZES' && renderPrizes()}
        {view === 'GAME' && activeModule && (
          <GameArena 
            module={activeModule} 
            level={user.level} 
            onComplete={handleGameComplete} 
            onExit={() => setView('MAP')} 
            onUnlockAchievement={handleUnlockAchievement}
            onUpdateQuest={updateQuestProgress}
            currentAchievements={user.achievements}
            userStats={user}
            nightMode={user.settings.nightMode || timeOfDay === 'NIGHT'}
            soundEnabled={user.settings.soundEnabled}
            timeOfDay={timeOfDay}
          />
        )}
        {view === 'PARENTS' && <ParentPortal onBack={() => setView('HOME')} />}
      </main>
      
      {/* Admin Modal Logic */}
      <button onClick={() => setShowAdmin(!showAdmin)} className="fixed bottom-4 right-4 text-white/10 hover:text-white/50 p-4 z-50">
          <Lock size={20} />
      </button>

      {showAdmin && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-stone-800 p-8 border-4 border-white w-full max-w-sm">
                  <h3 className="text-white mb-4 text-xl uppercase">ÁREA RESTRITA</h3>
                  <input 
                    type="password" 
                    value={adminInput}
                    onChange={(e) => setAdminInput(e.target.value)}
                    className="p-3 mb-4 bg-black text-white border-2 border-stone-500 block w-full text-lg uppercase"
                    placeholder="SENHA"
                    autoFocus
                  />
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <PixelButton onClick={() => {
                        if (adminInput === '2010') {
                            setUser(prev => ({ ...prev, emeralds: 9999, completedModules: BIOMES.map(b => b.id) }));
                            setShowAdmin(false);
                            alert("MODO CRIATIVO ATIVADO!");
                        } else alert("SENHA INCORRETA");
                    }} className="w-full">ENTRAR</PixelButton>
                    <PixelButton variant="danger" onClick={() => setShowAdmin(false)} className="w-full">FECHAR</PixelButton>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
