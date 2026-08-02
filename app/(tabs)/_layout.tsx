import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, useThemeColors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabIcons: Record<string, { filled: IconName; outline: IconName }> = {
  Inicio: { filled: "home", outline: "home-outline" },
  Facturas: { filled: "document-text", outline: "document-text-outline" },
  Pagos: { filled: "wallet", outline: "wallet-outline" },
  Resumen: { filled: "pie-chart", outline: "pie-chart-outline" },
  Retención: { filled: "file-tray-full", outline: "file-tray-full-outline" },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const colors = useThemeColors();
  const icons = tabIcons[label] ?? { filled: "add", outline: "add" };

  return (
    <View style={tabStyles.iconContainer}>
      <Ionicons
        name={focused ? icons.filled : icons.outline}
        size={22}
        color={focused ? colors.primary.main : colors.text.tertiary}
      />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.surface.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          height: spacing.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: colors.text.tertiary,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="facturas"
        options={{
          title: "Facturas",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Facturas" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pagos"
        options={{
          title: "Pagos",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Pagos" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="retencion"
        options={{
          title: "Retención",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Retención" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="resumen"
        options={{
          title: "Resumen",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Resumen" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
