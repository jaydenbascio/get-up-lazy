/**
 * @file StackNavigator.tsx
 * @brief Defines the navigator for screens that stack on top of tabs. For example, editing or creating an alarm.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EditAlarmScreen } from '../screens';
import TabNavigator from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screens that sit on top of the tabs (and hide the tab bar)
export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="EditAlarm" component={EditAlarmScreen} />
    </Stack.Navigator>
  );
}
