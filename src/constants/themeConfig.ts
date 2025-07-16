export type ThemeMode = 'light' | 'dark';

export const THEME = {
  light: {
    mode: 'light',
    background: '#ffffff',
    secondaryBackground: '#F0F0F0',
    optionalText: '#c6c5c6',
    secondaryText: '#484745',
    primaryText: '#222222',
    mutedText: '#6B7280',
    blurTint: 'systemUltraThinMaterialLight',
    blurrierTint: 'systemThickMaterialLight',
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
    primaryOutline: '#484745', // same as secondaryText
    secondaryOutline: 'rgba(72, 71, 69, 0.2)',
    contrastBackground: '#d9d9d9',
  },
  dark: {
    mode: 'dark',
    background: '#000000',
    secondaryBackground: '#1E1E1E',
    optionalText: '#818181',
    secondaryText: '#d6d6d6',
    primaryText: '#ffffff',
    mutedText: '#9CA3AF',
    blurTint: 'dark',
    blurrierTint: 'systemThickMaterialDark',
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

    primaryOutline: '#d6d6d6', // same as secondaryText
    secondaryOutline: 'rgba(214, 214, 214, 0.2)',
    contrastBackground: '#262626',
  },
};
