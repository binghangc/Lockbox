import React, { createContext, useContext } from 'react';
import videoBackgrounds from '@/constants/videoBackgrounds';
import { THEME, ThemeMode } from '@/constants/themeConfig';

type Theme = typeof THEME.light;

const TripThemeContext = createContext<Theme>(THEME.light);

export const useTripTheme = () => useContext(TripThemeContext);

interface TripThemeProviderProps {
  videoKey: string;
  children: React.ReactNode;
}

export function TripThemeProvider({
  videoKey,
  children,
}: TripThemeProviderProps) {
  const mode: ThemeMode = videoBackgrounds[videoKey]?.mode ?? 'light';
  const theme = THEME[mode];

  return (
    <TripThemeContext.Provider value={theme}>
      {children}
    </TripThemeContext.Provider>
  );
}
