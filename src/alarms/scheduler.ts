import { Alert } from 'react-native';
import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidNotificationSetting,
  AndroidVisibility,
  type Notification,
  RepeatFrequency,
  TriggerType,
} from 'react-native-notify-kit';

import type { Alarm } from '../types/alarm';
import { formatTime } from '../utils/time';

const CHANNEL_ID = 'alarms';
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** Each alarm is scheduled once per selected day so each day has its own ID */
const triggerId = (alarmId: number, day: number) => `alarm-${alarmId}-${day}`;

let channelReady: Promise<string> | null = null;

/** Notification channels are created once (so this function is idempotent) */
function ensureChannel(): Promise<string> {
  channelReady ??= notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Alarms',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    vibration: true,
  });
  return channelReady;
}

/** The next time `day` (0 = Sunday) falls on `hour:minute`, as a timestamp. */
function nextOccurrence(day: number, hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  next.setDate(now.getDate() + ((day - now.getDay() + 7) % 7));

  // Today's time has already passed, so use the same weekday next week.
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 7);
  return next.getTime();
}

/** Stops an alarm from ringing. */
export async function cancelAlarm(alarmId: number): Promise<void> {
  await notifee.cancelTriggerNotifications(ALL_DAYS.map((day) => triggerId(alarmId, day)));
}

/** The notification that goes off for an alarm */
function alarmNotification(alarm: Alarm, id: string, channelId: string): Notification {
  return {
    id,
    title: 'Alarm',
    body: formatTime(alarm.hour, alarm.minute),
    data: { alarmId: String(alarm.id) },
    android: {
      channelId,
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      ongoing: true, // Can't be swiped away: the alarm is stopped from inside the app.
      autoCancel: false,
      pressAction: { id: 'default', launchActivity: 'default' },
      fullScreenAction: { id: 'default', launchActivity: 'default' },
    },
  };
}

/**
 * @brief Schedules an alarm to ring at its time on each selected day, every week.
 */
export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  await cancelAlarm(alarm.id);
  if (alarm.days.length === 0) return;

  const channelId = await ensureChannel();

  await Promise.all(
    alarm.days.map((day) =>
      notifee.createTriggerNotification(
        alarmNotification(alarm, triggerId(alarm.id, day), channelId),
        {
          type: TriggerType.TIMESTAMP,
          timestamp: nextOccurrence(day, alarm.hour, alarm.minute),
          repeatFrequency: RepeatFrequency.WEEKLY,
          alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
        },
      ),
    ),
  );
}

/** Schedules every alarm. Safe to repeat, so it's run on every launch to keep things in sync. */
export async function scheduleAlarms(alarms: Alarm[]): Promise<void> {
  await Promise.all(alarms.map(scheduleAlarm));
}

/**
 * Asks for the permissions an alarm needs: notifications, exact alarms and
 * full-screen notifications (so it can appear over the lock screen).
 */
export async function ensureAlarmPermissions(): Promise<void> {
  await notifee.requestPermission();
  const { android } = await notifee.getNotificationSettings();

  if (android.alarm === AndroidNotificationSetting.DISABLED) {
    Alert.alert(
      'Allow alarms',
      'To ring on time, this app needs permission to schedule exact alarms.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => notifee.openAlarmPermissionSettings() },
      ],
    );
  } else if (android.fullScreenIntent === AndroidNotificationSetting.DISABLED) {
    Alert.alert(
      'Allow full-screen alerts',
      'To show over the lock screen when an alarm rings, allow full-screen notifications.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => notifee.openNotificationSettings() },
      ],
    );
  }
}
