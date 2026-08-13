import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SecondaryButton } from "@/components/SecondaryButton";
import { TextInputField } from "@/components/TextInputField";
import { useAuth } from "@/infrastructure/di/AuthContext";
import { spacing, typography, useThemeColors, type Colors } from "@/theme";
import { toErrorMessage } from "@/utils/errors";

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = useCallback(async () => {
    if (isSubmitting) return;
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await resetPassword(email, profileName, newPassword);
      setMessage("Contraseña actualizada. Ya puedes iniciar sesión.");
      setNewPassword("");
    } catch (currentError) {
      setError(toErrorMessage(currentError, "No se pudo actualizar la contraseña"));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, profileName, newPassword, isSubmitting, resetPassword]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}>
      <ScreenContainer scrollable>
        <AppHeader title="Recuperar contraseña" subtitle="Verifica los datos del perfil guardado en este dispositivo" />
        <View style={styles.form}>
          <TextInputField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email del perfil" onChangeText={setEmail} value={email} />
          <TextInputField autoCapitalize="words" autoComplete="name" label="Nombre exacto del perfil" onChangeText={setProfileName} value={profileName} />
          <TextInputField autoCapitalize="none" autoComplete="password" label="Nueva contraseña" onChangeText={setNewPassword} secureTextEntry value={newPassword} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {message ? <Text accessibilityRole="alert" style={styles.success}>{message}</Text> : null}
          <PrimaryButton disabled={isSubmitting} label={isSubmitting ? "Actualizando..." : "Actualizar contraseña"} onPress={() => void handleReset()} />
          <SecondaryButton label="Volver a iniciar sesión" onPress={() => router.replace("/login")} />
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: Colors) => StyleSheet.create({
  screen: { flex: 1 },
  form: { gap: spacing.md, marginTop: spacing.lg },
  error: { ...typography.body, color: c.status.error },
  success: { ...typography.body, color: c.status.success },
});
