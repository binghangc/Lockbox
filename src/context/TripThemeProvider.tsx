import React, { createContext, useContext, useState } from 'react';
import videoBackgrounds from '@/constants/videoBackgrounds';
import { THEME, ThemeMode } from '@/constants/themeConfig';

type Theme = (typeof THEME)[keyof typeof THEME];

const TripThemeContext = createContext<Theme>(THEME.dark);
const TripThemeUpdateContext = createContext<(key: string) => void>(() => {});

export const useTripTheme = () => useContext(TripThemeContext);
export const useSetTripTheme = () => useContext(TripThemeUpdateContext);

interface TripThemeProviderProps {
  videoKey: string;
  children: React.ReactNode;
}

export function TripThemeProvider({
  videoKey,
  children,
}: TripThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const mode: ThemeMode = videoBackgrounds[videoKey]?.mode ?? 'dark';
    return THEME[mode];
  });

  const setThemeByVideoKey = React.useCallback((key: string) => {
    const mode: ThemeMode = videoBackgrounds[key]?.mode ?? 'dark';
    setTheme(THEME[mode] ?? THEME.dark);
  }, []);

  return (
    <TripThemeContext.Provider value={theme}>
      <TripThemeUpdateContext.Provider value={setThemeByVideoKey}>
        {children}
      </TripThemeUpdateContext.Provider>
    </TripThemeContext.Provider>
  );
}
