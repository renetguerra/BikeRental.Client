export function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let payload = parts[1];
    // base64url -> base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    // padding
    const pad = payload.length % 4;
    if (pad) payload += '='.repeat(4 - pad);
    const json = atob(payload);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
