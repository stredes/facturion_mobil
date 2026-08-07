import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SecondaryButton } from "@/components/SecondaryButton";
import { TextInputField } from "@/components/TextInputField";
import { useAuth } from "@/infrastructure/di/AuthContext";
import {
  spacing,
  typography,
  useThemeColors,
  type Colors,
} from "@/theme";
import { toErrorMessage } from "@/utils/errors";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      setError("Ingresa tu email y contraseña");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (currentError) {
      setError(toErrorMessage(currentError, "No se pudo iniciar sesión"));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, isSubmitting, login]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboard}
    >
      <ScreenContainer scrollable>
        <View style={styles.header}>
          <AppHeader
            title="Facturion"
            subtitle="Inicia sesión para acceder a tus facturas"
          />
        </View>

        <View style={styles.form}>
          <TextInputField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            value={email}
          />
          <TextInputField
            autoCapitalize="none"
            autoComplete="password"
            label="Contraseña"
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            secureTextEntry
            value={password}
          />

          {error ? (
            <Text
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton
              disabled={isSubmitting}
              label={isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              onPress={() => {
                void handleLogin();
              }}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta?</Text>
          <SecondaryButton
            disabled={isSubmitting}
            label="Crear cuenta"
            onPress={() => router.push("/register")}
          />
        </View>

        {isSubmitting ? (
          <ActivityIndicator color={colors.primary.main} size="large" />
        ) : null}
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    keyboard: {
      flex: 1,
    },
    header: {
      marginTop: spacing.xl,
    },
    form: {
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    actions: {
      marginTop: spacing.sm,
    },
    error: {
      ...typography.body,
      color: c.status.error,
    },
    footer: {
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xxl,
    },
    footerText: {
      ...typography.body,
      color: c.text.secondary,
    },
  });
}
