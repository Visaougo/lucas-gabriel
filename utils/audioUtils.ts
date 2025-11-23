
import { VoiceEffectType } from '../types';

// Audio Context Singleton to prevent multiple contexts
let audioCtx: AudioContext | null = null;
let globalConfig = {
    isNightMode: false
};

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const setAudioConfig = (config: { isNightMode: boolean }) => {
    globalConfig = { ...globalConfig, ...config };
};

// --- SYNTHESIZED SFX ---

export const playSFX = (type: 'click' | 'success' | 'error' | 'pop' | 'wolf_howl' | 'confirm' | 'chest_open' | 'portal' | 'step' | 'secret' | 'wake') => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Calm Mode: Reduce volume significantly
    const volumeMultiplier = globalConfig.isNightMode ? 0.4 : 1.0;

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.3 * volumeMultiplier, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'confirm':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.2 * volumeMultiplier, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'success':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1); // C#
        osc.frequency.setValueAtTime(659, now + 0.2); // E
        gainNode.gain.setValueAtTime(0.1 * volumeMultiplier, now);
        gainNode.gain.linearRampToValueAtTime(0.1 * volumeMultiplier, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.2 * volumeMultiplier, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      
      case 'wolf_howl':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        osc.frequency.linearRampToValueAtTime(300, now + 1.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3 * volumeMultiplier, now + 0.4);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
        break;

      case 'chest_open':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.5);
        gainNode.gain.setValueAtTime(0.3 * volumeMultiplier, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'portal':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 1.5);
        // LFO effect simulation
        gainNode.gain.setValueAtTime(0.2 * volumeMultiplier, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
        break;

      case 'secret':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.1);
        osc.frequency.setValueAtTime(2000, now + 0.2);
        gainNode.gain.setValueAtTime(0.1 * volumeMultiplier, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      
      case 'wake':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.3);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2 * volumeMultiplier, now + 0.2);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      
      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.3 * volumeMultiplier, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'step':
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < ctx.sampleRate * 0.1; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.connect(gainNode);
        gainNode.gain.setValueAtTime(0.05 * volumeMultiplier, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        whiteNoise.start(now);
        break;
    }
  } catch (e) {
    console.error("Audio SFX Error:", e);
  }
};

// --- TTS MANAGER ---

export const speakText = (text: string, isWolf = false, effect: VoiceEffectType = 'NORMAL') => {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  // Personalization Injection
  const finalText = text; 

  const utterance = new SpeechSynthesisUtterance(finalText);
  utterance.lang = 'pt-BR';
  
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.includes('pt-BR') && (v.name.includes('Google') || v.name.includes('Luciana')));
  
  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  // Base configurations
  utterance.pitch = 1.0;
  utterance.rate = 1.0;

  if (isWolf) {
    utterance.pitch = 0.8; 
    utterance.rate = 0.9;
  }

  // Calm Mode adjustments
  if (globalConfig.isNightMode) {
      utterance.volume = 0.6;
      utterance.rate = utterance.rate * 0.9;
  }

  // Apply Effects
  switch (effect) {
      case 'ROBOT':
          utterance.pitch = 0.5;
          utterance.rate = 0.8;
          break;
      case 'HIGH':
          utterance.pitch = 1.6;
          utterance.rate = 1.1;
          break;
      case 'ECHO':
          utterance.pitch = 0.6;
          utterance.rate = 0.7;
          break;
      case 'NORMAL':
      default:
          break;
  }

  window.speechSynthesis.speak(utterance);
};
