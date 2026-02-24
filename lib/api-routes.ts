// REST API Routes for Third-Party Integration
// This file demonstrates the structure for REST API endpoints
// In production, implement with Next.js API Routes

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
  },
  CLONES: {
    LIST: '/api/v1/clones',
    GET: '/api/v1/clones/:id',
    CREATE: '/api/v1/clones',
    UPDATE: '/api/v1/clones/:id',
    DELETE: '/api/v1/clones/:id',
  },
  RENOVATIONS: {
    LIST: '/api/v1/renovations',
    GET: '/api/v1/renovations/:id',
    CREATE: '/api/v1/renovations',
    UPDATE: '/api/v1/renovations/:id',
    DELETE: '/api/v1/renovations/:id',
  },
  SOUNDS: {
    LIST: '/api/v1/sounds',
    GET: '/api/v1/sounds/:id',
    PLAY: '/api/v1/sounds/:id/play',
  },
  USERS: {
    LIST: '/api/v1/users',
    GET: '/api/v1/users/:id',
    CREATE: '/api/v1/users',
    UPDATE: '/api/v1/users/:id',
    DELETE: '/api/v1/users/:id',
  },
  BACKUPS: {
    LIST: '/api/v1/backups',
    GET: '/api/v1/backups/:id',
    CREATE: '/api/v1/backups',
    DELETE: '/api/v1/backups/:id',
  },
  AUDIT: {
    LIST: '/api/v1/audit',
    STATS: '/api/v1/audit/stats',
  },
  CONFIG: {
    LIST: '/api/v1/config',
    GET: '/api/v1/config/:key',
    SET: '/api/v1/config/:key',
  },
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}

// Request interceptor for API key validation
export function validateApiKey(apiKey: string): boolean {
  // This will be implemented as middleware in Next.js API routes
  const keyHash = Buffer.from(apiKey).toString('base64');
  // Validate against stored keys
  return keyHash.length > 0;
}

// Response formatter
export function formatApiResponse<T>(data: T, success: boolean = true, error?: string): ApiResponse<T> {
  return {
    success,
    data: success ? data : undefined,
    error: !success ? error : undefined,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

// Rate limiting structure (implement with Redis in production)
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs = 60000; // 1 minute
  private maxRequests = 100;

  isLimited(clientId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(clientId) || [];

    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return true;
    }

    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    return false;
  }
}

export const rateLimiter = new RateLimiter();
