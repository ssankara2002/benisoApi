import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface CahierNotesData {
  professeur: {
    nom: string;
    prenom: string;
  };
  annee: {
    dateDebut: Date | null;
    dateFin: Date | null;
  };
  classe: {
    nom: string;
    niveau: string;
  };
  matieres: Array<{
    id: number;
    libelle: string;
    coefficient: number;
    volumeHoraire: number;
  }>;
  eleves: Array<{
    id: number;
    nom: string;
    prenom: string;
    matricule: string | null;
    sexe: string;
  }>;
}

// Générer uniquement la page de garde
export const generatePageGardePDF = async (
  staffId: number,
  anneeId: number,
  classeId: number
): Promise<string> => {
  const cahierData = await getCahierData(staffId, anneeId, classeId);

  const uploadsDir = path.join(process.cwd(), 'uploads', 'cahiers');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `page_garde_${staffId}_${anneeId}_${classeId}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      generatePageGarde(doc, cahierData);

      doc.end();

      stream.on('finish', () => resolve(fileName));
      stream.on('error', (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

// Générer uniquement la liste des élèves
export const generateListeElevesPDF = async (
  staffId: number,
  anneeId: number,
  classeId: number
): Promise<string> => {
  const cahierData = await getCahierData(staffId, anneeId, classeId);

  const uploadsDir = path.join(process.cwd(), 'uploads', 'cahiers');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `liste_eleves_${staffId}_${anneeId}_${classeId}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      generateListeEleves(doc, cahierData);

      doc.end();

      stream.on('finish', () => resolve(fileName));
      stream.on('error', (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

// Fonction helper pour récupérer les données
async function getCahierData(
  staffId: number,
  anneeId: number,
  classeId: number
): Promise<CahierNotesData> {
  // Récupérer les données
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true
        }
      }
    }
  });

  if (!staff) throw new Error('Professeur introuvable');

  const annee = await prisma.annee.findUnique({
    where: { id: anneeId }
  });

  if (!annee) throw new Error('Année scolaire introuvable');

  const classe = await prisma.classe.findUnique({
    where: { id: classeId },
    include: {
      niveau: true
    }
  });

  if (!classe) throw new Error('Classe introuvable');

  const enseignements = await prisma.enseignementAnnee.findMany({
    where: {
      staffId: staffId,
      classeId: classeId,
      anneeId: anneeId
    },
    include: {
      matiere: true
    }
  });

  const matieresAvecCoef = await Promise.all(
    enseignements.map(async (ens) => {
      const coefNiveau = await prisma.coeficientNiveau.findFirst({
        where: {
          niveauId: classe.niveauId,
          matiereId: ens.matiereId
        }
      });

      return {
        id: ens.matiere.id,
        libelle: ens.matiere.libelle,
        coefficient: coefNiveau?.valeur || 1,
        volumeHoraire: ens.volumeHoraire || 0
      };
    })
  );

  const inscriptions = await prisma.inscription.findMany({
    where: {
      classeId: classeId,
      anneeId: anneeId
    },
    include: {
      eleve: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              sexe: true
            }
          }
        }
      }
    },
    orderBy: {
      eleve: {
        user: {
          nom: 'asc'
        }
      }
    }
  });

  const eleves = inscriptions.map(insc => ({
    id: insc.eleve.id,
    nom: insc.eleve.user.nom,
    prenom: insc.eleve.user.prenom,
    matricule: insc.eleve.matricule,
    sexe: insc.eleve.user.sexe || ''
  }));

  return {
    professeur: {
      nom: staff.user.nom,
      prenom: staff.user.prenom
    },
    annee: {
      dateDebut: annee.dateDebut,
      dateFin: annee.dateFin
    },
    classe: {
      nom: classe.nom,
      niveau: classe.niveau.nomNiveau
    },
    matieres: matieresAvecCoef,
    eleves: eleves
  };
}

