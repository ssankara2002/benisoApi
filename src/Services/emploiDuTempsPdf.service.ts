import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const generateEmploiDuTempsPDF = async (
  classeId: number,
  anneeId: number
): Promise<string> => {
  const [classe, annee, creneaux] = await Promise.all([
    prisma.classe.findUnique({ where: { id: classeId } }),
    prisma.annee.findUnique({ where: { id: anneeId } }),
    prisma.emploiDuTemps.findMany({
      where: { classeId, anneeId, actif: true },
      include: {
        matiere: true,
        staff: { include: { user: true } },
      },
      orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
    }),
  ]);

  // Collecter les tranches horaires uniques
  const horairesSet = new Map<string, string>();
  creneaux.forEach((c) => { if (!horairesSet.has(c.heureDebut)) horairesSet.set(c.heureDebut, c.heureFin); });
  const horaires = Array.from(horairesSet.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  // Construire la grille [heure][jour] -> créneau
  const grille: Record<string, Record<number, typeof creneaux[0] | null>> = {};
  horaires.forEach(([debut]) => {
    grille[debut] = {};
    for (let i = 0; i < 6; i++) grille[debut][i] = null;
  });
  creneaux.forEach((c) => {
    if (grille[c.heureDebut]) grille[c.heureDebut][c.jour] = c;
  });

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 20 });

  const dirPath = path.join(__dirname, '../../emplois_du_temps');
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const fileName = `emploi_${classe?.nom || classeId}_${anneeId}.pdf`;
  const filePath = path.join(dirPath, fileName);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const margin = 20;

  // ── En-tête ──
  doc.fontSize(14).font('Helvetica-Bold').text('EMPLOI DU TEMPS', { align: 'center' });
  doc.fontSize(11).font('Helvetica')
    .text(`Classe : ${classe?.nom || ''}   |   Année scolaire : ${annee?.dateDebut ? new Date(annee.dateDebut).getFullYear() : ''}–${annee?.dateFin ? new Date(annee.dateFin).getFullYear() : ''}`, { align: 'center' });
  doc.moveDown(0.5);

  // ── Calcul des dimensions de la grille ──
  const tableTop = doc.y;
  const colHeureW = 60;
  const nbJours = 6;
  const colJourW = (pageW - margin * 2 - colHeureW) / nbJours;
  const rowH = horaires.length > 0 ? Math.min(60, (pageH - tableTop - margin) / horaires.length) : 50;
  const headerH = 22;

  // ── En-tête des jours ──
  doc.font('Helvetica-Bold').fontSize(9);
  doc.rect(margin, tableTop, colHeureW, headerH).fillAndStroke('#2563EB', '#1e40af');
  doc.fillColor('white').text('Heure', margin, tableTop + 6, { width: colHeureW, align: 'center' });

  JOURS.forEach((jour, i) => {
    const x = margin + colHeureW + i * colJourW;
    doc.rect(x, tableTop, colJourW, headerH).fillAndStroke('#2563EB', '#1e40af');
    doc.fillColor('white').text(jour, x, tableTop + 6, { width: colJourW, align: 'center' });
  });

  // ── Lignes horaires ──
  doc.font('Helvetica').fontSize(8);
  horaires.forEach(([debut, fin], rowIdx) => {
    const y = tableTop + headerH + rowIdx * rowH;
    const bgColor = rowIdx % 2 === 0 ? '#F8FAFC' : '#FFFFFF';

    // Colonne heure
    doc.rect(margin, y, colHeureW, rowH).fillAndStroke(bgColor, '#CBD5E1');
    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8)
      .text(debut, margin, y + rowH / 2 - 10, { width: colHeureW, align: 'center' });
    doc.fillColor('#94A3B8').font('Helvetica').fontSize(7)
      .text(`–${fin}`, margin, y + rowH / 2 + 2, { width: colHeureW, align: 'center' });

    // Colonnes jours
    JOURS.forEach((_, jourIdx) => {
      const x = margin + colHeureW + jourIdx * colJourW;
      const creneau = grille[debut][jourIdx];

      doc.rect(x, y, colJourW, rowH).fillAndStroke(bgColor, '#CBD5E1');

      if (creneau) {
        const couleur = creneau.couleur || '#3B82F6';
        // Carte colorée
        doc.rect(x + 3, y + 3, colJourW - 6, rowH - 6).fillAndStroke(couleur, couleur);
        doc.fillColor('white').font('Helvetica-Bold').fontSize(8)
          .text(creneau.matiere?.libelle || '', x + 5, y + 8, { width: colJourW - 10, align: 'center' });
        const prof = creneau.staff?.user
          ? `${creneau.staff.user.prenom} ${creneau.staff.user.nom}`
          : '';
        doc.font('Helvetica').fontSize(7)
          .text(prof, x + 5, y + 22, { width: colJourW - 10, align: 'center' });
      }
    });
  });

  // ── Pied de page ──
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(7)
    .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageH - 25, { align: 'right' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};
