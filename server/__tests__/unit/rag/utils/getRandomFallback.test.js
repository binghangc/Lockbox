const {
  getRandomFallback,
} = require('../../../../rag/utils/getRandomFallback.js');

const FALLBACK_VIBECHECKS = {
  funny: [
    'Tripped over vibes, kept walking 😎',
    'We lost the map but found snacks',
    'Shirts were optional. Regret was not.',
    'Wrong train, right memories',
    'That wasn’t water. That was vodka.',
  ],
  emotional: [
    'Didn’t cry… until the sunset hit',
    'Heart felt full. Then spilled over.',
    'That hug fixed 12 years of trauma',
    'Eyes watery. Voice steady.',
    'Heard laughter and remembered I’m alive',
  ],
  nostalgic: [
    'Felt like childhood on rewind',
    'Deja vu but make it bittersweet',
    'Smelled a memory I forgot I had',
    'Wish I could bottle this moment',
    'Summer 2008 energy',
  ],
  reflective: [
    'This walk made my brain shut up',
    'Peace looks like this, I think',
    'Had a convo with my past self',
    'Realized I’ve grown. Quietly proud.',
    'No WiFi. Just thoughts and sky.',
  ],
  aesthetic: [
    'Felt like a music video moment',
    'Soft lighting. Softer smile.',
    'Captured this for my photo dump',
    'Moodboard vibes, no filter needed',
    'Glowy. Grainy. Gorgeous.',
  ],
  chaotic: [
    'Bag count: spiritually bankrupt',
    'Unexpected detour = instant chaos',
    'Fell mid-selfie. Iconic.',
    'Vibes switched mid-sentence and we ran',
    'Didn’t plan it. Did it anyway.',
  ],
  vulnerable: [
    'Said it out loud. Felt lighter.',
    'Didn’t hide the real me today',
    'Shared too much and it felt right',
    'Eyes puffy. Heart open.',
    'Spoke my truth. Shook a little.',
  ],
  romantic: [
    'Brushed hands. Said nothing. Smiled.',
    'Kissed mid-laugh. Cinematic.',
    'Shared an umbrella = married now',
    'Looked at me like poetry.',
    'Slow dance in the rain energy',
  ],
  unfiltered: [
    'No chill. All me.',
    'Said what I meant for once',
    'Too tired to pretend',
    'Overshared. Over it.',
    'No thoughts, just impulse',
  ],
  wholesome: [
    'All hands in = we’re bonded',
    'They remembered my order 🥹',
    'Felt held, not just hugged',
    'Group nap. Core memory.',
    'Laughed so hard I couldn’t breathe',
  ],
  yums: [
    'Spilled boba. Shed a tear.',
    'Too spicy. Ate more.',
    'First bite? I transcended.',
    'Cheese pull changed my life',
    'Crunchy. Creamy. Crying.',
  ],
};

describe('getRandomFallback', () => {
  it('returns an object with theme and vibecheck', () => {
    const result = getRandomFallback();
    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('vibecheck');
    expect(typeof result.theme).toBe('string');
    expect(typeof result.vibecheck).toBe('string');
  });

  it('returns a vibecheck from the provided valid theme', () => {
    const theme = 'emotional';
    const result = getRandomFallback(theme);

    expect(result.theme).toBe(theme);
    expect(FALLBACK_VIBECHECKS[theme]).toContain(result.vibecheck);
  });

  it('returns a random theme if provided theme is invalid', () => {
    const result = getRandomFallback('invalid_theme_name');

    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('vibecheck');
    expect(Object.keys(FALLBACK_VIBECHECKS)).toContain(result.theme);
  });

  it("always returns a vibecheck from the returned theme's list", () => {
    const result = getRandomFallback();
    const { theme, vibecheck } = result;

    const validPrompts = FALLBACK_VIBECHECKS[theme];
    expect(validPrompts).toContain(vibecheck);
  });

  it('does not throw with no argument', () => {
    expect(() => getRandomFallback()).not.toThrow();
  });
});
