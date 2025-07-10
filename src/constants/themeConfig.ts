export type ThemeMode = 'light' | 'dark';

export const THEME = {
  light: {
    mode: 'light',
    background: '#ffffff',
    optionalText: '#a3a4a4',
    secondaryText: '#484745',
    primaryText: '#222222',
    mutedText: '#6B7280',
    blurTint: 'systemUltraThinMaterialLight',
    gradientColors: [
      'rgba(0, 0, 0, 0.05)',
      'rgba(0, 0, 0, 0)',
      'rgba(0, 0, 0, 0.05)',
    ],
    highlight: 'rgba(0, 0, 0, 0.05)',
    mainBubbleGradient: [
      'rgba(0, 0, 0, 0.25)',
      'rgba(0, 0, 0, 0.05)',
      'rgba(0, 0, 0, 0)',
    ],
    secondaryIcon: '#484745',
    primaryIcon: '#222222',
    tagBackground: {
      selected: 'rgba(0, 0, 0, 0.08)',
      unselected: 'rgba(0, 0, 0, 0.04)',
    },
    tagBorder: {
      selected: 'rgba(0, 0, 0, 0.2)',
      unselected: 'rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    mode: 'dark',
    background: '#000000',
    optionalText: '#818181',
    secondaryText: '#d6d6d6',
    primaryText: '#ffffff',
    mutedText: '#9CA3AF',
    blurTint: 'dark',
    gradientColors: [
      'rgba(255, 255, 255, 0.1)',
      'rgba(255, 255, 255, 0)',
      'rgba(255, 255, 255, 0.1)',
    ],
    highlight: 'rgba(255, 255, 255, 0.2)',
    mainBubbleGradient: [
      'rgba(255, 255, 255, 0.25)',
      'rgba(255, 255, 255, 0.05)',
      'rgba(255, 255, 255, 0)',
    ],
    secondaryIcon: '#d6d6d6',
    primaryIcon: '#ffffff',
    tagBackground: {
      selected: 'rgba(255, 255, 255, 0.2)',
      unselected: 'rgba(255, 255, 255, 0.1)',
    },
    tagBorder: {
      selected: 'rgba(255, 255, 255, 0.4)',
      unselected: 'rgba(255, 255, 255, 0.2)',
    },
  },
};
