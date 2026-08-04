import { Ionicons } from "@expo/vector-icons";
import { useMemo, type ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography, useTheme, type Colors } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

export interface QuickAction {
  key: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  route: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    key: "new-invoice",
    label: "Nueva factura",
    icon: "document-text-outline",
    route: "/facturas/nueva",
  },
  {
    key: "pay-iva",
    label: "Pago IVA",
    icon: "card-outline",
    route: "/pagos/iva/nueva",
  },
  {
    key: "pay-general",
    label: "Pago general",
    icon: "wallet-outline",
    route: "/pagos/general/nueva",
  },
  {
    key: "retention",
    label: "Retención",
    icon: "file-tray-full-outline",
    route: "/retenciones/nueva",
  },
];

interface QuickActionsProps {
  onPress: (route: string) => void;
}

export function QuickActions({ onPress }: QuickActionsProps) {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.grid}>
      {QUICK_ACTIONS.map((item) => (
        <View key={item.key} style={styles.itemWrapper}>
          <AnimatedPressable
            accessibilityLabel={item.label}
            accessibilityRole="button"
            hapticOnPress
            onPress={() => onPress(item.route)}
            style={[styles.item, shadows.card]}
          >
            <View style={styles.iconBadge}>
              <Ionicons name={item.icon} size={24} color={colors.primary.main} />
            </View>
            <Text numberOfLines={1} style={styles.label}>
              {item.label}
            </Text>
          </AnimatedPressable>
        </View>
      ))}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGap,
    },
    itemWrapper: {
      flexBasis: "48%",
      flexGrow: 1,
    },
    item: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "center",
      minHeight: 72,
      padding: spacing.cardPadding,
    },
    iconBadge: {
      alignItems: "center",
      backgroundColor: c.primary.light,
      borderRadius: 23,
      height: 46,
      justifyContent: "center",
      width: 46,
    },
    label: {
      ...typography.label,
      color: c.text.primary,
      flexShrink: 1,
    },
  });
