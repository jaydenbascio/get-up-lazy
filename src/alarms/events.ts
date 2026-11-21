import notifee, { Event, EventType } from 'react-native-notify-kit';

import { navigationRef } from '../navigation/navigationRef';

/**
 * @brief Shows the ring screen if the navigation is set up 
 * @param alarmId The alarm that has gone off
 */
function openRingScreen(alarmId: number): void {
  if (navigationRef.isReady()) navigationRef.navigate('Ring', { alarmId });
}

function alarmIdOf(notification?: { data?: { [key: string]: unknown } }): number | null {
  const alarmId = Number(notification?.data?.alarmId);
  return Number.isInteger(alarmId) ? alarmId : null;
}

/**
 * @brief Handles notification events:
 * - An alarm going off (`DELIVERED`)
 * - An alarm being being tapped (`PRESS`).
 * Used for both foreground and background events.
 */
export function handleAlarmEvent({ type, detail }: Event): void {
  if (type !== EventType.DELIVERED && type !== EventType.PRESS) return;

  const alarmId = alarmIdOf(detail.notification);
  if (alarmId !== null) openRingScreen(alarmId);
}

/**
 * If an alarm opened the app (for example over the lock screen), shows the ring screen
 */
export async function handleLaunchNotification(): Promise<void> {
  const initial = await notifee.getInitialNotification();

  // Alarm ID will only be non-null if notitifcation was from an alarm
  const alarmId = alarmIdOf(initial?.notification);
  if (alarmId !== null) openRingScreen(alarmId);
}
