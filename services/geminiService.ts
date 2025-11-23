import { GoogleGenAI, Type } from "@google/genai";
import { ModuleType } from '../types';
import { 
  FALLBACK_SYLLABLES, 
  FALLBACK_FLUENCY, 
  FALLBACK_COMPREHENSION, 
  FALLBACK_CREEPER, 
  FALLBACK_LETTERS,
  FALLBACK_STORIES,
  FALLBACK_FLASHLIGHT
} from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Simple in-memory cache
const contentCache: Record<string, any[]> = {};

// Helper to force uppercase on all string fields in the response
const enforceUppercase = (data: any[], type: ModuleType): any[] => {
  return data.map(item => {
    const newItem = { ...item };
    
    if (newItem.word) newItem.word = newItem.word.toUpperCase();
    if (newItem.fullText) newItem.fullText = newItem.fullText.toUpperCase();
    if (newItem.sentence) newItem.sentence = newItem.sentence.toUpperCase();
    if (newItem.targetWord) newItem.targetWord = newItem.targetWord.toUpperCase();
    if (newItem.title) newItem.title = newItem.title.toUpperCase();
    
    if (newItem.syllables) newItem.syllables = newItem.syllables.map((s: string) => s.toUpperCase());
    if (newItem.distractors) newItem.distractors = newItem.distractors.map((s: string) => s.toUpperCase());
    if (newItem.chunks) newItem.chunks = newItem.chunks.map((s: string) => s.toUpperCase());
    
    if (newItem.options) {
      newItem.options = newItem.options.map((opt: any) => ({
        ...opt,
        label: opt.label ? opt.label.toUpperCase() : undefined,
        text: opt.text ? opt.text.toUpperCase() : undefined
      }));
    }

    if (newItem.hiddenWords) {
        newItem.hiddenWords = newItem.hiddenWords.map((hw: any) => ({
            ...hw,
            word: hw.word ? hw.word.toUpperCase() : ''
        }));
    }

    if (newItem.pages) {
        newItem.pages = newItem.pages.map((p: any) => ({
            ...p,
            text: p.text ? p.text.toUpperCase() : ''
        }));
    }

    if (newItem.quiz && newItem.quiz.question) {
        newItem.quiz.question = newItem.quiz.question.toUpperCase();
        if (newItem.quiz.options) {
             newItem.quiz.options = newItem.quiz.options.map((o: any) => ({
                 ...o,
                 text: o.text ? o.text.toUpperCase() : ''
             }));
        }
    }
    
    return newItem;
  });
};

export const generateGameContent = async (moduleType: ModuleType, level: number): Promise<any[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, using fallback data.");
    return getFallbackData(moduleType);
  }

  const cacheKey = `${moduleType}_${level}`;
  if (contentCache[cacheKey]) {
    return contentCache[cacheKey];
  }

  const modelId = "gemini-2.5-flash";
  let prompt = "";
  let responseSchema: any;

  // Science of Reading focused prompts - EXPLICITLY REQUESTING UPPERCASE
  switch (moduleType) {
    case ModuleType.LETTERS:
        prompt = `Generate 5 simple Portuguese words (3-5 letters) for a spelling game. Provide the word and an emoji. OUTPUT UPPERCASE. Format: JSON.`;
        responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    word: { type: Type.STRING },
                    emoji: { type: Type.STRING }
                },
                required: ["id", "word", "emoji"]
            }
        };
        break;

    case ModuleType.SYLLABLES:
      prompt = `Generate 5 Portuguese words suitable for children learning to read. Break them into syllables. Provide correct syllables and 2-3 distractor syllables that sound similar but are incorrect. Include an emoji for the word. OUTPUT EVERYTHING IN UPPERCASE. Format: JSON.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            word: { type: Type.STRING },
            emoji: { type: Type.STRING },
            syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
            distractors: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "word", "emoji", "syllables", "distractors"]
        }
      };
      break;

    case ModuleType.FLUENCY:
      prompt = `Generate 5 simple Portuguese sentences for reading fluency practice. Break each sentence into 2-4 natural prosodic chunks (phrasing). OUTPUT EVERYTHING IN UPPERCASE. Format: JSON.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            fullText: { type: Type.STRING },
            chunks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "fullText", "chunks"]
        }
      };
      break;

    case ModuleType.COMPREHENSION:
      prompt = `Generate 5 short riddles or simple instructions in Portuguese for a child. E.g., "I provide wool." -> Sheep. Provide 3 options (one correct) represented by an emoji and a label. OUTPUT EVERYTHING IN UPPERCASE. Format: JSON.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            sentence: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  emoji: { type: Type.STRING },
                  label: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN }
                },
                required: ["emoji", "label", "isCorrect"]
              }
            }
          },
          required: ["id", "sentence", "options"]
        }
      };
      break;

    case ModuleType.CREEPER:
      prompt = `Generate 10 simple Portuguese nouns (animals, nature, objects) for rapid reading. Provide the word and 3 emoji options (1 correct). OUTPUT EVERYTHING IN UPPERCASE. Format: JSON.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            word: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  emoji: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN }
                },
                required: ["emoji", "isCorrect"]
              }
            }
          },
          required: ["id", "word", "options"]
        }
      };
      break;
    
    case ModuleType.STORY:
      prompt = `Generate a short story for 6-year-old kids in Portuguese. Title, 3 pages with text and matching emoji. A quiz at the end. OUTPUT UPPERCASE. Format: JSON.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            pages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  image: { type: Type.STRING },
                  animation: { type: Type.STRING }
                },
                required: ["text", "image"]
              }
            },
            quiz: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      isCorrect: { type: Type.BOOLEAN }
                    },
                    required: ["text", "isCorrect"]
                  }
                }
              },
              required: ["question", "options"]
            }
          },
          required: ["id", "title", "pages", "quiz"]
        }
      };
      break;

    case ModuleType.FLASHLIGHT:
      prompt = `Generate a "Find the Word" game level in Portuguese. Target word (uppercase) and 5 hidden words with X/Y positions (0-80). One hidden word MUST be the target. Others are distractors. Format: JSON.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            targetWord: { type: Type.STRING },
            hiddenWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  isTarget: { type: Type.BOOLEAN }
                },
                required: ["word", "x", "y", "isTarget"]
              }
            }
          },
          required: ["id", "targetWord", "hiddenWords"]
        }
      };
      break;

    default:
      return getFallbackData(moduleType);
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a teacher for 6-year-old children playing a Minecraft educational game. Use simple vocabulary. OUTPUT ALL TEXT IN UPPERCASE PORTUGUESE (LETRAS MAIÚSCULAS). Ensure JSON is valid.",
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (text) {
      let data = JSON.parse(text);
      // Extra safety: Force Uppercase in code
      data = enforceUppercase(data, moduleType);
      
      contentCache[cacheKey] = data;
      return data;
    }
    return getFallbackData(moduleType);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackData(moduleType);
  }
};

function getFallbackData(type: ModuleType): any[] {
  switch (type) {
    case ModuleType.LETTERS: return FALLBACK_LETTERS;
    case ModuleType.SYLLABLES: return FALLBACK_SYLLABLES;
    case ModuleType.FLUENCY: return FALLBACK_FLUENCY;
    case ModuleType.COMPREHENSION: return FALLBACK_COMPREHENSION;
    case ModuleType.CREEPER: return FALLBACK_CREEPER;
    case ModuleType.STORY: return FALLBACK_STORIES;
    case ModuleType.FLASHLIGHT: return FALLBACK_FLASHLIGHT;
    default: return [];
  }
}