import React, { createContext, useContext, useState, useEffect } from 'react';
import videoBackgrounds from '@/constants/videoBackgrounds';
import { THEME, ThemeMode } from '@/constants/themeConfig';

type Theme = (typeof THEME)[keyof typeof THEME] & {
  video_background: string;
  primaryColor: string;
  secondaryColor: string;
  surfaceColor: string;
};

const TripThemeContext = createContext<Theme>({
  ...THEME.dark,
  video_background: '',
  primaryColor: '#FFFFFF',
  secondaryColor: '#CCCCCC',
  surfaceColor: '#999999',
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
    const baseTheme = THEME[mode] ?? THEME.dark;
    const bgTheme = videoBackgrounds[videoKey] ?? {};
    return {
      ...baseTheme,
      video_background: videoKey,
      primaryColor: bgTheme.primaryColor ?? '#FFFFFF',
      secondaryColor: bgTheme.secondaryColor ?? '#CCCCCC',
      surfaceColor: bgTheme.surfaceColor ?? '#999999',
    };
  });

  // Update theme when videoKey prop changes
  useEffect(() => {
    const mode: ThemeMode = videoBackgrounds[videoKey]?.mode ?? 'dark';
    const baseTheme = THEME[mode] ?? THEME.dark;
    const bgTheme = videoBackgrounds[videoKey] ?? {};
    setTheme({
      ...baseTheme,
      video_background: videoKey,
      primaryColor: bgTheme.primaryColor ?? '#FFFFFF',
      secondaryColor: bgTheme.secondaryColor ?? '#CCCCCC',
      surfaceColor: bgTheme.surfaceColor ?? '#999999',
    });
  }, [videoKey]);

  const setThemeByVideoKey = React.useCallback((key: string) => {
    const mode: ThemeMode = videoBackgrounds[key]?.mode ?? 'dark';
    const baseTheme = THEME[mode] ?? THEME.dark;
    const bgTheme = videoBackgrounds[key] ?? {};
    setTheme({
      ...baseTheme,
      video_background: key,
      primaryColor: bgTheme.primaryColor ?? '#FFFFFF',
      secondaryColor: bgTheme.secondaryColor ?? '#CCCCCC',
      surfaceColor: bgTheme.surfaceColor ?? '#999999',
    });
  }, []);

  return (
    <TripThemeContext.Provider value={theme}>
      <TripThemeUpdateContext.Provider value={setThemeByVideoKey}>
        {children}
      </TripThemeUpdateContext.Provider>
    </TripThemeContext.Provider>
  );
}
