import { NavigationContainer } from '@react-navigation/native';
import { ReactNode } from 'react';

import { navigationTheme } from './theme';

export function NavigationProvider({ children }: { children: ReactNode }) {
  return <NavigationContainer theme={navigationTheme}>{children}</NavigationContainer>;
}
