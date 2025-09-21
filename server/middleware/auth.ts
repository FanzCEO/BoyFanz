import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ error: 'Authentication required' });
}

// Middleware to check if user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

// Middleware to check if user is creator or admin
export function requireCreatorOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user?.role !== 'creator' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Creator or admin access required' });
  }
  
  next();
}

// Middleware to check if user owns resource or is admin
export function requireOwnershipOrAdmin(resourceUserIdField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const currentUserId = req.user?.id;
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user?.role === 'admin' || currentUserId === resourceUserId) {
      return next();
    }
    
    res.status(403).json({ error: 'Access denied' });
  };
}