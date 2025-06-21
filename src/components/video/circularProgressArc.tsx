import React, { useRef, useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number; // diameter of the ring in pixels
  thickness?: number; // stroke width
  color?: string; // ring color
  cycleDuration: number;
  children?: React.ReactNode;
};

const DEFAULT_SIZE = 50;
const DEFAULT_THICKNESS = 4;
const DEFAULT_COLOR = 'rgba(255, 255, 255, 0.6)';

function getLinearSegment(t: number, cycleDuration: number): [number, number] {
  const progress = Math.min(t / cycleDuration, 1);
  return [0, progress * 360];
}

// Helper to create an SVG arc path
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
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

export default function CircularProgressArc({
  size = DEFAULT_SIZE,
  thickness = DEFAULT_THICKNESS,
  color = DEFAULT_COLOR,
  cycleDuration,
  children,
}: Props) {
  const [segment, setSegment] = useState<[number, number]>([0, 0]);
  const startTime = useRef<number>(Date.now());
  const raf = useRef<number>(0);

  useEffect(() => {
    function update() {
      const now = Date.now();
      const t = (now - startTime.current) % cycleDuration;
      setSegment(getLinearSegment(t, cycleDuration));
      raf.current = requestAnimationFrame(update);
    }
    raf.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf.current);
  }, [cycleDuration]);

  const radius = (size - thickness) / 2;
  const center = size / 2;
  const [startAngle, endAngle] = segment;

  const validArc =
    !Number.isNaN(startAngle) &&
    !Number.isNaN(endAngle) &&
    startAngle !== endAngle;

  return (
    <View style={{ width: size, height: size }}>
      {children}
      {validArc && (
        <Svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0 }}
          pointerEvents="none"
        >
          <Path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      )}
    </View>
  );
}
