export type ThemeMode = 'light' | 'dark';

export const THEME = {
  light: {
    mode: 'light',
    background: '#ffffff',
    text: '#000000',
    mutedText: '#6B7280',
    blurTint: 'light',
    gradientColors: [
      'rgba(0, 0, 0, 0.05)',
      'rgba(0, 0, 0, 0)',
      'rgba(0, 0, 0, 0.05)',
    ],
    highlight: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    mode: 'dark',
    background: '#000000',
    text: '#ffffff',
    mutedText: '#9CA3AF',
    blurTint: 'dark',
    gradientColors: [
      'rgba(255, 255, 255, 0.1)',
      'rgba(255, 255, 255, 0)',
      'rgba(255, 255, 255, 0.1)',
    ],
    highlight: 'rgba(255, 255, 255, 0.2)',
  },
};
