module.exports = {
  Audio: {
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(() => Promise.resolve()),
      startAsync: jest.fn(() => Promise.resolve()),
      stopAndUnloadAsync: jest.fn(() => Promise.resolve()),
      getURI: jest.fn(() => 'file:///mock/recording.m4a'),
      getStatusAsync: jest.fn(() => Promise.resolve({ durationMillis: 5000, metering: -20 })),
    })),
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  },
};
