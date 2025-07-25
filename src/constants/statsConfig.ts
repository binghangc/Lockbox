export const THEMES = [
  'funny',
  'emotional',
  'nostalgic',
  'reflective',
  'aesthetic',
  'chaotic',
  'vulnerable',
  'romantic',
  'unfiltered',
  'wholesome',
  'yums',
] as const;

export type ThemeKey = (typeof THEMES)[number];

export const THEME_CONFIG: Record<
  ThemeKey,
  {
    emoji: string;
    label: string;
    description?: string; // optional
  }
> = {
  funny: {
    emoji: '🤣',
    label: 'Funny',
    description: 'Moments that made you burst out laughing.',
  },
  emotional: {
    emoji: '🥺',
    label: 'Emotional',
    description: 'Heartfelt or tearjerking vibes.',
  },
  nostalgic: {
    emoji: '📼',
    label: 'Nostalgic',
    description: 'Throwbacks and memories.',
  },
  reflective: {
    emoji: '🪞',
    label: 'Reflective',
    description: 'Deep thoughts, introspection, and growth.',
  },
  aesthetic: {
    emoji: '🎨',
    label: 'Aesthetic',
    description: 'Visual perfection and vibes.',
  },
  chaotic: {
    emoji: '🎢',
    label: 'Chaotic',
    description: 'Unpredictable and high-energy moments.',
  },
  vulnerable: {
    emoji: '🫶',
    label: 'Vulnerable',
    description: 'Open, honest, and real.',
  },
  romantic: {
    emoji: '💘',
    label: 'Romantic',
    description: 'Sweet dates, flirty energy, and love in the air.',
  },
  unfiltered: {
    emoji: '📸',

    label: 'Unfiltered',
    description: 'Raw and candid takes.',
  },
  wholesome: {
    emoji: '🧸',
    label: 'Wholesome',
    description: 'Soft, gentle, and feel-good content.',
  },
  yums: {
    emoji: '🍜',
    label: 'Yums',
    description: 'Delicious eats and foodie finds.',
  },
};

export const VIBE_CLUSTER_CONFIG: Record<
  string,
  { emoji: string; tagline: string; glowColor: string }
> = {
  'Dreamy Chill': {
    emoji: '🌙✨',
    tagline: 'Laid-back vibes and stargazing feels.',
    glowColor: '#60a5fa',
  },
  'Chaotic Fun': {
    emoji: '🎉🔥',
    tagline: 'Unhinged energy. You lived a little.',
    glowColor: '#fb7185',
  },
  'Reflective Quiet': {
    emoji: '🪞🌲',
    tagline: 'Deep thoughts and tranquil moments.',
    glowColor: '#818cf8',
  },
  'Romantic Escape': {
    emoji: '💘🌅',
    tagline: 'A trip straight out of a love song.',
    glowColor: '#f472b6',
  },
  'Adventure Rush': {
    emoji: '🏔️⚡',
    tagline: 'Action-packed and adrenaline-fueled.',
    glowColor: '#eab308',
  },
};