function generatePageGarde(doc: typeof PDFDocument.prototype, data: CahierNotesData) {
  const anneeDebut = data.annee.dateDebut ? new Date(data.annee.dateDebut).getFullYear() : '';
  const anneeFin = data.annee.dateFin ? new Date(data.annee.dateFin).getFullYear() : '';

  // En-tête avec bordure
  doc.fontSize(28).font('Helvetica-Bold').text('Cahier de Notes', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(18).font('Helvetica').text(`Année Scolaire: ${anneeDebut}-${anneeFin}`, { align: 'center' });

  // Ligne de séparation
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1.5);

  // Informations du professeur - Style 2 colonnes
  const infoStartY = doc.y;
  doc.fontSize(11).font('Helvetica-Bold');

  // Colonne gauche
  doc.text('Nom du Professeur:', 50, infoStartY);
  doc.font('Helvetica').fontSize(13).text(data.professeur.nom.toUpperCase(), 50, infoStartY + 20);

  doc.font('Helvetica-Bold').fontSize(11).text('Classe:', 50, infoStartY + 55);
  doc.font('Helvetica').fontSize(13).text(data.classe.nom, 50, infoStartY + 75);

  // Colonne droite
  doc.font('Helvetica-Bold').fontSize(11).text('Prénom du Professeur:', 320, infoStartY);
  doc.font('Helvetica').fontSize(13).text(data.professeur.prenom, 320, infoStartY + 20);

  doc.font('Helvetica-Bold').fontSize(11).text('Niveau:', 320, infoStartY + 55);
  doc.font('Helvetica').fontSize(13).text(data.classe.niveau, 320, infoStartY + 75);

  doc.moveDown(7);

  // Titre du tableau
  doc.fontSize(16).font('Helvetica-Bold').text('Matières Enseignées', { align: 'left' });
  doc.moveDown(0.8);

  const tableTop = doc.y;
  const col1X = 50;
  const col2X = 380;
  const col3X = 470;
  const tableWidth = 495;
  const rowHeight = 30;

  // En-têtes du tableau avec fond gris
  doc.fontSize(12).font('Helvetica-Bold');
  doc.rect(col1X, tableTop, tableWidth, rowHeight).fillAndStroke('#f3f4f6', '#000');
  doc.fillColor('#000').text('Matière', col1X + 10, tableTop + 10);
  doc.text('Coefficient', col2X + 20, tableTop + 10, { width: 60, align: 'center' });
  doc.text('H/Hebdo', col3X + 10, tableTop + 10, { width: 65, align: 'center' });

  // Lignes du tableau
  doc.font('Helvetica').fontSize(11);
  data.matieres.forEach((matiere, index) => {
    const y = tableTop + rowHeight * (index + 1);
    const fillColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';

    doc.rect(col1X, y, tableWidth, rowHeight).fillAndStroke(fillColor, '#000');
    doc.fillColor('#000').text(matiere.libelle, col1X + 10, y + 10, { width: 310 });
    doc.text(matiere.coefficient.toString(), col2X + 20, y + 10, { width: 60, align: 'center' });
    doc.text(matiere.volumeHoraire.toString(), col3X + 10, y + 10, { width: 65, align: 'center' });
  });

  // Statistiques avec bordure
  const statsY = tableTop + rowHeight * (data.matieres.length + 1) + 30;
  const statBoxWidth = 150;
  const totalHeures = data.matieres.reduce((sum, m) => sum + m.volumeHoraire, 0);

  doc.fontSize(10).font('Helvetica-Bold');

  // Box 1 - Nombre de matières
  doc.rect(50, statsY, statBoxWidth, 50).stroke();
  doc.fillColor('#6b7280').text('Nombre de matières', 60, statsY + 10, { width: 130, align: 'center' });
  doc.fillColor('#000').fontSize(20).text(data.matieres.length.toString(), 60, statsY + 25, { width: 130, align: 'center' });

  // Box 2 - Nombre d'élèves
  doc.fontSize(10);
  doc.rect(220, statsY, statBoxWidth, 50).stroke();
  doc.fillColor('#6b7280').text("Nombre d'élèves", 230, statsY + 10, { width: 130, align: 'center' });
  doc.fillColor('#000').fontSize(20).text(data.eleves.length.toString(), 230, statsY + 25, { width: 130, align: 'center' });

  // Box 3 - Volume horaire total
  doc.fontSize(10);
  doc.rect(390, statsY, statBoxWidth, 50).stroke();
  doc.fillColor('#6b7280').text('Volume horaire total', 400, statsY + 10, { width: 130, align: 'center' });
  doc.fillColor('#000').fontSize(20).text(`${totalHeures}h`, 400, statsY + 25, { width: 130, align: 'center' });
}

