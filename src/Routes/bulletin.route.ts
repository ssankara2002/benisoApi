import express from 'express';
import { getBulletinData, generateBulletinPDF, getBulletinsClasse } from '../Controllers/bulletin.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bulletins
 *   description: Gestion des bulletins scolaires
 */


/**
 * @swagger
 * /api/bulletins/classe/{classeId}/annee/{anneeId}/trimestre/{trimestreId}:
 *   get:
 *     summary: Récupérer les bulletins de tous les élèves d'une classe pour une année et un trimestre donnés
 *     tags: [Bulletins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *         example: 1
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *         example: 1
 *       - in: path
 *         name: trimestreId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du trimestre
 *         example: 1
 *     responses:
 *       200:
 *         description: Bulletins de tous les élèves récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     classe:
 *                       type: string
 *                       example: "6ème A"
 *                     niveau:
 *                       type: string
 *                       example: "6ème"
 *                     anneeId:
 *                       type: integer
 *                       example: 1
 *                     trimestreId:
 *                       type: integer
 *                       example: 1
 *                     trimestreNom:
 *                       type: string
 *                       example: "1er Trimestre"
 *                     totalEleves:
 *                       type: integer
 *                       example: 35
 *                     bulletins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           eleveId:
 *                             type: integer
 *                             example: 1
 *                           nom:
 *                             type: string
 *                             example: "Diallo"
 *                           prenom:
 *                             type: string
 *                             example: "Amadou"
 *                           bulletin:
 *                             type: object
 *                             description: "Données complètes du bulletin (voir endpoint /api/bulletins/{eleveId}/{classeId}/{trimestreId}/{anneeId})"
 *                             example: {}
 *                           error:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *       400:
 *         description: IDs invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "IDs invalides"
 *       404:
 *         description: Classe, année ou trimestre non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucun élève trouvé pour cette classe et cette année"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération des bulletins"
 */
router.get('/classe/:classeId/annee/:anneeId/trimestre/:trimestreId', authenticateToken, ensurePermission('bulletin.read'), getBulletinsClasse);

/**
 * @swagger
 * /api/bulletins/{eleveId}/{classeId}/{trimestreId}/{anneeId}/pdf:
 *   get:
 *     summary: Générer et télécharger le PDF du bulletin d'un élève
 *     tags: [Bulletins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 1
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *         example: 1
 *       - in: path
 *         name: trimestreId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du trimestre
 *         example: 1
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *         example: 1
 *     responses:
 *       200:
 *         description: PDF du bulletin généré et téléchargé
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: IDs invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "IDs invalides"
 *       404:
 *         description: Élève ou trimestre non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Élève non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la génération du PDF"
 */
router.get('/:eleveId/:classeId/:trimestreId/:anneeId/pdf', authenticateToken, ensurePermission('bulletin.read'), generateBulletinPDF);

/**
 * @swagger
 * /api/bulletins/{eleveId}/{classeId}/{trimestreId}/{anneeId}:
 *   get:
 *     summary: Récupérer les données du bulletin d'un élève pour une classe, un trimestre et une année
 *     tags: [Bulletins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 1
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *         example: 1
 *       - in: path
 *         name: trimestreId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du trimestre
 *         example: 1
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *         example: 1
 *     responses:
 *       200:
 *         description: Données du bulletin récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     eleve:
 *                       type: object
 *                       properties:
 *                         nom:
 *                           type: string
 *                           example: "Diallo"
 *                         prenom:
 *                           type: string
 *                           example: "Amadou"
 *                         niveau:
 *                           type: string
 *                           example: "6ème"
 *                     classe:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nom:
 *                           type: string
 *                           example: "6ème A"
 *                         niveau:
 *                           type: string
 *                           example: "6ème"
 *                     trimestre:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nom:
 *                           type: string
 *                           example: "1er Trimestre"
 *                     annee:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         libelle:
 *                           type: string
 *                           example: "2024-2025"
 *                         dateDebut:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-09-01T00:00:00Z"
 *                         dateFin:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-15T00:00:00Z"
 *                     notesByMatiere:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           matiereId:
 *                             type: integer
 *                             example: 1
 *                           matiereLibelle:
 *                             type: string
 *                             example: "Mathématiques"
 *                           typeMatiere:
 *                             type: string
 *                             example: "FONDAMENTALE"
 *                           devoir:
 *                             type: number
 *                             format: float
 *                             nullable: true
 *                             example: 16.5
 *                           interro:
 *                             type: number
 *                             format: float
 *                             nullable: true
 *                             example: 15
 *                           compo:
 *                             type: number
 *                             format: float
 *                             nullable: true
 *                             example: 14
 *                           moyenne:
 *                             type: number
 *                             format: float
 *                             example: 15.17
 *                           appreciation:
 *                             type: string
 *                             example: "Très bien"
 *                           coef:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           notePonderee:
 *                             type: number
 *                             format: float
 *                             example: 45.5
 *                           nomProf:
 *                             type: string
 *                             example: "M. Diallo"
 *                     moyennesParType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           typeMatiere:
 *                             type: string
 *                             example: "FONDAMENTALE"
 *                           moyenne:
 *                             type: number
 *                             format: float
 *                             example: 14.8
 *                           meilleureMoyenne:
 *                             type: number
 *                             format: float
 *                             example: 18
 *                           totalCoef:
 *                             type: number
 *                             format: float
 *                             example: 12
 *                           rang:
 *                             type: integer
 *                             example: 3
 *                           totalEleves:
 *                             type: integer
 *                             example: 35
 *                     moyenneGenerale:
 *                       type: number
 *                       format: float
 *                       example: 14.25
 *                     moyenneDefinitive:
 *                       type: number
 *                       format: float
 *                       example: 14.15
 *                     moyenneAnnuelle:
 *                       type: number
 *                       format: float
 *                       example: 14.5
 *                     appreciationGenerale:
 *                       type: string
 *                       example: "Bien"
 *                     rang:
 *                       type: integer
 *                       example: 3
 *                     totalEleves:
 *                       type: integer
 *                       example: 35
 *                     meilleureMoyenneClasse:
 *                       type: number
 *                       format: float
 *                       example: 18.5
 *                     moyennePlusBasse:
 *                       type: number
 *                       format: float
 *                       example: 8.5
 *                     absences:
 *                       type: object
 *                       properties:
 *                         justifiees:
 *                           type: number
 *                           example: 4
 *                         nonJustifiees:
 *                           type: number
 *                           example: 2
 *                         total:
 *                           type: number
 *                           example: 6
 *                         retraitPoints:
 *                           type: number
 *                           format: float
 *                           example: 0.5
 *                     rappelMoyennes:
 *                       type: object
 *                       properties:
 *                         trimestre1:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *                           example: 13.8
 *                         trimestre2:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *                           example: 14
 *       400:
 *         description: IDs invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "IDs invalides"
 *       404:
 *         description: Élève ou trimestre non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Élève non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération du bulletin"
 */
router.get('/:eleveId/:classeId/:trimestreId/:anneeId', authenticateToken, ensurePermission('bulletin.read'), getBulletinData);

export default router;
