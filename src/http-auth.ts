import { timingSafeEqual } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export function bearerAuth(req: Request, res: Response, next: NextFunction): void {
  const authToken = process.env.MCP_AUTH_TOKEN;
  if (!authToken) {
    console.error('MCP_AUTH_TOKEN is not set — refusing all requests');
    res.status(500).json({ error: 'Server misconfiguration: authentication not set' });
    return;
  }
  const header = req.headers['authorization'] ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(authToken);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      next();
      return;
    }
  } catch {
    // fall through to 401
  }
  res.status(401).json({ error: 'Unauthorized' });
}
