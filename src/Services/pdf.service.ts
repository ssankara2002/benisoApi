import PDFDocument from 'pdfkit';
import prisma from '../prismaClient';
import path from 'path';
import fs from 'fs';

interface EleveData {
  id: number;
  matricule: string | null;
  user: {
    nom: string;
    prenom: string;
    phone: string | null;
    adresse: string | null;
  };
  dateNaissance: Date;
}

class PDFService {
  /**
   * Génère une liste des élèves d'une classe pour une année donnée
   */
  async generateListeEleves(classeId: number, anneeId: number): Promise<Buffer> {
    // Récupérer les informations de la classe
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        niveau: true
      }
    });

    if (!classe) {
      throw new Error('Classe introuvable');
    }

    // Récupérer les informations de l'année
    const annee = await prisma.annee.findUnique({
      where: { id: anneeId }
    });

    if (!annee) {
      throw new Error('Année scolaire introuvable');
    }

    // Récupérer les élèves inscrits dans cette classe pour cette année
    const inscriptions = await prisma.inscription.findMany({
      where: {
        classeId: classeId,
        anneeId: anneeId
      },
      include: {
        eleve: {
          include: {
            user: true
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

    const eleves = inscriptions.map(inscription => inscription.eleve);

    // Créer le document PDF en orientation paysage
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête avec titre et logo placeholder
      doc.fontSize(18).font('Helvetica-Bold').text('LISTE DES ÉLÈVES', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(13).font('Helvetica')
        .text(`Classe: ${classe.nom} - ${classe.niveau.nomNiveau}`, { align: 'center' });
      doc.fontSize(11).text(
        `Année scolaire: ${new Date(annee.dateDebut || '').getFullYear()}-${new Date(annee.dateFin || '').getFullYear()}`,
        { align: 'center' }
      );
      doc.moveDown(0.8);

      // Informations générales
      doc.fontSize(10).font('Helvetica');
      const infoY = doc.y;
      doc.text(`Effectif total: ${eleves.length} élève(s)`, 40, infoY);
      doc.text(`Date d'impression: ${new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}`, 600, infoY, { align: 'right' });
      doc.moveDown(0.8);

      // Ligne de séparation épaisse
      doc.lineWidth(2);
      doc.moveTo(40, doc.y).lineTo(802, doc.y).stroke();
      doc.lineWidth(1);
      doc.moveDown(0.5);

      // En-tête du tableau avec fond gris
      const tableTop = doc.y;
      const headerHeight = 25;

      // Fond gris pour l'en-tête
      doc.rect(40, tableTop, 762, headerHeight).fillAndStroke('#E5E7EB', '#9CA3AF');

      // Colonnes du tableau
      const cols = {
        no: { x: 45, width: 35, label: 'N°' },
        matricule: { x: 80, width: 90, label: 'Matricule' },
        nom: { x: 170, width: 130, label: 'Nom' },
        prenom: { x: 300, width: 130, label: 'Prénom' },
        dateNaissance: { x: 430, width: 100, label: 'Date Naissance' },
        phone: { x: 530, width: 110, label: 'Téléphone' },
        email: { x: 640, width: 160, label: 'Email' }
      };

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1F2937');
      Object.values(cols).forEach(col => {
        doc.text(col.label, col.x, tableTop + 8, { width: col.width, align: 'left' });
      });

      doc.moveDown(0.3);
      const contentTop = tableTop + headerHeight;

      // Ligne après l'en-tête
      doc.moveTo(40, contentTop).lineTo(802, contentTop).stroke('#9CA3AF');

      // Contenu du tableau avec alternance de couleurs
      doc.font('Helvetica').fontSize(8.5).fillColor('#374151');
      let currentY = contentTop + 8;

      eleves.forEach((eleve, index) => {
        // Vérifier s'il faut ajouter une nouvelle page
        if (currentY > 520) {
          doc.addPage({ layout: 'landscape' });
          currentY = 40;
        }

        // Alternance de couleurs pour les lignes
        if (index % 2 === 0) {
          doc.rect(40, currentY - 5, 762, 20).fill('#F9FAFB');
        }

        doc.fillColor('#374151');

        // N°
        doc.text((index + 1).toString(), cols.no.x, currentY, {
          width: cols.no.width,
          align: 'left'
        });

        // Matricule
        doc.text(eleve.matricule || '—', cols.matricule.x, currentY, {
          width: cols.matricule.width,
          align: 'left'
        });

        // Nom (en majuscules)
        doc.text(eleve.user.nom.toUpperCase(), cols.nom.x, currentY, {
          width: cols.nom.width,
          align: 'left'
        });

        // Prénom
        doc.text(eleve.user.prenom, cols.prenom.x, currentY, {
          width: cols.prenom.width,
          align: 'left'
        });

        // Date de Naissance
        doc.text(
          new Date(eleve.dateNaissance).toLocaleDateString('fr-FR'),
          cols.dateNaissance.x,
          currentY,
          { width: cols.dateNaissance.width, align: 'left' }
        );

        // Téléphone
        doc.text(eleve.user.phone || '—', cols.phone.x, currentY, {
          width: cols.phone.width,
          align: 'left'
        });

        // Email (tronqué si trop long)
        const email = eleve.user.email || '—';
        const truncatedEmail = email.length > 25 ? email.substring(0, 22) + '...' : email;
        doc.text(truncatedEmail, cols.email.x, currentY, {
          width: cols.email.width,
          align: 'left'
        });

        currentY += 20;
      });

      // Ligne finale
      doc.moveTo(40, currentY + 5).lineTo(802, currentY + 5).stroke('#9CA3AF');

      // Pied de page
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#6B7280').text(
        'Ce document est généré automatiquement par le système de gestion scolaire.',
        { align: 'center' }
      );

      doc.end();
    });
  }

  /**
   * Génère les cartes scolaires pour les élèves d'une classe pour une année donnée
   */
  async generateCarteScolaire(classeId: number, anneeId: number): Promise<Buffer> {
    // Récupérer les informations de la classe
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        niveau: true
      }
    });

    if (!classe) {
      throw new Error('Classe introuvable');
    }

    // Récupérer les informations de l'année
    const annee = await prisma.annee.findUnique({
      where: { id: anneeId }
    });

    if (!annee) {
      throw new Error('Année scolaire introuvable');
    }

    // Récupérer les élèves inscrits dans cette classe pour cette année
    const inscriptions = await prisma.inscription.findMany({
      where: {
        classeId: classeId,
        anneeId: anneeId
      },
      include: {
        eleve: {
          include: {
            user: true
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

    const eleves = inscriptions.map(inscription => inscription.eleve);

    // Créer le document PDF
    const doc = new PDFDocument({ size: 'A4', margin: 20 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Générer une carte pour chaque élève (3 cartes par page)
      eleves.forEach((eleve, index) => {
        if (index > 0 && index % 3 === 0) {
          doc.addPage();
        }

        const yPosition = (index % 3) * 270 + 30;
        this.drawCarteScolaire(doc, eleve, classe, annee, yPosition);
      });

      doc.end();
    });
  }

  /**
   * Dessine une carte scolaire individuelle
   */
  private drawCarteScolaire(
    doc: PDFKit.PDFDocument,
    eleve: any,
    classe: any,
    annee: any,
    yPosition: number
  ): void {
    const cardWidth = 380;
    const cardHeight = 240;
    const xPosition = (doc.page.width - cardWidth) / 2;
    const margin = 10;

    // Couleurs modernes
    const primaryColor = '#2563EB'; // Bleu moderne
    const secondaryColor = '#F3F4F6'; // Gris clair
    const accentColor = '#10B981'; // Vert accent
    const textColor = '#1F2937'; // Gris foncé

    // Bordure extérieure avec double ligne
    doc.lineWidth(2);
    doc.rect(xPosition, yPosition, cardWidth, cardHeight)
      .stroke(primaryColor);

    doc.lineWidth(0.5);
    doc.rect(xPosition + 3, yPosition + 3, cardWidth - 6, cardHeight - 6)
      .stroke(primaryColor);

    // En-tête avec fond
    const headerHeight = 45;
    doc.rect(xPosition + 3, yPosition + 3, cardWidth - 6, headerHeight)
      .fill(primaryColor);

    // Titre de la carte
    doc.fillColor('#FFFFFF')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('CARTE SCOLAIRE', xPosition, yPosition + 12, {
        width: cardWidth,
        align: 'center'
      });

    // Année scolaire
    doc.fontSize(9)
      .font('Helvetica')
      .text(
        `Année ${new Date(annee.dateDebut || '').getFullYear()}-${new Date(annee.dateFin || '').getFullYear()}`,
        xPosition,
        yPosition + 33,
        { width: cardWidth, align: 'center' }
      );

    // Reset couleur de texte
    doc.fillColor(textColor);

    // Photo de l'élève avec cadre moderne
    const photoX = xPosition + 15;
    const photoY = yPosition + 60;
    const photoSize = 90;

    // Fond gris pour la zone photo
    doc.rect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4)
      .fill(secondaryColor);

    console.log('📸 Photo élève:', eleve.photo);

    if (eleve.photo) {
      try {
        // Construire le chemin complet de la photo
        const photoPath = path.join(process.cwd(), eleve.photo);
        console.log('📁 Chemin photo complet:', photoPath);
        console.log('📂 Process.cwd():', process.cwd());

        // Vérifier si le fichier existe
        if (fs.existsSync(photoPath)) {
          console.log('✅ Photo trouvée, ajout au PDF');
          doc.image(photoPath, photoX, photoY, {
            width: photoSize,
            height: photoSize,
            fit: [photoSize, photoSize],
            align: 'center',
            valign: 'center'
          });
          // Bordure bleue autour de la photo
          doc.lineWidth(1.5)
            .rect(photoX, photoY, photoSize, photoSize)
            .stroke(primaryColor);
        } else {
          console.error('❌ Photo non trouvée à:', photoPath);
          // Si le fichier n'existe pas, afficher un placeholder moderne
          doc.lineWidth(1.5)
            .rect(photoX, photoY, photoSize, photoSize)
            .stroke('#9CA3AF');
          doc.fillColor('#6B7280')
            .fontSize(8)
            .font('Helvetica')
            .text('PHOTO', photoX, photoY + photoSize/2 - 10, {
              width: photoSize,
              align: 'center'
            })
            .text('NON DISPONIBLE', photoX, photoY + photoSize/2 + 2, {
              width: photoSize,
              align: 'center'
            });
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la photo:', error);
        // En cas d'erreur, afficher un placeholder
        doc.lineWidth(1.5)
          .rect(photoX, photoY, photoSize, photoSize)
          .stroke('#DC2626');
        doc.fillColor('#DC2626')
          .fontSize(7)
          .text('ERREUR PHOTO', photoX, photoY + photoSize/2 - 4, {
            width: photoSize,
            align: 'center'
          });
      }
    } else {
      console.log('⚠️ Pas de photo pour cet élève');
      // Pas de photo, afficher un placeholder
      doc.lineWidth(1.5)
        .rect(photoX, photoY, photoSize, photoSize)
        .stroke('#9CA3AF');
      doc.fillColor('#6B7280')
        .fontSize(9)
        .font('Helvetica')
        .text('PHOTO', photoX, photoY + photoSize/2 - 4, {
          width: photoSize,
          align: 'center'
        });
    }

    // Reset couleur
    doc.fillColor(textColor);

    // Informations de l'élève avec design moderne
    const infoX = photoX + photoSize + 18;
    const infoY = photoY;
    const lineHeight = 18;
    const labelWidth = 65;

    // Helper pour dessiner une ligne d'info
    const drawInfoLine = (label: string, value: string, y: number, isHighlight = false) => {
      // Label
      doc.fontSize(7)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(label, infoX, y);

      // Valeur
      doc.fontSize(isHighlight ? 10 : 8)
        .font(isHighlight ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(isHighlight ? primaryColor : textColor)
        .text(value, infoX + labelWidth, y, {
          width: 180,
        });

      // Ligne de séparation légère
      if (!isHighlight) {
        doc.strokeColor('#E5E7EB')
          .lineWidth(0.3)
          .moveTo(infoX, y + 13)
          .lineTo(infoX + 240, y + 13)
          .stroke();
      }
    };

    // Matricule avec badge
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('MATRICULE', infoX, infoY);

    doc.roundedRect(infoX + labelWidth - 3, infoY - 2, 70, 12, 2)
      .fill(accentColor);

    doc.fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text(eleve.matricule || 'N/A', infoX + labelWidth, infoY, {
        width: 65,
        align: 'center'
      });

    // Reset et espace
    doc.fillColor(textColor);
    let currentY = infoY + 20;

    // Nom (mis en évidence)
    drawInfoLine('NOM', eleve.user.nom.toUpperCase(), currentY, true);
    currentY += lineHeight;

    // Prénom
    drawInfoLine('PRÉNOM', eleve.user.prenom, currentY);
    currentY += lineHeight;

    // Date de naissance
    drawInfoLine(
      'NÉ(E) LE',
      new Date(eleve.dateNaissance).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      currentY
    );
    currentY += lineHeight;

    // Classe avec badge
    doc.fontSize(6)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('CLASSE', infoX, currentY);

    doc.roundedRect(infoX + labelWidth - 3, currentY - 2, 110, 13, 2)
      .fillAndStroke(primaryColor, primaryColor);

    doc.fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text(`${classe.nom} - ${classe.niveau.nomNiveau}`, infoX + labelWidth, currentY + 1, {
        width: 105,
        align: 'center'
      });

    // Zone de signature avec fond
    const footerY = yPosition + cardHeight - 55;
    doc.rect(xPosition + 10, footerY, cardWidth - 20, 45)
      .fill(secondaryColor);

    // Message important
    doc.fillColor('#6B7280')
      .fontSize(6)
      .font('Helvetica-Oblique')
      .text(
        'Cette carte est strictement personnelle et doit être présentée à toute demande.',
        xPosition + 15,
        footerY + 6,
        { width: cardWidth - 30, align: 'center' }
      );

    // Ligne de séparation
    doc.strokeColor('#D1D5DB')
      .lineWidth(0.3)
      .moveTo(xPosition + 20, footerY + 20)
      .lineTo(xPosition + cardWidth - 20, footerY + 20)
      .stroke();

    // Signature
    const signatureX = xPosition + cardWidth - 110;
    doc.fillColor(textColor)
      .fontSize(7)
      .font('Helvetica-Bold')
      .text('Le Directeur', signatureX, footerY + 25);

    // Ligne de signature
    doc.strokeColor(primaryColor)
      .lineWidth(0.8)
      .moveTo(signatureX, footerY + 38)
      .lineTo(signatureX + 85, footerY + 38)
      .stroke();

    // Petite icône de validation (simulée avec du texte)
    doc.fontSize(12)
      .fillColor(accentColor)
      .text('✓', signatureX + 70, footerY + 22);

    // Reset line width
    doc.lineWidth(1);
  }

  /**
   * Génère une carte scolaire pour un seul élève
   */
  async generateCarteScolaireIndividuelle(eleveId: number, anneeId: number): Promise<Buffer> {
    // Récupérer l'inscription de l'élève pour l'année donnée
    const inscription = await prisma.inscription.findFirst({
      where: {
        eleveId: eleveId,
        anneeId: anneeId
      },
      include: {
        eleve: {
          include: {
            user: true
          }
        },
        classe: {
          include: {
            niveau: true
          }
        },
        annee: true
      }
    });

    if (!inscription || !inscription.classe) {
      throw new Error('Inscription ou classe introuvable pour cet élève');
    }

    // Vérifier si l'élève a une photo
    if (!inscription.eleve.photo) {
      throw new Error('Photo requise');
    }

    // Créer le document PDF
    const doc = new PDFDocument({ size: 'A4', margin: 20 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawCarteScolaire(doc, inscription.eleve, inscription.classe, inscription.annee, 250);

      doc.end();
    });
  }
}

export default new PDFService();
