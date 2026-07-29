import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing } from "../theme";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.secondaryText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                destructive ? styles.dangerButton : styles.primaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.primaryText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.modal,
    gap: spacing.lg,
    padding: spacing.xl,
    width: "100%",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "700",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    alignItems: "center",
    borderRadius: radius.button,
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.borderLight,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  primaryText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
});
