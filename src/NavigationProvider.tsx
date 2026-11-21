import { NavigationContainer } from '@react-navigation/native';
import { ReactNode } from 'react';

import { handleLaunchNotification } from './alarms/events';
import { navigationRef } from './navigation/navigationRef';
import { navigationTheme } from './theme';

export function NavigationProvider({ children }: { children: ReactNode }) {
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={handleLaunchNotification}
    >
      {children}
    </NavigationContainer>
  );
}
