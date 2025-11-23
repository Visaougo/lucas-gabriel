
import { AdaptiveStats, UserState } from '../types';

export const INITIAL_ADAPTIVE_STATS: AdaptiveStats = {
    errorCount: {},
    averageResponseTime: 5000, // Start with 5s baseline
    totalQuestions: 0,
    difficultyMultiplier: 1.0
};

// Called after every question answer
export const updateAdaptiveStats = (
    currentStats: AdaptiveStats, 
    isCorrect: boolean, 
    responseTimeMs: number, 
    contentId?: string
): AdaptiveStats => {
    const newStats = { ...currentStats };
    newStats.totalQuestions++;

    // Rolling average for response time
    newStats.averageResponseTime = (newStats.averageResponseTime * 0.9) + (responseTimeMs * 0.1);

    if (!isCorrect && contentId) {
        // Track specific error types (simplified by using content ID or word structure)
        // In a real app, we'd analyze if it's a "Complex Syllable" or "Simple Syllable"
        const key = contentId.split('_')[0] || 'general';
        newStats.errorCount[key] = (newStats.errorCount[key] || 0) + 1;
    }

    // Adjust Difficulty Multiplier
    // If getting right very fast -> Harder
    // If getting wrong or very slow -> Easier
    if (isCorrect) {
        if (responseTimeMs < 3000) {
            newStats.difficultyMultiplier = Math.min(1.5, newStats.difficultyMultiplier + 0.05);
        }
    } else {
        newStats.difficultyMultiplier = Math.max(0.7, newStats.difficultyMultiplier - 0.1);
    }

    return newStats;
};

export const getDifficultyPromptModifier = (stats: AdaptiveStats): string => {
    if (stats.difficultyMultiplier > 1.2) {
        return " Include slightly more complex words with complex syllables (LH, NH, TR, PL).";
    } else if (stats.difficultyMultiplier < 0.9) {
        return " Use very simple CV (Consonant-Vowel) words only. Avoid complex digraphs.";
    }
    return "";
};
