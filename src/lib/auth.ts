import crypto from 'node:crypto';

const SECRET_KEY = process.env.AUTH_SECRET || 'customwear-bd-super-secret-jwt-key-2026';

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(derivedHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

export interface AuthSession {
  userId: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
  exp: number;
}

export function createSessionToken(payload: Omit<AuthSession, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; // 7 days
  const data = JSON.stringify({ ...payload, exp });
  const b64Data = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(b64Data).digest('base64url');
  return `${b64Data}.${signature}`;
}

export function verifySessionToken(token: string): AuthSession | null {
  try {
    const [b64Data, signature] = token.split('.');
    if (!b64Data || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(b64Data).digest('base64url');
    if (signature !== expectedSignature) return null;
    const session: AuthSession = JSON.parse(Buffer.from(b64Data, 'base64url').toString('utf8'));
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}
