import { Alert } from 'react-native';

/** Asks the user to confirm a deletion, and runs `onConfirm` if they do. */
export function confirmDelete(title: string, onConfirm: () => void): void {
  Alert.alert(title, 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}
