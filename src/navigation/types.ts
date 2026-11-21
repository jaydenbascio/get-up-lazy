import type { AlarmDraft } from '../types/alarm';

export type RootStackParamList = {
  Tabs: undefined;
  /** If `alarmId` is defined, edit that alarm. Otherwise create a new one. */
  EditAlarm: { alarmId?: number } | undefined;
  /**
   * Shown while an alarm is going off. Give an `alarmId` to ring a saved alarm,
   * or an `alarm` to ring one that hasn't been saved (used to test it while editing).
   */
  Ring: { alarmId: number } | { alarm: AlarmDraft };
};

export type TabParamList = {
  Alarms: undefined;
  Graph: undefined;
};
