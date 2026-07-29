import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "../theme";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmModalProps) {
  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay} accessible={false} />
      <View style={[styles.modal, shadows.modal]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onConfirm}
            style={({ pressed }) => [
              styles.confirmButton,
              destructive && styles.destructiveButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.confirmText,
                destructive && styles.destructiveText,
              ]}
            >
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
  modal: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.modal,
    margin: spacing.lg,
    maxHeight: "80%",
    padding: spacing.lg,
    width: "90%",
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text.primary,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "flex-end",
  },
  cancelButton: {
    alignItems: "center",
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: colors.primary.main,
    borderRadius: radius.button,
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  destructiveButton: {
    backgroundColor: colors.status.error,
  },
  cancelText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  confirmText: {
    ...typography.bodyMedium,
    color: colors.surface.primary,
  },
  destructiveText: {
    color: colors.surface.primary,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
