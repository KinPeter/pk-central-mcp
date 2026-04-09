import { timingSafeEqual } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

function isValidToken(token: string, authToken: string): boolean {
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(authToken);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function bearerAuth(req: Request, res: Response, next: NextFunction): void {
  const authToken = process.env.MCP_AUTH_TOKEN;
  if (!authToken) {
    console.error('MCP_AUTH_TOKEN is not set — refusing all requests');
    res.status(500).json({ error: 'Server misconfiguration: authentication not set' });
    return;
  }

  const header = req.headers['authorization'] ?? '';
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (headerToken && isValidToken(headerToken, authToken)) {
    next();
    return;
  }

  const queryToken = typeof req.query['api_key'] === 'string' ? req.query['api_key'] : '';
  if (queryToken && isValidToken(queryToken, authToken)) {
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized' });
}
