import { registerRootComponent } from 'expo';
import notifee from 'react-native-notify-kit';

import App from './src/App';
import { handleAlarmEvent } from './src/alarms/events';

// Must be registered here, outside any component, so it also runs when the app is in the background.
notifee.onBackgroundEvent(async (event) => handleAlarmEvent(event));

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
