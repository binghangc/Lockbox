const PILLBAR = {
  BUBBLE_WIDTH: 58,
  BUBBLE_HEIGHT: 58,
  BUBBLE_RADIUS: 28,
  BUBBLE_MARGIN_LEFT: -12,
  BUBBLE_MARGIN_RIGHT: 12,
  BORDER_RADIUS_FULL: 9999,
  PILLBAR_HEIGHT: 48,
  PILLBAR_PADDING_HORIZONTAL: 8,
  PILLBAR_PADDING_VERTICAL: 12,
  GRADIENT_COLORS: [
    'rgba(255,255,255,0.1)',
    'rgba(255,255,255,0)',
    'rgba(255,255,255,0.1)',
  ] as [string, string, string],
  GRADIENT_LOCATIONS: [0, 0.5, 1] as [number, number, number],
  GRADIENT_START: [0, 0.5] as [number, number],
  GRADIENT_END: [1, 0.5] as [number, number],
  BLUR_INTENSITY: 50,
  BLUR_TINT: 'dark' as const,
};

export default PILLBAR;
