import { Vibration } from "react-native";

function vibrate(milliseconds: number) {
  try {
    Vibration.vibrate(milliseconds);
  } catch {
    // Entorno sin soporte nativo: ignora el feedback haptico.
  }
}

/** Feedback sutil para interacciones menores. */
export function hapticLight() {
  vibrate(10);
}

/** Feedback intermedio para acciones medianas. */
export function hapticMedium() {
  vibrate(15);
}

/** Feedback de exito para confirmaciones. */
export function hapticSuccess() {
  vibrate(30);
}

/** Feedback de error. */
export function hapticError() {
  vibrate(30);
}

/** Feedback para seleccion de opciones (chips, segmentos, filtros). */
export function hapticSelect() {
  vibrate(10);
}

/**
 * Helper compartido: invoca el haptico correspondiente segun el exito de una
 * accion. Se usa en componentes que confirman/cancelan operaciones.
 */
export function hapticForResult(success: boolean) {
  if (success) {
    hapticSuccess();
  } else {
    hapticError();
  }
}