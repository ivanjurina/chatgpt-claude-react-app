const SESSION_TOKEN_KEY = 'token';
const USER = 'user';

export function getSessionToken(): string | null {
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string): void {
  return sessionStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearSessionToken(): void {
  return sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

export function getUser(): string | null {
  return sessionStorage.getItem(USER);
}

export function setUser(user: string): void {
  return sessionStorage.setItem(USER, user);
}

export function clearUser(): void {
  return sessionStorage.removeItem(USER);
}
