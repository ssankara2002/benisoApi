import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';

const prisma = new PrismaClient();

// Étend l'objet Request pour inclure un utilisateur typé
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    roleId?: number;
    roleName?: string;
  };
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Accès non autorisé : token manquant.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (typeof decoded === 'object' && decoded.userId) {
      // Récupérer l'utilisateur depuis la base de données pour vérifier son statut actuel
      const userFromDb = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true }
      });

      if (!userFromDb) {
        res.status(403).json({ message: 'Accès refusé : Utilisateur du token non trouvé.' });
        return;
      }

      // Attacher les informations utilisateur à la requête
      req.user = {
        userId: userFromDb.id,
        email: userFromDb.email,
        roleId: userFromDb.roleId || undefined,
        roleName: userFromDb.role?.name,
      };
      next();
    } else {
      res.status(401).json({ message: 'Token invalide : contenu incorrect' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

export default authenticateToken;