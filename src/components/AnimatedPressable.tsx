import { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
  type Insets,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { springConfig } from "../theme";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { hapticLight } from "../utils/haptics";

interface AnimatedPressableProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  accessibilitySelected?: boolean;
  hitSlop?: number | Insets;
  onAccessibilityAction?: (
    event: { nativeEvent: { actionName: string } },
  ) => void;
  scaleIn?: number;
  hapticOnPress?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedPressable({
  children,
  scaleIn = 0.97,
  style,
  hapticOnPress = true,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();

  function handlePressIn() {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue: scaleIn,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }

  function handlePressOut() {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }

  function handlePress() {
    if (hapticOnPress) hapticLight();
    props.onPress?.();
  }

  return (
    <Pressable {...props} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
