import React from 'react';
import Svg, { Path } from 'react-native-svg';

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M',
    start.x,
    start.y,
    'A',
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

interface CircularPlaybackArcProps {
  size: number;
  thickness: number;
  color: string;
  progress: number; // value between 0 and 1
}

export default function CircularPlaybackArc({
  size,
  thickness,
  color,
  progress,
}: CircularPlaybackArcProps) {
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const endAngle = Math.max(0, Math.min(1, progress)) * 360;
  const [displayAngle, setDisplayAngle] = React.useState(endAngle);
  const animationFrame = React.useRef<number | null>(null);

  React.useEffect(() => {
    const animate = () => {
      setDisplayAngle((current) => {
        const diff = endAngle - current;
        if (Math.abs(diff) < 0.1) {
          if (animationFrame.current !== null) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
          }
          return endAngle;
        }
        return current + diff * 0.15;
      });
      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [endAngle]);

  if (displayAngle <= 0) return null;
  return (
    <Svg
      width={size}
      height={size}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      <Path
        d={describeArc(center, center, radius, 0, displayAngle)}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
