
// Helper to split a Portuguese word into syllables (Heuristic based for PT-BR)
const syllabifyWord = (word: string): string[] => {
    if (!word) return [];
    
    let w = word.toLowerCase();
    
    // 1. Placeholder for inseparable digraphs to avoid splitting them (lh, nh, ch, qu, gu)
    // We replace them with temporary tokens that act as single consonants
    w = w.replace(/lh/g, '£');
    w = w.replace(/nh/g, '¢');
    w = w.replace(/ch/g, '§');
    w = w.replace(/qu/g, '¬');
    w = w.replace(/gu/g, 'µ');

    // 2. Separate specific digraphs (rr, ss, sc, sç, xc)
    // We put a placeholder separator '-' between them
    w = w.replace(/rr/g, 'r-r');
    w = w.replace(/ss/g, 's-s');
    w = w.replace(/sc/g, 's-c');
    w = w.replace(/sç/g, 's-ç');
    w = w.replace(/xc/g, 'x-c');

    // 3. Main Syllabification Logic (Regex Heuristic for CV patterns)
    // Matches: (Consonants)(Vowels)(FinalConsonants like R, S, L, M, N, Z)
    // This is an approximation. Portuguese is complex (hiatus vs diphthong).
    // For literacy games (simple words), this covers 95% of cases.
    
    const syllableRegex = /((?:[^aeiouyáéíóúâêîôûãõàü£¢§¬µ\s-]*[£¢§¬µ])|[^aeiouyáéíóúâêîôûãõàü£¢§¬µ\s-]*)?([aeiouyáéíóúâêîôûãõàü]+(?:[iu])?)(?:[nsrzxlm](?![aeiouyáéíóúâêîôûãõàü]))?/gi;
    
    // Split based on the regex marks, but respecting the separators we added
    // A simpler approach for the game: Insert a separator before every Consonant-Vowel group,
    // unless it's the start of the word.
    
    // Revert placeholders to original chars for processing
    const restore = (str: string) => {
        return str
            .replace(/£/g, 'lh')
            .replace(/¢/g, 'nh')
            .replace(/§/g, 'ch')
            .replace(/¬/g, 'qu')
            .replace(/µ/g, 'gu');
    };

    // Manual Loop method is often safer for custom logic than complex regex splitting
    let syllables: string[] = [];
    let currentPart = "";
    
    // Simple pass: Split by '-' first (from rr, ss)
    const parts = w.split('-');
    
    parts.forEach(part => {
        // Apply CV regex to each part
        const matches = part.match(syllableRegex);
        if (matches) {
            syllables.push(...matches);
        } else if (part) {
            syllables.push(part); // Fallback
        }
    });

    // Restore characters and fix case
    return syllables.map(s => restore(s).toUpperCase());
};

export const splitSentenceIntoSyllables = (sentence: string): string[] => {
    if (!sentence) return [];
    
    const words = sentence.trim().split(/\s+/);
    let allSyllables: string[] = [];

    words.forEach((word, index) => {
        // 1. Separate Punctuation safely
        // Match word ending with any punctuation
        const match = word.match(/^(.+?)([\.,!?;:]*)$/);
        
        let cleanWord = word;
        let punctuation = "";

        if (match) {
            cleanWord = match[1];
            punctuation = match[2];
        }

        // 2. Syllabify the clean text
        const syllables = syllabifyWord(cleanWord);
        
        // 3. Re-attach punctuation to the last syllable
        if (punctuation && syllables.length > 0) {
            syllables[syllables.length - 1] += punctuation;
        } else if (punctuation && syllables.length === 0) {
             // Case where the "word" was just punctuation
             syllables.push(punctuation);
        }

        allSyllables = [...allSyllables, ...syllables];
        
        // 4. Add a space token to preserve sentence structure in the UI
        if (index < words.length - 1) {
            allSyllables.push(" ");
        }
    });

    return allSyllables;
};
