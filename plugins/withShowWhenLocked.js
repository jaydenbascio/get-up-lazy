const { withAndroidManifest } = require('expo/config-plugins');

/** Allows the app to show up even in lock screen */
module.exports = function withShowWhenLocked(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    const mainActivity = application?.activity?.find(
      (activity) => activity.$['android:name'] === '.MainActivity',
    );
    if (!mainActivity) {
      throw new Error('withShowWhenLocked: could not find .MainActivity in AndroidManifest.xml');
    }

    mainActivity.$['android:showWhenLocked'] = 'true';
    mainActivity.$['android:turnScreenOn'] = 'true';
    return config;
  });
};
