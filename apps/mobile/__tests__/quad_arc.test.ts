import { computeArcPaths, arcLength, strokeWidth } from '../components/Quad/arc';

describe('Quad arc geometry', () => {
  const SIZE = 240;

  it('computeArcPaths returns 4 keys', () => {
    const paths = computeArcPaths(SIZE);
    expect(Object.keys(paths)).toHaveLength(4);
    expect(paths).toHaveProperty('mental');
    expect(paths).toHaveProperty('financial');
    expect(paths).toHaveProperty('spiritual');
    expect(paths).toHaveProperty('physical');
  });

  it('each arc geometry has path string and centerAngleDeg', () => {
    const paths = computeArcPaths(SIZE);
    for (const [, geo] of Object.entries(paths)) {
      expect(typeof geo.path).toBe('string');
      expect(geo.path.length).toBeGreaterThan(0);
      expect(typeof geo.centerAngleDeg).toBe('number');
    }
  });

  it('arcLength returns positive value', () => {
    const len = arcLength(SIZE);
    expect(len).toBeGreaterThan(0);
  });

  it('arcLength scales with size', () => {
    const small = arcLength(120);
    const large = arcLength(240);
    expect(large).toBeGreaterThan(small);
  });

  it('strokeWidth returns positive number', () => {
    expect(strokeWidth(SIZE)).toBeGreaterThan(0);
  });

  it('strokeWidth for small size is at least 1.5', () => {
    expect(strokeWidth(20)).toBeGreaterThanOrEqual(1.5);
  });

  it('strokeWidth for large size is 6', () => {
    expect(strokeWidth(200)).toBe(6);
  });

  it('mental arc starts in top-left quadrant', () => {
    const { mental } = computeArcPaths(SIZE);
    expect(mental.centerAngleDeg).toBe(-90);
  });

  it('financial arc is on the right', () => {
    const { financial } = computeArcPaths(SIZE);
    expect(financial.centerAngleDeg).toBe(0);
  });

  it('spiritual arc is at the bottom', () => {
    const { spiritual } = computeArcPaths(SIZE);
    expect(spiritual.centerAngleDeg).toBe(90);
  });

  it('physical arc is on the left', () => {
    const { physical } = computeArcPaths(SIZE);
    expect(physical.centerAngleDeg).toBe(180);
  });
});
