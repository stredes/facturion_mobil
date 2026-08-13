/**
 * Implementación de autenticación local con almacenamiento seguro.
 *
 * Almacena credenciales en expo-secure-store (Keychain/Keystore del SO).
 *
 *  - Salt aleatorio por usuario.
 *  - SHA-256 iterado como derivación de contraseñas.
 */
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import type { AuthPort, User } from "../../domain/AuthPort";
import { createUserId, normalizeEmail } from "./authHelpers";

const USER_KEY = "facturion_active_user";
const USERS_KEY = "facturion_users";

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
}

export class LocalAuthAdapter implements AuthPort {
  async getCurrentUser(): Promise<User | null> {
    const data = await SecureStore.getItemAsync(USER_KEY);
    if (!data) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(data);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "id" in parsed &&
        "email" in parsed &&
        "name" in parsed
      ) {
        return parsed as User;
      }
      return null;
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<User> {
    const normalizedEmail = normalizeEmail(email);
    const users = await this.getUsers();
    const user = users.find((candidate) => candidate.email === normalizedEmail);

    if (!user) {
      throw new Error("Email no registrado");
    }

    const hash = await this.hashPassword(password, user.salt);
    if (user.passwordHash !== hash) {
      throw new Error("Contraseña incorrecta");
    }

    const loggedIn: User = { id: user.id, email: user.email, name: user.name };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(loggedIn));
    return loggedIn;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = name.trim();

    if (!normalizedEmail) {
      throw new Error("El email es obligatorio");
    }
    if (!password) {
      throw new Error("La contraseña es obligatoria");
    }
    if (!trimmedName) {
      throw new Error("El nombre es obligatorio");
    }

    const users = await this.getUsers();
    const exists = users.find(
      (candidate) => candidate.email === normalizedEmail,
    );
    if (exists) {
      throw new Error("El email ya está registrado");
    }

    const id = createUserId();
    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(password, salt);

    users.push({
      id,
      email: normalizedEmail,
      name: trimmedName,
      passwordHash,
      salt,
    });
    await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));

    const loggedUser: User = { id, email: normalizedEmail, name: trimmedName };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(loggedUser));
    return loggedUser;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  async resetPassword(
    email: string,
    profileName: string,
    newPassword: string,
  ): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = profileName.trim().toLocaleLowerCase();
    if (!normalizedEmail || !normalizedName || !newPassword) {
      throw new Error("Completa todos los campos");
    }
    if (newPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const users = await this.getUsers();
    const index = users.findIndex(
      (candidate) =>
        candidate.email === normalizedEmail &&
        candidate.name.trim().toLocaleLowerCase() === normalizedName,
    );
    if (index < 0) {
      throw new Error("El email y el nombre no coinciden con ningún perfil");
    }

    const salt = this.generateSalt();
    users[index] = {
      ...users[index],
      salt,
      passwordHash: await this.hashPassword(newPassword, salt),
    };
    await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));
  }

  private async getUsers(): Promise<StoredUser[]> {
    const data = await SecureStore.getItemAsync(USERS_KEY);
    if (!data) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(data);
      return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private generateSalt(): string {
    const array = new Uint8Array(32);
    Crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  private async hashPassword(
    password: string,
    salt: string,
  ): Promise<string> {
    const ITERATIONS = 10000;
    let hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + salt,
    );
    for (let i = 1; i < ITERATIONS; i++) {
      hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        hash,
      );
    }
    return hash;
  }
}
