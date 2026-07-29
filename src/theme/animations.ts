import { Animated, Easing } from "react-native";

export const animationDuration = {
  fast: 120,
  normal: 200,
  slow: 280,
} as const;

export const springConfig = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
} as const;

export const easing = Easing.out(Easing.cubic);

export function createFadeIn(duration = animationDuration.normal) {
  return {
    opacity: new Animated.Value(0),
    animate: (value: Animated.Value) =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
      }),
  };
}

export const cardEnterAnimation = {
  duration: animationDuration.normal,
  delay: (index: number) => Math.min(index * 40, 200),
};
