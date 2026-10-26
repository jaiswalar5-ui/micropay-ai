import { Request, Response, NextFunction } from 'express';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

// Clean up stale buckets every 5 minutes (unref so it doesn't block process exit)
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
}, 1000 * 60 * 5).unref();

export function rateLimiter(options: { maxRequests: number; windowMs: number }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let bucket = buckets.get(ip);
    if (!bucket || now > bucket.resetAt) {
      bucket = {
        count: 1,
        resetAt: now + options.windowMs
      };
      buckets.set(ip, bucket);
      return next();
    }

    if (bucket.count >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        error: 'Too many requests. Please slow down.',
        retryAfterSeconds
      });
      return;
    }

    bucket.count += 1;
    next();
  };
}
