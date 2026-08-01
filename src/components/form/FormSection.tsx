import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../../theme";

interface FormSectionProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export function FormSection({ icon, title, children }: FormSectionProps) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <View style={styles.blockIcon}>
          <Text style={styles.blockIconText}>{icon}</Text>
        </View>
        <Text style={styles.blockTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  blockIcon: {
    backgroundColor: colors.primary.light,
    borderRadius: radius.inner,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  blockIconText: {
    ...typography.label,
    color: colors.primary.main,
    fontWeight: "700",
  },
  blockTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    flex: 1,
  },
});
