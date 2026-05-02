jest.mock('expo-av', () => require('../__mocks__/expo-av'));

describe('Audio recorder module', () => {
  it('requestMicPermission resolves to a boolean', async () => {
    const { requestMicPermission } = await import('../lib/audio_recorder');
    const result = await requestMicPermission();
    expect(typeof result).toBe('boolean');
  });

  it('startRecording returns a Recording object', async () => {
    const { startRecording } = await import('../lib/audio_recorder');
    const recording = await startRecording();
    expect(recording).toBeDefined();
    expect(typeof recording.stopAndUnloadAsync).toBe('function');
  });

  it('stopRecording returns a URI string or null', async () => {
    const { startRecording, stopRecording } = await import('../lib/audio_recorder');
    const recording = await startRecording();
    const uri = await stopRecording(recording);
    expect(uri === null || typeof uri === 'string').toBe(true);
  });
});
