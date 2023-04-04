import { CapacitorElectronConfig } from '@capacitor-community/electron';

const config: CapacitorElectronConfig  = {
  appId: 'com.tanagerproductions.statsguru',
  appName: 'Stats Guru',
  webDir: 'dist/stats-guru',
  bundledWebRuntime: false,
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase",
      iosIsEncryption: false,
      iosKeychainPrefix: "cap",
      iosBiometric: {
        biometricAuth: false,
        biometricTitle : "Biometric login for capacitor sqlite"
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth : false,
        biometricTitle : "Biometric login for capacitor sqlite",
        biometricSubTitle : "Log in using your biometric"
      },
      electronWindowsLocation: "C:\\ProgramData\\CapacitorDatabases",
      electronMacLocation: "YOUR_VOLUME/CapacitorDatabases",
      electronLinuxLocation: "Databases"
    }
  },
  electron: {
    // Custom scheme for your app to be served on in the electron window.
    customUrlScheme: 'capacitor-electron',
    // Switch on/off a tray icon and menu, which is customizable in the app.
    trayIconAndMenuEnabled: false,
    // Switch on/off whether or not a splashscreen will be used.
    splashScreenEnabled: true,
    // Custom image name in the electron/assets folder to use as splash image (.gif included)
    splashScreenImageName: 'splash.gif',
    // Switch on/off if the main window should be hidden until brought to the front by the tray menu, etc.
    hideMainWindowOnLaunch: true,
    // Switch on/off whether or not to use deeplinking in your app.
    deepLinkingEnabled: true,
    // Custom protocol to be used with deeplinking for your app.
    deepLinkingCustomProtocol: 'mycapacitorapp',
  },
};

export default config;
