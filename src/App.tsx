import { StatusBar } from 'expo-status-bar';
import { BottomNavigation, MD2DarkTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { styles } from './App.styles';
import { NavigationProvider, tabs, useNavigation } from './NavigationProvider';

const routes = tabs.map(({ key, title, icon }) => ({
  key,
  title,
  focusedIcon: icon,
}));

const screens = Object.fromEntries(tabs.map(({ key, Screen }) => [key, Screen]));

const renderScene = ({ route }: { route: { key: string } }) => {
  const Screen = screens[route.key];
  return <Screen />;
};

function AppContent() {
  const { index, setIndex } = useNavigation();

  return (
    <BottomNavigation
      style={styles.container}
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <SafeAreaProvider>
        <PaperProvider theme={MD2DarkTheme}>
          <AppContent />
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </NavigationProvider>
  );
}
