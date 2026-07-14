// app.config.js instead of app.json: the Google Sign-In config plugin needs
// an iOS URL scheme built from an env var (the Google Cloud iOS OAuth client
// ID), which static JSON can't reference.
const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

// Sentry's Expo config plugin (source map upload / native crash
// symbolication) needs an org + project slug from the Sentry dashboard.
// Only wire it in when both are present, so a dev/CI environment without a
// Sentry project set up doesn't break the build.
const sentryOrg = process.env.EXPO_PUBLIC_SENTRY_ORG;
const sentryProject = process.env.EXPO_PUBLIC_SENTRY_PROJECT;

module.exports = {
  expo: {
    name: 'SafeWord',
    owner: 'gwood23s-team',
    // Matches the slug already registered against the EAS project below
    // (auto-created via the expo.dev dashboard) — internal identifier only,
    // doesn't need to match the repo/package name.
    slug: 'greg',
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
    extra: {
      eas: {
        projectId: 'ea7b07e2-f09a-4b98-8974-95530a36df2f',
      },
    },
    plugins: [
      'expo-apple-authentication',
      ['expo-notifications', { color: '#0F2A4A' }],
      googleIosUrlScheme
        ? ['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]
        : null,
      sentryOrg && sentryProject
        ? ['@sentry/react-native/expo', { organization: sentryOrg, project: sentryProject }]
        : null,
    ].filter(Boolean),
  },
};
