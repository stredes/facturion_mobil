import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.dangerButton,
                pressed && styles.pressed,
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
    padding: spacing.xxl,
  },
  dialog: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.modal,
    gap: spacing.lg,
    padding: spacing.xl,
    width: "100%",
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text.primary,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    backgroundColor: colors.background.tertiary,
  },
  dangerButton: {
    backgroundColor: colors.status.error,
  },
  secondaryText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  primaryText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  pressed: {
    opacity: 0.72,
  },
});