function generateListeEleves(doc: typeof PDFDocument.prototype, data: CahierNotesData) {
  const margin = 30;
  const pageWidth = 595.28; // A4 portrait
  const pageHeight = 841.89;

  const anneeDebut = data.annee.dateDebut ? new Date(data.annee.dateDebut).getFullYear() : '';
  const anneeFin = data.annee.dateFin ? new Date(data.annee.dateFin).getFullYear() : '';

  let currentY = margin;

  // En-tête - Informations principales
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
  doc.text(`Année Scolaire ${anneeDebut}-${anneeFin}`, margin, currentY, { align: 'center', width: pageWidth - 2 * margin });
  currentY += 20;

  doc.fontSize(8).font('Helvetica');
  doc.text(`Relevé de notes de la Classe du : ${data.classe.nom}`, margin, currentY);
  currentY += 15;

  // Matières (toutes les matières enseignées)
  const matieresList = data.matieres.map(m => m.libelle).join(', ');
  doc.text(`Matières : ${matieresList}`, margin, currentY, { width: pageWidth - 2 * margin });
  currentY += 15;

  // Professeur
  doc.text(`Professeur : ${data.professeur.prenom} ${data.professeur.nom}`, margin, currentY);
  currentY += 20;

  // Tableau
  const tableTop = currentY;
  const rowHeight = 18;
  let xPos = margin;

  // Colonnes - adapté pour A4 portrait
  const ordreWidth = 25;
  const elevesWidth = 130;
  const sexeWidth = 25;
  const redWidth = 25;
  const noteWidth = 30;

  // En-tête du tableau - 2 lignes
  doc.fontSize(7).font('Helvetica-Bold');
  currentY = tableTop;

  // === LIGNE 1: Groupes ===
  xPos = margin;

  // Ordre (rowspan 2)
  doc.rect(xPos, currentY, ordreWidth, rowHeight * 2).stroke();
  doc.text('Ordre', xPos + 2, currentY + 10, { width: ordreWidth - 4, align: 'center' });
  xPos += ordreWidth;

  // Eleves (rowspan 2)
  doc.rect(xPos, currentY, elevesWidth, rowHeight * 2).stroke();
  doc.text('Eleves', xPos + 2, currentY + 10, { width: elevesWidth - 4, align: 'center' });
  xPos += elevesWidth;

  // Sexe (rowspan 2)
  doc.rect(xPos, currentY, sexeWidth, rowHeight * 2).stroke();
  doc.text('Sexe', xPos + 2, currentY + 10, { width: sexeWidth - 4, align: 'center' });
  xPos += sexeWidth;

  // Red (rowspan 2)
  doc.rect(xPos, currentY, redWidth, rowHeight * 2).stroke();
  doc.text('Red', xPos + 2, currentY + 10, { width: redWidth - 4, align: 'center' });
  xPos += redWidth;

  // Trimestre 1 (colspan 4)
  const trimWidth = noteWidth * 4;
  doc.rect(xPos, currentY, trimWidth, rowHeight).stroke();
  doc.text('Trimestre 1', xPos + 2, currentY + 6, { width: trimWidth - 4, align: 'center' });
  xPos += trimWidth;

  // Trimestre 2 (colspan 4)
  doc.rect(xPos, currentY, trimWidth, rowHeight).stroke();
  doc.text('Trimestre 2', xPos + 2, currentY + 6, { width: trimWidth - 4, align: 'center' });
  xPos += trimWidth;

  // Trimestre 3 (colspan 4)
  doc.rect(xPos, currentY, trimWidth, rowHeight).stroke();
  doc.text('Trimestre 3', xPos + 2, currentY + 6, { width: trimWidth - 4, align: 'center' });

  currentY += rowHeight;

  // === LIGNE 2: Note1-4 pour chaque trimestre ===
  xPos = margin + ordreWidth + elevesWidth + sexeWidth + redWidth;

  doc.fontSize(6);
  // Trimestre 1 - 4 notes
  for (let n = 1; n <= 4; n++) {
    doc.rect(xPos, currentY, noteWidth, rowHeight).stroke();
    doc.text(`Note${n}`, xPos + 2, currentY + 6, { width: noteWidth - 4, align: 'center' });
    xPos += noteWidth;
  }

  // Trimestre 2 - 4 notes
  for (let n = 1; n <= 4; n++) {
    doc.rect(xPos, currentY, noteWidth, rowHeight).stroke();
    doc.text(`Note${n}`, xPos + 2, currentY + 6, { width: noteWidth - 4, align: 'center' });
    xPos += noteWidth;
  }

  // Trimestre 3 - 4 notes
  for (let n = 1; n <= 4; n++) {
    doc.rect(xPos, currentY, noteWidth, rowHeight).stroke();
    doc.text(`Note${n}`, xPos + 2, currentY + 6, { width: noteWidth - 4, align: 'center' });
    xPos += noteWidth;
  }

  currentY += rowHeight;

  // === LIGNES DES ÉLÈVES ===
  doc.font('Helvetica').fontSize(7);
  data.eleves.forEach((eleve, index) => {
    if (currentY > pageHeight - 60) {
      doc.addPage({ size: 'A4', layout: 'portrait' });
      currentY = margin;
    }

    xPos = margin;
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f8f8';

    // Ordre
    doc.rect(xPos, currentY, ordreWidth, rowHeight).fillAndStroke(bgColor, '#000');
    doc.fillColor('#000').text((index + 1).toString(), xPos + 2, currentY + 6, { width: ordreWidth - 4, align: 'center' });
    xPos += ordreWidth;

    // Nom et prénom
    doc.rect(xPos, currentY, elevesWidth, rowHeight).fillAndStroke(bgColor, '#000');
    doc.fillColor('#000').text(`${eleve.nom} ${eleve.prenom}`, xPos + 3, currentY + 6, { width: elevesWidth - 6 });
    xPos += elevesWidth;

    // Sexe
    doc.rect(xPos, currentY, sexeWidth, rowHeight).fillAndStroke(bgColor, '#000');
    doc.fillColor('#000').text(eleve.sexe || '', xPos + 2, currentY + 6, { width: sexeWidth - 4, align: 'center' });
    xPos += sexeWidth;

    // Redoublant
    doc.rect(xPos, currentY, redWidth, rowHeight).fillAndStroke(bgColor, '#000');
    xPos += redWidth;

    // Notes des 3 trimestres (4 notes chacun)
    for (let t = 0; t < 3; t++) {
      for (let n = 0; n < 4; n++) {
        doc.rect(xPos, currentY, noteWidth, rowHeight).fillAndStroke(bgColor, '#000');
        xPos += noteWidth;
      }
    }

    currentY += rowHeight;
  });

  // Pied de page - juste après la liste
  currentY += 10;
  doc.fontSize(6).font('Helvetica-Oblique').fillColor('#666');
  doc.text(`Imprimé le ${new Date().toLocaleDateString('fr-FR')}`, margin, currentY, { align: 'left' });
}
