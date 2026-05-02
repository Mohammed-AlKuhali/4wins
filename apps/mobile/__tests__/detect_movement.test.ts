import { meetsMovementThreshold } from '../lib/health/detect_movement';

describe('Movement threshold — edge cases', () => {
  it('handles undefined everything gracefully', () => {
    expect(meetsMovementThreshold({ source: 'healthkit' })).toBe(false);
  });

  it('3000 steps exactly passes', () => {
    expect(meetsMovementThreshold({ steps: 3000, source: 'healthkit' })).toBe(true);
  });

  it('2999 steps exactly fails', () => {
    expect(meetsMovementThreshold({ steps: 2999, source: 'healthkit' })).toBe(false);
  });

  it('100 kcal exactly passes', () => {
    expect(meetsMovementThreshold({ activeEnergyKcal: 100, source: 'health_connect' })).toBe(true);
  });

  it('99 kcal fails', () => {
    expect(meetsMovementThreshold({ activeEnergyKcal: 99, source: 'health_connect' })).toBe(false);
  });

  it('10 workout minutes exactly passes', () => {
    expect(meetsMovementThreshold({ workoutMinutes: 10, source: 'healthkit' })).toBe(true);
  });

  it('9 workout minutes fails', () => {
    expect(meetsMovementThreshold({ workoutMinutes: 9, source: 'healthkit' })).toBe(false);
  });

  it('combination: low steps + long workout passes via workout', () => {
    expect(meetsMovementThreshold({ steps: 100, workoutMinutes: 15, source: 'healthkit' })).toBe(true);
  });
});
