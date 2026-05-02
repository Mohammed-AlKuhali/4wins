import { computeArcPaths, arcLength, strokeWidth } from '../components/Quad/arc';

describe('Arc geometry', () => {
  it('computes 4 arc paths for size 280', () => {
    const arcs = computeArcPaths(280);
    expect(Object.keys(arcs)).toEqual(['mental', 'financial', 'spiritual', 'physical']);
  });

  it('all paths are non-empty strings', () => {
    const arcs = computeArcPaths(280);
    for (const [, geo] of Object.entries(arcs)) {
      expect(typeof geo.path).toBe('string');
      expect(geo.path.length).toBeGreaterThan(10);
    }
  });

  it('stroke width is 6 at size 280', () => {
    expect(strokeWidth(280)).toBe(6);
  });

  it('stroke width scales down for small sizes', () => {
    expect(strokeWidth(24)).toBeCloseTo(1.5, 1);
  });

  it('arc length is roughly 86/360 of circumference', () => {
    const size = 280;
    const r = size / 2 - 12;
    const expected = (86 / 360) * 2 * Math.PI * r;
    expect(arcLength(size)).toBeCloseTo(expected, 0);
  });
});
