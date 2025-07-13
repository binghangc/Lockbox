import { useTripTheme } from '@/context/TripThemeProvider';

const usePillbarConfig = () => {
  const theme = useTripTheme();

  return {
    BUBBLE_WIDTH: 59,
    BUBBLE_HEIGHT: 59,
    BUBBLE_RADIUS: 28,
    BUBBLE_MARGIN_LEFT: 8,
    BUBBLE_MARGIN_RIGHT: 12,
    BORDER_RADIUS_FULL: 9999,
    PILLBAR_HEIGHT: 48,
    PILLBAR_PADDING_HORIZONTAL: 4,
    PILLBAR_PADDING_VERTICAL: 12,
    GRADIENT_COLORS: theme.gradientColors,
    GRADIENT_LOCATIONS: [0, 0.5, 1] as [number, number, number],
    GRADIENT_START: [0, 0.5] as [number, number],
    GRADIENT_END: [1, 0.5] as [number, number],
    BUBBLE_GRADIENT_START: [0.2, 0.2] as [number, number],
    BUBBLE_GRADIENT_END: [0.8, 0.8] as [number, number],
    BLUR_INTENSITY: 50,
    BLUR_TINT: theme.blurTint,
    CONTAINER_POSITION: 'absolute' as const,
    CONTAINER_BOTTOM_OFFSET: 16,
    CONTAINER_HORIZONTAL_MARGIN: 16,
    CONTAINER_Z_INDEX: 999,
    GRADIENT_PADDING: 1,
  };
};

export default usePillbarConfig;
