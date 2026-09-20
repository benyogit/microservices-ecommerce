import { NextFunction, Request, Response } from 'express';

// The API gateway is expected to validate the caller's JWT and forward
// the authenticated user id as a trusted header — this service does no
// JWT validation of its own (same posture as catalogue-service: auth is
// handled upstream).
const USER_ID_HEADER = 'x-user-id';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireUserId(req: Request, res: Response, next: NextFunction): void {
  const userId = req.header(USER_ID_HEADER);
  if (!userId) {
    res.status(401).json({ error: `Missing ${USER_ID_HEADER} header` });
    return;
  }
  req.userId = userId;
  next();
}
