import * as DocumentPicker from "expo-document-picker";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useAuth } from "@/infrastructure/di/AuthContext";
import {
  chooseBackupDirectory,
  createLocalBackup,
  exportLocalBackup,
  listLocalBackups,
  restoreLocalBackup,
  type LocalBackupFile,
} from "@/database/localBackup";
import {
  displayNameFromDirectoryUri,
  loadAppSettings,
  setBackupDirectory,
  type BackupDirectorySetting,
  type BackupSettings,
} from "@/settings/appSettings";
import {
  radius,
  shadows,
  spacing,
  typography,
  useThemeColors,
  type Colors,
} from "@/theme";
import { toErrorMessage } from "@/utils/errors";

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { user, logout } = useAuth();
  const [backupDirectory, setBackupDirectoryState] =
    useState<BackupDirectorySetting | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupSettings | null>(null);
  const [localBackups, setLocalBackups] = useState<LocalBackupFile[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isRestoringRef = useRef(false);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    loadAppSettings().then((settings) => {
      if (isMounted) {
        setBackupDirectoryState(settings.backupDirectory);
        setLastBackup(settings.lastBackup);
      }
    });
    setLocalBackups(listLocalBackups());
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePickDirectory = useCallback(async () => {
    if (Platform.OS !== "android") {
      Alert.alert(
        "No disponible",
        "Elegir una carpeta solo está disponible en Android.",
      );
      return;
    }

    setIsPicking(true);
    try {
      const result =
        await FileSystemLegacy.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!result.granted || !result.directoryUri) {
        return;
      }

      const directory: BackupDirectorySetting = {
        uri: result.directoryUri,
        displayName: displayNameFromDirectoryUri(result.directoryUri),
      };
      await setBackupDirectory(directory);
      setBackupDirectoryState(directory);
      Alert.alert(
        "Carpeta de backup configurada",
        `Los nuevos backups se guardarán también en "${directory.displayName}".`,
      );
    } catch (currentError) {
      Alert.alert(
        "No se pudo elegir la carpeta",
        toErrorMessage(currentError, "No se pudo configurar la carpeta de backup"),
      );
    } finally {
      setIsPicking(false);
    }
  }, []);

  const handleUseInternal = useCallback(async () => {
    setIsSaving(true);
    try {
      await setBackupDirectory(null);
      setBackupDirectoryState(null);
      Alert.alert(
        "Carpeta interna",
        "Los backups se guardarán en la carpeta interna de la app.",
      );
    } catch (currentError) {
      Alert.alert(
        "No se pudo cambiar",
        toErrorMessage(currentError, "No se pudo cambiar la carpeta de backup"),
      );
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleCreateBackup = useCallback(async () => {
    setIsBackingUp(true);
    try {
      const settings = await loadAppSettings();
      if (!settings.backupDirectory && !settings.backupDirectoryDecided) {
        try {
          await chooseBackupDirectory();
        } catch {
          // Sin selector de carpeta disponible: se guarda en la carpeta interna.
        }
      }
      const backup = await createLocalBackup();
      setLastBackup(backup);
      setLocalBackups(listLocalBackups());
      Alert.alert(
        "Backup local creado",
        backup.savedToExternal
          ? `${backup.fileName}\n${formatBytes(backup.sizeBytes)}\nGuardado también en la carpeta elegida.`
          : backup.externalError
            ? `${backup.fileName}\n${formatBytes(backup.sizeBytes)}\nNo se pudo guardar en la carpeta elegida: ${backup.externalError}`
            : `${backup.fileName}\n${formatBytes(backup.sizeBytes)}`,
      );
    } catch (currentError) {
      Alert.alert(
        "No se pudo crear el backup",
        toErrorMessage(currentError, "No se pudo crear el backup local"),
      );
    } finally {
      setIsBackingUp(false);
    }
  }, []);

  const handleShareBackup = useCallback(async () => {
    if (!lastBackup?.uri) {
      Alert.alert(
        "Sin backup para compartir",
        "Primero crea un backup local.",
      );
      return;
    }

    setIsSharing(true);
    try {
      await exportLocalBackup(lastBackup.uri);
    } catch (currentError) {
      Alert.alert(
        "No se pudo compartir el backup",
        toErrorMessage(currentError, "No se pudo compartir el backup"),
      );
    } finally {
      setIsSharing(false);
    }
  }, [lastBackup]);

  const handleRestoreBackup = useCallback(() => {
    if (localBackups.length === 0) {
      Alert.alert(
        "Sin backups locales",
        "Primero crea un backup local para poder restaurarlo.",
      );
      return;
    }
    setRestoreModalVisible(true);
  }, [localBackups]);

  const confirmAndRestore = useCallback((file: LocalBackupFile) => {
    setRestoreModalVisible(false);
    Alert.alert(
      "Restaurar backup",
      `Se reemplazará toda la data actual con "${file.fileName}". Esta acción no se puede deshacer.\n\n¿Continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          style: "destructive",
          onPress: () => {
            void runRestore({
              uri: file.uri,
              fileName: file.fileName,
              sizeBytes: file.sizeBytes,
            });
          },
        },
      ],
    );
  }, []);

  const handleImportBackup = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "application/x-sqlite3",
          "application/vnd.sqlite3",
          "application/octet-stream",
          "*/*",
        ],
      });
      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      Alert.alert(
        "Importar backup",
        `Se reemplazará toda la data actual con "${asset.name}". Esta acción no se puede deshacer.\n\n¿Continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Importar",
            style: "destructive",
            onPress: () => {
              void runRestore({
                uri: asset.uri,
                fileName: asset.name,
                sizeBytes: asset.size,
              });
            },
          },
        ],
      );
    } catch (currentError) {
      Alert.alert(
        "No se pudo importar el backup",
        toErrorMessage(currentError, "No se pudo importar el backup"),
      );
    }
  }, []);

  const runRestore = useCallback(
    async (source: {
      uri: string;
      fileName: string;
      sizeBytes?: number;
    }) => {
      if (isRestoringRef.current) {
        return;
      }
      isRestoringRef.current = true;
      setIsRestoring(true);
      try {
        const result = await restoreLocalBackup(source.uri, {
          fileName: source.fileName,
          sizeBytes: source.sizeBytes,
        });
        setLastBackup({
          createdAt: result.restoredAt,
          fileName: result.fileName,
          sizeBytes: result.sizeBytes,
          uri: result.uri,
        });
        setLocalBackups(listLocalBackups());
        Alert.alert(
          "Backup restaurado",
          `${result.fileName}\nFacturas: ${result.counts.invoices}\nPagos extras: ${result.counts.generalPayments}\nIVA pagado: ${result.counts.taxPayments}\nRetenciones: ${result.counts.retentions}`,
        );
      } catch (currentError) {
        Alert.alert(
          "No se pudo restaurar el backup",
          toErrorMessage(currentError, "No se pudo restaurar el backup"),
        );
      } finally {
        isRestoringRef.current = false;
        setIsRestoring(false);
      }
    },
    [],
  );

  const performLogout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      return;
    }
    isLoggingOutRef.current = true;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (currentError) {
      Alert.alert(
        "No se pudo cerrar sesión",
        toErrorMessage(currentError, "No se pudo cerrar la sesión"),
      );
    } finally {
      isLoggingOutRef.current = false;
      setIsLoggingOut(false);
    }
  }, [logout]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Cerrar sesión",
      "Se cerrará tu sesión y se ocultarán tus facturas en este dispositivo. ¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => {
            void performLogout();
          },
        },
      ],
    );
  }, [performLogout]);

  return (
    <ScreenContainer scrollable>
      <AppHeader title="Ajustes" subtitle="Backup y guardado" />

      {user ? (
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Perfil</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Usuario</Text>
            <Text style={styles.locationName}>{user.name}</Text>
            <Text style={styles.locationUri}>{user.email}</Text>
          </View>

          <View style={styles.actions}>
            <SecondaryButton
              fullWidth
              disabled={isLoggingOut}
              label={isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              onPress={handleLogout}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Backups</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {lastBackup ? "Último backup" : "Sin backups aún"}
          </Text>
          {lastBackup ? (
            <>
              <Text numberOfLines={1} style={styles.lastBackupName}>
                {lastBackup.fileName}
              </Text>
              <Text style={styles.locationUri}>
                {formatBackupTime(lastBackup.createdAt)} ·{" "}
                {formatBytes(lastBackup.sizeBytes)}
              </Text>
            </>
          ) : (
            <Text style={styles.locationName}>
              Crea un backup para guardar la base completa.
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            fullWidth
            disabled={isBackingUp || isRestoring}
            label={isBackingUp ? "Generando..." : "Crear backup local"}
            onPress={handleCreateBackup}
          />
          <SecondaryButton
            fullWidth
            disabled={isSharing || isRestoring}
            label={isSharing ? "Compartiendo..." : "Compartir backup"}
            onPress={handleShareBackup}
          />
          <SecondaryButton
            fullWidth
            disabled={isRestoring || isBackingUp}
            label={isRestoring ? "Restaurando..." : "Restaurar backup"}
            onPress={handleRestoreBackup}
          />
          <SecondaryButton
            fullWidth
            disabled={isRestoring || isBackingUp}
            label="Importar backup desde archivo"
            onPress={handleImportBackup}
          />
        </View>

        <Text style={styles.groupSubtitle}>Ubicación del backup</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Los backups se guardan en</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationName}>
              {backupDirectory?.displayName ?? "Carpeta interna (predeterminada)"}
            </Text>
            {backupDirectory ? (
              <Text numberOfLines={2} style={styles.locationUri}>
                {backupDirectory.uri}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            fullWidth
            label={
              isPicking ? "Abriendo selector..." : "Elegir carpeta de backup"
            }
            loading={isPicking}
            onPress={handlePickDirectory}
          />
          {backupDirectory ? (
            <SecondaryButton
              fullWidth
              label={isSaving ? "Guardando..." : "Usar carpeta interna"}
              loading={isSaving}
              onPress={handleUseInternal}
            />
          ) : null}
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Al elegir una carpeta, cada backup nuevo se guardará también en ella.
            Así lo encuentras rápido para importarlo desde otro celular o moverlo
            a la nube.
          </Text>
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setRestoreModalVisible(false)}
        transparent
        visible={restoreModalVisible}
      >
        <View style={styles.modalOverlay}>
          <View
            accessibilityViewIsModal
            style={[styles.backupModal, shadows.modal]}
          >
            <Text style={styles.modalTitle}>Restaurar backup</Text>
            <Text style={styles.modalMessage}>
              Selecciona un backup local. Se reemplazará toda la data actual.
            </Text>
            <ScrollView style={styles.backupList}>
              {localBackups.map((file) => (
                <AnimatedPressable
                  key={file.uri}
                  accessibilityLabel={`Restaurar ${file.fileName}`}
                  accessibilityRole="button"
                  onPress={() => confirmAndRestore(file)}
                  style={styles.backupListItem}
                >
                  <View style={styles.backupListItemText}>
                    <Text numberOfLines={1} style={styles.backupListItemName}>
                      {file.fileName}
                    </Text>
                    <Text style={styles.backupListItemMeta}>
                      {formatBackupTime(
                        new Date(file.modificationTime).toISOString(),
                      )}{" "}
                      · {formatBytes(file.sizeBytes)}
                    </Text>
                  </View>
                  <Text style={styles.backupListItemArrow}>›</Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
            <SecondaryButton
              fullWidth
              label="Cancelar"
              onPress={() => setRestoreModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function formatBackupTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "reciente";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    group: {
      marginBottom: spacing.xl,
    },
    groupTitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
      marginBottom: spacing.md,
    },
    groupSubtitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
      fontSize: 15,
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      gap: spacing.sm,
      padding: spacing.cardPadding,
    },
    cardLabel: {
      ...typography.label,
      color: c.text.secondary,
    },
    lastBackupName: {
      ...typography.bodyMedium,
      color: c.text.primary,
      fontWeight: "600",
    },
    locationRow: {
      gap: spacing.xxs,
    },
    locationName: {
      ...typography.bodyMedium,
      color: c.text.primary,
      fontWeight: "600",
    },
    locationUri: {
      ...typography.caption,
      color: c.text.tertiary,
    },
    actions: {
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    hint: {
      backgroundColor: c.surface.secondary,
      borderColor: c.border.light,
      borderRadius: radius.inner,
      borderWidth: 1,
      marginTop: spacing.lg,
      padding: spacing.md,
    },
    hintText: {
      ...typography.body,
      color: c.text.secondary,
    },
    modalOverlay: {
      alignItems: "center",
      backgroundColor: c.overlay,
      flex: 1,
      justifyContent: "center",
      padding: spacing.lg,
    },
    backupModal: {
      backgroundColor: c.surface.primary,
      borderRadius: radius.modal,
      gap: spacing.md,
      maxHeight: "80%",
      maxWidth: 420,
      padding: spacing.xl,
      width: "100%",
    },
    modalTitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
    },
    modalMessage: {
      ...typography.body,
      color: c.text.secondary,
    },
    backupList: {
      flexGrow: 0,
    },
    backupListItem: {
      alignItems: "center",
      borderColor: c.border.light,
      borderRadius: radius.inner,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "space-between",
      marginBottom: spacing.sm,
      minHeight: spacing.buttonHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    backupListItemText: {
      flex: 1,
    },
    backupListItemName: {
      ...typography.bodyMedium,
      color: c.text.primary,
    },
    backupListItemMeta: {
      ...typography.caption,
      color: c.text.secondary,
      marginTop: spacing.xxs,
    },
    backupListItemArrow: {
      color: c.text.tertiary,
      fontSize: typography.screenTitle.fontSize,
    },
  });
}
