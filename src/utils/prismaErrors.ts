/**
 * Gestion des erreurs Prisma
 * Codes d'erreur Prisma : https://www.prisma.io/docs/reference/api-reference/error-reference
 */

export interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
    field_name?: string;
    model_name?: string;
    constraint?: string;
  };
}

export const handlePrismaError = (error: PrismaError): { status: number; message: string } => {
  // P2002: Contrainte d'unicité violée
  if (error.code === 'P2002') {
    const target = error.meta?.target || ['champ'];
    return {
      status: 400,
      message: `Une entrée avec ce ${target.join(', ')} existe déjà`,
    };
  }

  // P2003: Contrainte de clé étrangère violée
  if (error.code === 'P2003') {
    const field = error.meta?.field_name || 'référence';
    return {
      status: 400,
      message: `Impossible d'effectuer cette opération car cette ${field} est utilisée ailleurs dans le système`,
    };
  }

  // P2025: Enregistrement non trouvé
  if (error.code === 'P2025') {
    return {
      status: 404,
      message: 'L\'enregistrement demandé n\'existe pas',
    };
  }

  // P2014: La modification violerait une relation requise
  if (error.code === 'P2014') {
    return {
      status: 400,
      message: 'Impossible de supprimer cet élément car il est lié à d\'autres données',
    };
  }

  // P2015: Enregistrement lié introuvable
  if (error.code === 'P2015') {
    return {
      status: 404,
      message: 'Une relation requise n\'a pas été trouvée',
    };
  }

  // P2016: Erreur d'interprétation de la requête
  if (error.code === 'P2016') {
    return {
      status: 400,
      message: 'Erreur de validation des données',
    };
  }

  // Erreur par défaut
  return {
    status: 500,
    message: error.message || 'Erreur serveur interne',
  };
};

export const isPrismaError = (error: any): error is PrismaError => {
  return error && typeof error.code === 'string' && error.code.startsWith('P');
};
