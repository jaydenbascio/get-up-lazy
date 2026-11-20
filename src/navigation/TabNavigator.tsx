/**
 * @file TabNavigator.tsx
 * @brief Defines the navigator for tabs, such as the Alarms tab or the Graphs tab
 */

import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { BottomNavigation, Icon } from 'react-native-paper';

import { AlarmsScreen, GraphScreen } from '../screens';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Renders Paper's bottom tab navigation bar
function PaperTabBar({ navigation, state, descriptors, insets }: BottomTabBarProps) {
  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        } else {
          navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: state.key,
          });
        }
      }}
      renderIcon={({ route, focused, color }) =>
        descriptors[route.key].options.tabBarIcon?.({ focused, color, size: 24 }) ?? null
      }
      getLabelText={({ route }) => descriptors[route.key].options.title ?? route.name}
    />
  );
}

// All the tabs in the app
export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={PaperTabBar}>
      <Tab.Screen
        name="Alarms"
        component={AlarmsScreen}
        options={{
          title: 'Alarms',
          tabBarIcon: ({ color, size }) => <Icon source="alarm" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Graph"
        component={GraphScreen}
        options={{
          title: 'Graph',
          tabBarIcon: ({ color, size }) => <Icon source="chart-line" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
