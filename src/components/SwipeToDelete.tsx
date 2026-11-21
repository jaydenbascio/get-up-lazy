import type { ReactNode } from 'react';
import { View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { IconButton, useTheme } from 'react-native-paper';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { styles } from './SwipeToDelete.styles';

type Props = {
  /** Should have an opaque background, so the trash can stays hidden until swiped. */
  children: ReactNode;
  onDelete: () => void;
  /** Accessibility label, e.g. "Delete" */
  label: string;
  /** Rounds the red background to match the corners of `children`. */
  borderRadius?: number;
};

type ActionProps = Pick<Props, 'onDelete' | 'label' | 'borderRadius'> & {
  /** 0 when the row is at rest, up to 1 when fully swiped. */
  progress: SharedValue<number>;
};

function DeleteAction({ progress, onDelete, label, borderRadius = 0 }: ActionProps) {
  const theme = useTheme();

  const backgroundStyle = useAnimatedStyle(() => ({ opacity: progress.value > 0 ? 1 : 0 }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.background, { backgroundColor: theme.colors.error, borderRadius }, backgroundStyle]}
      />
      <View style={styles.action}>
        <IconButton
          icon="delete"
          iconColor={theme.colors.onError}
          accessibilityLabel={label}
          onPress={onDelete}
        />
      </View>
    </>
  );
}

/** Swiping `children` right reveals a trash can that calls `onDelete`. */
export default function SwipeToDelete({ children, onDelete, label, borderRadius }: Props) {
  return (
    <ReanimatedSwipeable
      overshootLeft={false}
      renderLeftActions={(progress) => (
        <DeleteAction
          progress={progress}
          onDelete={onDelete}
          label={label}
          borderRadius={borderRadius}
        />
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}
