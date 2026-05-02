import { meetsMovementThreshold } from '../lib/health/detect_movement';

describe('Movement threshold detection', () => {
  it('passes with enough steps', () => {
    expect(meetsMovementThreshold({ steps: 3000, source: 'healthkit' })).toBe(true);
  });

  it('fails below step threshold', () => {
    expect(meetsMovementThreshold({ steps: 2999, source: 'healthkit' })).toBe(false);
  });

  it('passes with enough kcal', () => {
    expect(meetsMovementThreshold({ activeEnergyKcal: 100, source: 'healthkit' })).toBe(true);
  });

  it('fails below kcal threshold', () => {
    expect(meetsMovementThreshold({ activeEnergyKcal: 99, source: 'healthkit' })).toBe(false);
  });

  it('passes with enough workout minutes', () => {
    expect(meetsMovementThreshold({ workoutMinutes: 10, source: 'healthkit', kind: 'running' })).toBe(true);
  });

  it('fails with no data', () => {
    expect(meetsMovementThreshold({ source: 'healthkit' })).toBe(false);
  });

  it('passes with combination', () => {
    expect(meetsMovementThreshold({ steps: 1000, workoutMinutes: 12, source: 'health_connect' })).toBe(true);
  });
});
