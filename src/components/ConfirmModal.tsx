import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, shadows, spacing, typography } from "../theme";
import { hapticError, hapticSuccess } from "../utils/haptics";

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
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.96);
      Animated.timing(scale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scale]);

  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Animated.View
          accessibilityRole="alert"
          accessibilityLabel={`${title}. ${message}`}
          style={[styles.modal, shadows.modal, { transform: [{ scale }] }]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              hitSlop={8}
              onPress={() => {
                hapticError();
                onCancel();
              }}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              hitSlop={8}
              onPress={() => {
                hapticSuccess();
                onConfirm();
              }}
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.modal,
    gap: spacing.lg,
    maxWidth: 420,
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
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
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
