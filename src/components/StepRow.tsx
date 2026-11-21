import { Pressable, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { useReorderableDrag } from 'react-native-reorderable-list';

import type { AlarmStep } from '../types/alarm';
import { styles } from './StepRow.styles';
import SwipeToDelete from './SwipeToDelete';

type Props = {
  step: AlarmStep;
  /** Position in the list, starting at 0 */
  index: number;
  onPress: () => void;
  onDelete: () => void;
};

/**
 * @brief One step in an alarm, draggable
 */
export default function StepRow({ step, index, onPress, onDelete }: Props) {
  const theme = useTheme();
  const drag = useReorderableDrag();

  return (
    <SwipeToDelete
      label={`Delete ${step.name}`}
      borderRadius={theme.roundness * 3}
      onDelete={onDelete}
    >
      <Card onPress={onPress} onLongPress={drag} accessibilityLabel={`Edit ${step.name}`}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text variant="titleMedium">
              {index + 1}. {step.name}
            </Text>
            <Text variant="bodySmall">{step.timeLimitSeconds} seconds to scan</Text>
          </View>
          <Pressable
            onPressIn={drag}
            hitSlop={8}
            accessibilityLabel={`Drag ${step.name} to reorder`}
            style={styles.handle}
          >
            <Icon source="drag" size={28} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </Card>
    </SwipeToDelete>
  );
}
