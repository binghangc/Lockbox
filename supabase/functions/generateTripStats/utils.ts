/**
 * Helper functions for generateTripStats
 */
export function countTags(arr: string[][]): string[] {
  const tagCount = new Map<string, number>();
  arr.flat().forEach(tag => tag && tagCount.set(tag, (tagCount.get(tag) || 0) + 1));
  return [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag]) => tag);
}

export function countThemes(themes: string[]) {
  const map = new Map<string, number>();
  for (const t of themes) {
    if (t) map.set(t, (map.get(t) || 0) + 1);
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return { mostCommon: sorted[0]?.[0] ?? null, distribution: Object.fromEntries(map) };
}

export function extractTopWords(texts: string[], stopwords: Set<string>): string[] {
  const count = new Map<string, number>();
  for (const text of texts) {
    for (const word of text.toLowerCase().split(/\W+/)) {
      if (word && !stopwords.has(word) && word.length > 2) {
        count.set(word, (count.get(word) || 0) + 1);
      }
    }
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

export function groupThemes(themes: string[]): string[] {
  const themeCounts = countThemes(themes).distribution;

  const groups: Record<string, string[]> = {
    'Dreamy Chill': ['romantic', 'aesthetic', 'wholesome'],
    'Chaotic Fun': ['funny', 'chaotic', 'yums'],
    'Reflective Growth': ['reflective', 'vulnerable', 'nostalgic'],
  };

  const groupScores = Object.entries(groups).map(([label, tagList]) => {
    const score = tagList.reduce((sum, tag) => sum + (themeCounts[tag] ?? 0), 0);
    return { label, score };
  });

  return groupScores
    .filter(g => g.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(g => g.label);
}

export function classifyArchetype(activities: string[], locations: string[], overallVibe: string | null): string {
  const has = (list: string[], tags: string[]) => tags.some(tag => list.includes(tag));

  if (has(activities, ['hike', 'trail', 'camp']) || has(locations, ['mountain', 'lake', 'forest'])) {
    return 'Nature Retreat';
  }

  if (has(activities, ['food', 'cooking', 'cafe']) || has(locations, ['restaurant', 'market'])) {
    return 'Foodie Adventure';
  }

  if (has(activities, ['shopping', 'mall', 'souvenir'])) {
    return 'Retail Therapy Trip';
  }

  if (has(activities, ['museum', 'gallery', 'exhibition']) || has(locations, ['historic site', 'castle'])) {
    return 'Culture Dive';
  }

  if (has(activities, ['skiing', 'snowboarding', 'surfing', 'climbing'])) {
    return 'Thrill Seeker';
  }

  if (has(activities, ['spa', 'massage', 'yoga'])) {
    return 'Wellness Escape';
  }

  if (has(activities, ['bar', 'club', 'karaoke']) || overallVibe === 'chaotic') {
    return 'Party Mode';
  }

  if (overallVibe === 'romantic') {
    return 'Romantic Getaway';
  }

  if (overallVibe === 'reflective' || overallVibe === 'nostalgic') {
    return 'Soul Searcher';
  }

  if (overallVibe === 'funny' || has(activities, ['game', 'funfair'])) {
    return 'Goofball Tour';

  }

  return 'Mixed Exploration';
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}