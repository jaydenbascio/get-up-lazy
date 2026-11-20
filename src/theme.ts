import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const paperTheme = MD3DarkTheme;

// React Navigation's theme, altered to fit with React Native Paper
export const { DarkTheme: navigationTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationLightTheme,
  reactNavigationDark: NavigationDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
});
