import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import StackNavigator from './navigation/StackNavigator';
import { NavigationProvider } from './NavigationProvider';
import { paperTheme } from './theme';

registerTranslation('en', en);

export default function App() {
  return (
    <NavigationProvider>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <StackNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </NavigationProvider>
  );
}
