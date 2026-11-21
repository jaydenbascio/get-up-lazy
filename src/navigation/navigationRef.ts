import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

/** Lets code outside React (like notification events) navigate. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
