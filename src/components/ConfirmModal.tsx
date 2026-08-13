import { useEffect, useMemo, useRef, type ComponentRef } from "react";
import {
  Animated,
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { radius, spacing, typography, useTheme, type Colors } from "../theme";
import { hapticLight, hapticSuccess } from "../utils/haptics";
import { SecondaryButton } from "./SecondaryButton";

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
  const { colors, shadows } = useTheme();
  const scale = useRef(new Animated.Value(0.96)).current;
  const confirmRef = useRef<ComponentRef<typeof Pressable>>(null);
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const handleBack = () => {
    hapticLight();
    onCancel();
    return true;
  };

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => subscription.remove();
  }, [visible]);

  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      onRequestClose={handleBack}
      onShow={() => confirmRef.current?.focus()}
      transparent
      visible={visible}
    >
      <View style={styles.overlay} importantForAccessibility="auto">
        <Animated.View
          accessibilityRole="alert"
          accessibilityLabel={`${title}. ${message}`}
          style={[styles.modal, shadows.modal, { transform: [{ scale }] }]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
          <View style={styles.cancelButton}>
            <SecondaryButton
              fullWidth
              label={cancelLabel}
              onPress={() => {
                hapticLight();
                onCancel();
              }}
            />
          </View>
            <Pressable
              ref={confirmRef}
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


const createStyles = (c: Colors) =>
  StyleSheet.create({
    overlay: {
      alignItems: "center",
      backgroundColor: c.overlay,
      flex: 1,
      justifyContent: "center",
      padding: spacing.lg,
    },
    modal: {
      backgroundColor: c.surface.primary,
      borderRadius: radius.modal,
      gap: spacing.lg,
      maxWidth: 420,
      padding: spacing.xl,
      width: "100%",
    },
    title: {
      ...typography.sectionTitle,
      color: c.text.primary,
    },
    message: {
      ...typography.body,
      color: c.text.secondary,
    },
    actions: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    cancelButton: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    confirmButton: {
      alignItems: "center",
      backgroundColor: c.primary.main,
      borderRadius: radius.button,
      flex: 1,
      minHeight: spacing.buttonHeight,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    destructiveButton: {
      backgroundColor: c.status.error,
    },
    confirmText: {
      ...typography.bodyMedium,
      color: c.surface.primary,
    },
    destructiveText: {
      color: c.surface.primary,
    },
    buttonPressed: {
      opacity: 0.85,
    },
  });
