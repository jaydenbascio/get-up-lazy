import { ComponentType, createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { AlarmsScreen, GraphScreen } from './screens';

export type Tab = {
  key: string;
  title: string;
  icon: string;
  Screen: ComponentType;
};

// All the pages in the app
export const tabs: Tab[] = [
  { key: 'alarms', title: 'Alarms', icon: 'alarm', Screen: AlarmsScreen },
  { key: 'graph', title: 'Graph', icon: 'chart-line', Screen: GraphScreen },
];

type NavigationContextValue = {
  tabs: Tab[];
  index: number;
  setIndex: (index: number) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const value = useMemo(() => ({ tabs, index, setIndex }), [index]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used inside a NavigationProvider');
  }
  return context;
}
