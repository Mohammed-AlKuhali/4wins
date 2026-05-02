import { saveProgress, loadProgress, clearProgress } from '../lib/onboarding_progress';

jest.mock('expo-secure-store', () => require('../__mocks__/expo-secure-store'));

describe('Onboarding progress persistence', () => {
  beforeEach(async () => { await clearProgress(); });

  it('returns null when nothing is saved', async () => {
    const result = await loadProgress();
    expect(result).toBeNull();
  });

  it('saves and loads progress', async () => {
    await saveProgress({ step: 'cue', dayZeroPillarIndex: 0 });
    const result = await loadProgress();
    expect(result).toEqual({ step: 'cue', dayZeroPillarIndex: 0 });
  });

  it('clears progress', async () => {
    await saveProgress({ step: 'complete', dayZeroPillarIndex: 4 });
    await clearProgress();
    const result = await loadProgress();
    expect(result).toBeNull();
  });

  it('overwrites existing progress', async () => {
    await saveProgress({ step: 'tradition', dayZeroPillarIndex: 0 });
    await saveProgress({ step: 'day-zero', dayZeroPillarIndex: 2 });
    const result = await loadProgress();
    expect(result?.step).toBe('day-zero');
    expect(result?.dayZeroPillarIndex).toBe(2);
  });
});
