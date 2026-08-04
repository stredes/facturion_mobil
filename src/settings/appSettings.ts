import * as FileSystem from "expo-file-system/legacy";

export type ThemeMode = "system" | "light" | "dark";

export interface BackupSettings {
  createdAt: string;
  fileName: string;
  sizeBytes: number;
  uri: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  lastBackup: BackupSettings | null;
}

const SETTINGS_FILE_NAME = "factrion-settings.json";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  themeMode: "system",
  lastBackup: null,
};

export async function loadAppSettings(): Promise<AppSettings> {
  const uri = getSettingsUri();
  if (!uri) {
    return DEFAULT_APP_SETTINGS;
  }

  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const raw = await FileSystem.readAsStringAsync(uri);
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveAppSettings(
  settings: AppSettings,
): Promise<AppSettings> {
  const normalized = normalizeSettings(settings);
  const uri = getSettingsUri();

  if (uri) {
    await FileSystem.writeAsStringAsync(
      uri,
      JSON.stringify(normalized, null, 2),
    );
  }

  return normalized;
}

export async function updateAppSettings(
  update: (current: AppSettings) => AppSettings,
): Promise<AppSettings> {
  const current = await loadAppSettings();
  return saveAppSettings(update(current));
}

function getSettingsUri(): string | null {
  return FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}${SETTINGS_FILE_NAME}`
    : null;
}

function normalizeSettings(value: unknown): AppSettings {
  if (!isObject(value)) {
    return DEFAULT_APP_SETTINGS;
  }

  return {
    themeMode: normalizeThemeMode(value.themeMode),
    lastBackup: normalizeBackup(value.lastBackup),
  };
}

function normalizeThemeMode(value: unknown): ThemeMode {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : DEFAULT_APP_SETTINGS.themeMode;
}

function normalizeBackup(value: unknown): BackupSettings | null {
  if (!isObject(value)) {
    return null;
  }

  if (
    typeof value.createdAt !== "string" ||
    typeof value.fileName !== "string" ||
    typeof value.uri !== "string" ||
    typeof value.sizeBytes !== "number"
  ) {
    return null;
  }

  return {
    createdAt: value.createdAt,
    fileName: value.fileName,
    sizeBytes: value.sizeBytes,
    uri: value.uri,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
