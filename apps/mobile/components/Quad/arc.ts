export interface ArcGeometry {
  path: string;
  centerAngleDeg: number;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = toRad(angleDeg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function computeArcPaths(size: number): Record<string, ArcGeometry> {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;

  return {
    mental: {
      path: arcPath(cx, cy, r, -133, -47),
      centerAngleDeg: -90,
    },
    financial: {
      path: arcPath(cx, cy, r, -43, 43),
      centerAngleDeg: 0,
    },
    spiritual: {
      path: arcPath(cx, cy, r, 47, 133),
      centerAngleDeg: 90,
    },
    physical: {
      path: arcPath(cx, cy, r, 137, 223),
      centerAngleDeg: 180,
    },
  };
}

export function arcLength(size: number): number {
  const r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;
  return (86 / 360) * circumference;
}

export function strokeWidth(size: number): number {
  if (size >= 100) return 6;
  return Math.max(1.5, (size / 24) * 1.5);
}
