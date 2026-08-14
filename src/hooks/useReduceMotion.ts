import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Detecta si el usuario pidio reducir movimiento (accessibility setting).
 * Replica el hook `useReducedMotion` de RN cuando no esta disponible en la
 * version instalada, reaccionando a cambios en vivo del ajuste.
 */
export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
