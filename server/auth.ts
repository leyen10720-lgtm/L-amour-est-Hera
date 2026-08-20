import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'hera_secret_admin_key_2026_victorian_archive';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_hera_2026';

export interface AdminSession {
  username: string;
  role: 'admin';
  exp: number;
}

export function createAdminToken(username: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      username,
      role: 'admin',
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const session: AdminSession = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.exp < Date.now() || session.role !== 'admin') {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  const validUser = username.trim() === ADMIN_USERNAME;
  const validPass = password.trim() === ADMIN_PASSWORD;
  return validUser && validPass;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminSession;
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'] as string;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Vui lòng đăng nhập quyền Admin để thực hiện thao tác này.',
    });
  }

  const session = verifyAdminToken(token);
  if (!session) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Phiên đăng nhập Admin không hợp lệ hoặc đã hết hạn.',
    });
  }

  req.admin = session;
  next();
}
