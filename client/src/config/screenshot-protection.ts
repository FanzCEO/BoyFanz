// Screenshot protection configuration for BoyFanz
export default {
  enabled: true,
  blockRightClick: true,
  blockKeyboardShortcuts: true,
  detectPrintScreen: true,
  detectScreenRecording: true,
  blurOnVisibilityChange: true,
  logAttempts: true,
  apiEndpoint: '/api/security/capture-attempt',
  platformId: 'boyfanz',
};
