import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type LayoutChangeEvent,
} from "react-native";

import { radius, spacing, typography, useTheme, type Colors } from "../theme";

export function ThemeToggleButton() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const progress = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const knobTravel = Math.max(0, trackWidth - 48);

  useEffect(() => {
    Animated.spring(progress, {
      damping: 18,
      mass: 0.7,
      stiffness: 160,
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [isDark, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, knobTravel],
  });

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <Pressable
      accessibilityLabel={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      onPress={() => {
        void toggleTheme();
      }}
      onLayout={onLayout}
      style={({ pressed }) => [
        styles.button,
        isDark && styles.buttonDark,
        pressed && styles.buttonPressed,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.knob,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <Ionicons
          color={isDark ? colors.primary.dark : colors.status.warning}
          name={isDark ? "moon" : "sunny"}
          size={18}
        />
      </Animated.View>
      <Text style={styles.label}>Tema</Text>
      <Text style={styles.value}>{isDark ? "Oscuro" : "Claro"}</Text>
    </Pressable>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    button: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.button,
      borderWidth: 1,
      flex: 1,
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: 54,
      minWidth: 150,
      overflow: "hidden",
      paddingHorizontal: spacing.md,
    },
    buttonDark: {
      backgroundColor: c.primary.light,
      borderColor: c.primary.main,
    },
    buttonPressed: {
      transform: [{ scale: 0.99 }],
    },
    knob: {
      alignItems: "center",
      backgroundColor: c.surface.secondary,
      borderColor: c.border.medium,
      borderRadius: 18,
      borderWidth: 1,
      height: 36,
      justifyContent: "center",
      left: spacing.xs,
      position: "absolute",
      width: 36,
    },
    label: {
      ...typography.label,
      color: c.text.secondary,
      marginLeft: 42,
    },
    value: {
      ...typography.bodyMedium,
      color: c.text.primary,
      marginLeft: "auto",
    },
  });
