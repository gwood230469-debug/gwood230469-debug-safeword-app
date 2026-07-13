// app.config.js instead of app.json: the Google Sign-In config plugin needs
// an iOS URL scheme built from an env var (the Google Cloud iOS OAuth client
// ID), which static JSON can't reference.
const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

module.exports = {
  expo: {
    name: 'SafeWord',
    slug: 'gwood230469-debug-safeword-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    backgroundColor: '#FAF7F2',
    scheme: 'safeword',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gwood230469debug.safeword',
    },
    android: {
      package: 'com.gwood230469debug.safeword',
      adaptiveIcon: {
        backgroundColor: '#FAF7F2',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-apple-authentication',
      ['expo-notifications', { color: '#0F2A4A' }],
      googleIosUrlScheme
        ? ['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]
        : null,
    ].filter(Boolean),
  },
};
