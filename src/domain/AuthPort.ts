export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthPort {
  getCurrentUser(): Promise<User | null>;
  login(email: string, password: string): Promise<User>;
  register(name: string, email: string, password: string): Promise<User>;
  resetPassword(
    email: string,
    profileName: string,
    newPassword: string,
  ): Promise<void>;
  logout(): Promise<void>;
}
