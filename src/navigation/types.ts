export type RootStackParamList = {
  Tabs: undefined;
  /** If `alarmId` is defined, edit that alarm. Otherwise create a new one. */
  EditAlarm: { alarmId?: number } | undefined;
};

export type TabParamList = {
  Alarms: undefined;
  Graph: undefined;
};
