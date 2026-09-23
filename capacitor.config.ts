import type { CapacitorConfig } from "@capacitor/cli";

// Noelia native shell (iOS + Android) built with Capacitor.
//
// The app is a live Next.js site, so the native apps load the hosted production
// build (server.url) rather than a static export — everything (SSR, Supabase
// auth, LiveKit, checkout) keeps working exactly as on the web, and every deploy
// updates the apps instantly with no store review. See docs/MOBILE_APP.md.
//
// To point the shell at a staging/preview build, override CAP_SERVER_URL before
// `npx cap sync`.
const SERVER_URL = process.env.CAP_SERVER_URL ?? "https://learnnoelia.com";

const config: CapacitorConfig = {
  appId: "com.learnnoelia.app",
  appName: "Noelia",
  // webDir must exist for `cap sync`; with server.url set it is only a fallback
  // shell (shown if the device is offline before the site loads).
  webDir: "mobile/www",
  server: {
    url: SERVER_URL,
    androidScheme: "https",
    iosScheme: "https",
  },
  // A UA token both the client and server can detect synchronously, so we can
  // hide in-app purchase CTAs when running inside the native shell (required by
  // the App Store / Play Store when subscriptions are sold on the web only).
  ios: { appendUserAgent: "NoeliaApp" },
  android: { appendUserAgent: "NoeliaApp" },
  backgroundColor: "#0e1022",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0e1022",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0e1022",
    },
  },
};

export default config;
