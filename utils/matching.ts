
/**
 * Advanced Matching & Reordering Logic
 */

export const NORMALIZATION_RULES: Record<string, string> = {
  'kg': 'kilogram',
  'g': 'gram',
  'ml': 'milliliter',
  'l': 'liter',
  'pu': 'polyurethane',
  'qty': 'quantity',
  'pcs': 'pieces',
};

const STOP_WORDS = new Set(['premium', 'high', 'quality', 'original', 'authentic', 'top', 'grade', 'the', 'and', 'for', 'with']);

export const normalizeText = (text: string): string[] => {
  if (!text) return [];
  
  // 1. Lowercase and remove special characters
  let clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  
  // 2. Tokenize
  let tokens = clean.split(/\s+/).filter(t => t.length > 0);
  
  // 3. Standardize units and abbreviations
  tokens = tokens.map(t => NORMALIZATION_RULES[t] || t);
  
  // 4. Remove marketing fluff
  tokens = tokens.filter(t => !STOP_WORDS.has(t));
  
  // 5. Sort keywords by "Importance" 
  // Simplified logic: longer words or alphanumeric combinations often denote material/size
  return tokens.sort((a, b) => {
    const isNumA = /\d/.test(a);
    const isNumB = /\d/.test(b);
    if (isNumA && !isNumB) return -1;
    if (!isNumA && isNumB) return 1;
    return b.length - a.length;
  });
};

export const calculateSimilarity = (tokensA: string[], tokensB: string[]): number => {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  let intersection = 0;
  setA.forEach(token => {
    if (setB.has(token)) intersection++;
  });
  
  const union = new Set([...tokensA, ...tokensB]).size;
  
  // Jaccard similarity
  return (intersection / union) * 100;
};
