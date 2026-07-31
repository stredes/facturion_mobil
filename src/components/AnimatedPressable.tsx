import { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { springConfig } from "../theme";

interface AnimatedPressableProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  scaleIn?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedPressable({
  children,
  scaleIn = 0.97,
  style,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: scaleIn,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
