// src/middlewares/ensureAdmin.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const ensureAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.roleName === 'ADMIN') {
    next(); // L'utilisateur est admin, continuer
  } else {
    res.status(403).json({ message: 'Accès refusé. Seul un administrateur peut effectuer cette action.' });
  }
};

export const ensureRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.roleName === requiredRole) {
      next();
    } else {
      res.status(403).json({ message: `Accès refusé. Rôle ${requiredRole} requis.` });
    }
  };
};

export const ensureAdminOrProviseur = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.roleName === 'ADMIN' || req.user.roleName === 'PROVISEUR')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Seul un administrateur ou un proviseur peut effectuer cette action.' });
  }
};

export const ensureMultipleRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.roleName && allowedRoles.includes(req.user.roleName)) {
      next();
    } else {
      res.status(403).json({ message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}` });
    }
  };
};

export const ensurePermission = (requiredPermission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.user.roleId) {
      res.status(401).json({ message: 'Authentification requise.' });
      return;
    }

    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

    
      const userRole = await prisma.role.findUnique({
        where: { id: req.user.roleId },
        include: { permissions: true }
      });

      if (!userRole) {
        res.status(403).json({ message: 'Rôle utilisateur non trouvé.' });
        return;
      }

      // L'admin a toutes les permissions
      if (userRole.name === 'ADMIN') {
        next();
        return;
      }

      const hasPermission = userRole.permissions.some((permission: any) =>
        permission.key === requiredPermission
      );


      if (hasPermission) {
        next();
      } else {
        res.status(403).json({ message: `Permission ${requiredPermission} requise.` });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la vérification des permissions.' });
    }
  };
};
