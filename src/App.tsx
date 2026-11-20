import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DATABASE_NAME, migrateDatabase } from './data/database';
import StackNavigator from './navigation/StackNavigator';
import { NavigationProvider } from './NavigationProvider';
import { paperTheme } from './theme';

registerTranslation('en', en);

export default function App() {
  return (
    <NavigationProvider>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
            <StackNavigator />
          </SQLiteProvider>
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </NavigationProvider>
  );
}
