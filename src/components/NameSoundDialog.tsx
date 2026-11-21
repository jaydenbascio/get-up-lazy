import { useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

type Props = {
  visible: boolean;
  initialName: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
};

/** Dialog with a text input for naming a user-added sound */
export default function NameSoundDialog({ visible, initialName, onCancel, onConfirm }: Props) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>Name this sound</Dialog.Title>
        <Dialog.Content>
          <TextInput
            mode="outlined"
            label="Name"
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => trimmed && onConfirm(trimmed)}
            autoFocus
            selectTextOnFocus
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>Cancel</Button>
          <Button disabled={!trimmed} onPress={() => onConfirm(trimmed)}>
            Add
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
