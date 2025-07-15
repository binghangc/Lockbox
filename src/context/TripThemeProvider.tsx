import React, { createContext, useContext, useState, useEffect } from 'react';
import videoBackgrounds from '@/constants/videoBackgrounds';
import { THEME, ThemeMode } from '@/constants/themeConfig';

type Theme = (typeof THEME)[keyof typeof THEME] & { video_background: string };

const TripThemeContext = createContext<Theme>({
  ...THEME.dark,
  video_background: '',
});
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
    return { ...THEME[mode], video_background: videoKey };
  });

  // Update theme when videoKey prop changes
  useEffect(() => {
    const mode: ThemeMode = videoBackgrounds[videoKey]?.mode ?? 'dark';
    setTheme({ ...(THEME[mode] ?? THEME.dark), video_background: videoKey });
  }, [videoKey]);

  const setThemeByVideoKey = React.useCallback((key: string) => {
    const mode: ThemeMode = videoBackgrounds[key]?.mode ?? 'dark';
    setTheme({ ...(THEME[mode] ?? THEME.dark), video_background: key });
  }, []);

  return (
    <TripThemeContext.Provider value={theme}>
      <TripThemeUpdateContext.Provider value={setThemeByVideoKey}>
        {children}
      </TripThemeUpdateContext.Provider>
    </TripThemeContext.Provider>
  );
}
