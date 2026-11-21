import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import notifee from 'react-native-notify-kit';

import { getAlarms } from '../data/alarms';
import { handleAlarmEvent } from './events';
import { ensureAlarmPermissions, scheduleAlarms } from './scheduler';

/** @brief Asks for permissions, schedules alarms, and reacts to alarms going off. Does not actually render anything. */
export default function AlarmSetup() {
  const db = useSQLiteContext();

  useEffect(() => {
    (async () => {
      await ensureAlarmPermissions();
      await scheduleAlarms(await getAlarms(db));
    })();
  }, [db]);

  useEffect(() => notifee.onForegroundEvent(handleAlarmEvent), []);

  return null;
}
