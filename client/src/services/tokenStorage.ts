/**
 * Centralised token storage utility.
 * All reads and writes go through these helpers so the storage key
 * is defined in exactly one place and is easy to swap out later.
 */

const TOKEN_KEY = "auth_token";

export const tokenStorage = {
  /** Persist a JWT access token. */
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /** Return the stored token, or null if none exists. */
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /** Remove the stored token (called on logout or 401). */
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
