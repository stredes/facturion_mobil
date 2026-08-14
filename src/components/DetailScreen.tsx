import { useMemo, useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, typography, useTheme, useThemeColors, type Colors } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";
import { ConfirmModal } from "./ConfirmModal";
import { SectionTitle } from "./SectionTitle";

interface DetailScreenProps {
  title: string;
  subtitle: string;
  totalLabel: string;
  totalValue: string;
  children: ReactNode;
  deleteError?: string | null;
  isDeleting?: boolean;
  deleteLabel?: string;
  deletingLabel?: string;
  editLabel?: string;
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DetailScreen({
  title,
  subtitle,
  totalLabel,
  totalValue,
  children,
  deleteError = null,
  isDeleting = false,
  deleteLabel = "Eliminar",
  deletingLabel = "Eliminando...",
  editLabel = "Editar",
  deleteConfirmTitle = "Eliminar registro",
  deleteConfirmMessage = "Esta accion eliminara el registro. Deseas continuar?",
  onEdit,
  onDelete,
}: DetailScreenProps) {
  const { colors, shadows } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = width < 360;
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={[
          styles.container,
          { paddingBottom: spacing.xxl * 2 + insets.bottom },
        ]}
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={[styles.totalCard, shadows.card]}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          <Text
            adjustsFontSizeToFit
            ellipsizeMode="tail"
            minimumFontScale={0.6}
            numberOfLines={1}
            style={[
              styles.totalValue,
              { fontSize: isSmallScreen ? 23 : 26 },
            ]}
          >
            {totalValue}
          </Text>
        </View>

        {children}

        {deleteError ? (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{deleteError}</Text>
          </View>
        ) : null}

        {onEdit ? (
          <AnimatedPressable
            accessibilityLabel={editLabel}
            accessibilityRole="button"
            onPress={onEdit}
            style={[styles.actionButton, styles.editButton]}
          >
            <Text style={styles.editButtonText}>{editLabel}</Text>
          </AnimatedPressable>
        ) : null}

        {onDelete ? (
          <AnimatedPressable
            accessibilityLabel={deleteLabel}
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={() => setIsDeleteDialogVisible(true)}
            style={[
              styles.actionButton,
              styles.deleteButton,
              isDeleting && styles.disabledButton,
            ]}
          >
            <Text style={styles.deleteButtonText}>
              {isDeleting ? deletingLabel : deleteLabel}
            </Text>
          </AnimatedPressable>
        ) : null}
      </ScrollView>

      <ConfirmModal
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        destructive
        message={deleteConfirmMessage}
        onCancel={() => setIsDeleteDialogVisible(false)}
        onConfirm={() => {
          setIsDeleteDialogVisible(false);
          onDelete?.();
        }}
        title={deleteConfirmTitle}
        visible={isDeleteDialogVisible}
      />
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

export function DetailRow({ label, value }: DetailRowProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        ellipsizeMode="tail"
        minimumFontScale={0.6}
        numberOfLines={1}
        style={styles.detailValue}
      >
        {value}
      </Text>
    </View>
  );
}

interface DetailBlockProps {
  title: string;
  children: ReactNode;
}

export function DetailBlock({ title, children }: DetailBlockProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.block}>
      <SectionTitle title={title} />
      {children}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    screen: {
      backgroundColor: c.background.primary,
      flex: 1,
    },
    container: {
      gap: spacing.lg,
      padding: spacing.screenPadding,
      paddingBottom: spacing.xxl * 2,
    },
    headerSection: {
      gap: spacing.sm,
    },
    title: {
      ...typography.screenTitle,
      color: c.text.primary,
    },
    subtitle: {
      ...typography.body,
      color: c.text.secondary,
    },
    totalCard: {
      backgroundColor: c.primary.main,
      borderRadius: radius.mainCard,
      gap: spacing.xxs,
      minHeight: 128,
      paddingHorizontal: spacing.cardPadding,
      paddingVertical: spacing.lg,
    },
    totalLabel: {
      ...typography.label,
      color: c.text.inverse,
      opacity: 0.9,
    },
    totalValue: {
      ...typography.primaryAmount,
      color: c.text.inverse,
      marginTop: spacing.xxs,
    },
    block: {
      gap: spacing.sm,
    },
    detailRow: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.md,
    },
    detailLabel: {
      ...typography.label,
      color: c.text.secondary,
      flexShrink: 0,
    },
    detailValue: {
      ...typography.bodyMedium,
      ...typography.tabularNums,
      color: c.text.primary,
      flex: 1,
      textAlign: "right",
      marginLeft: spacing.md,
      minWidth: 0,
    },
    actionButton: {
      alignItems: "center",
      borderRadius: radius.button,
      minHeight: spacing.buttonHeight,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    editButton: {
      backgroundColor: c.primary.main,
    },
    editButtonText: {
      ...typography.bodyMedium,
      ...typography.tabularNums,
      color: c.text.inverse,
    },
    deleteButton: {
      backgroundColor: c.statusLight.error,
      borderColor: c.statusLight.error,
      borderWidth: 1,
    },
    deleteButtonText: {
      ...typography.bodyMedium,
      ...typography.tabularNums,
      color: c.status.error,
    },
    inlineError: {
      backgroundColor: c.statusLight.error,
      borderColor: c.statusLight.error,
      borderRadius: radius.input,
      borderWidth: 1,
      padding: spacing.md,
    },
    inlineErrorText: {
      ...typography.bodyMedium,
      ...typography.tabularNums,
      color: c.status.error,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
