import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType,
} from 'docx';
import prisma from '../prismaClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TypeDocument = 'CERTIFICAT_SCOLARITE' | 'ATTESTATION_NIVEAU' | 'QUITUS_SORTIE';

interface DonneesDocument {
  ecole: {
    nomEcole: string;
    ville: string | null;
    devise: string | null;
    ministere: string | null;
    directionRegionale: string | null;
    directionProvinciale: string | null;
    codeRegion: string | null;
    codeProvince: string | null;
    codeEcole: string | null;
  } | null;
  eleve: {
    nomComplet: string;
    matricule: string | null;
    dateNaissance: string;
    lieuNaissance?: string;
    dateInscription: string;
    classe: string;
    anneeScolaire: string;
  };
  signataire: {
    fonction: string;
    nomComplet: string;
    grade: string;
  };
  numero: string;
  ville: string;
  date: string;
}

// ─── Récupération données ─────────────────────────────────────────────────────

export async function getDonneesDocument(
  eleveId: number,
  anneeId: number,
  signataireFonction: string,
  signataireNom: string,
  signataireGrade: string,
): Promise<DonneesDocument> {

  const [ecole, eleve, annee, compteur] = await Promise.all([
    prisma.configurationEcole.findFirst(),
    prisma.eleve.findUnique({
      where: { id: eleveId },
      include: {
        user: { select: { nom: true, prenom: true } },
        inscriptions: {
          where: { anneeId },
          include: { classe: true, niveau: true, annee: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.annee.findUnique({ where: { id: anneeId } }),
    prisma.configurationEcole.findFirst(),
  ]);

  if (!eleve) throw new Error('Élève introuvable');
  if (!annee) throw new Error('Année scolaire introuvable');

  const inscription = eleve.inscriptions[0];
  const debutAn = annee.dateDebut ? new Date(annee.dateDebut).getFullYear() : '?';
  const finAn = annee.dateFin ? new Date(annee.dateFin).getFullYear() : '?';
  const anneeScolaire = `${debutAn}-${finAn}`;

  const anneeNum = annee.dateDebut ? new Date(annee.dateDebut).getFullYear() : new Date().getFullYear();
  const codeRegion = ecole?.codeRegion ?? 'REG';
  const codeProvince = ecole?.codeProvince ?? 'PROV';
  const codeEcole = ecole?.codeEcole ?? 'ECO';
  const numero = `N°${anneeNum}……/MESFPT/${codeRegion}/${codeProvince}/${codeEcole}`;

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return {
    ecole: ecole ? {
      nomEcole: ecole.nomEcole,
      ville: ecole.ville,
      devise: ecole.devise,
      ministere: ecole.ministere,
      directionRegionale: ecole.directionRegionale,
      directionProvinciale: ecole.directionProvinciale,
      codeRegion: ecole.codeRegion,
      codeProvince: ecole.codeProvince,
      codeEcole: ecole.codeEcole,
    } : null,
    eleve: {
      nomComplet: `${eleve.user.nom} ${eleve.user.prenom}`,
      matricule: eleve.matricule,
      dateNaissance: eleve.dateNaissance
        ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')
        : '…………',
      dateInscription: inscription?.createdAt
        ? new Date(inscription.createdAt).toLocaleDateString('fr-FR')
        : '…………',
      classe: inscription?.classe?.nom ?? '…………',
      anneeScolaire,
    },
    signataire: {
      fonction: signataireFonction,
      nomComplet: signataireNom,
      grade: signataireGrade,
    },
    numero,
    ville: ecole?.ville ?? '…………',
    date: dateStr,
  };
}

// ─── Helpers texte ────────────────────────────────────────────────────────────

function corps(type: TypeDocument, d: DonneesDocument): string[] {
  const e = d.eleve;
  if (type === 'CERTIFICAT_SCOLARITE') {
    return [
      `Je soussigné(e) ${d.signataire.nomComplet}, ${d.signataire.fonction} de ${d.ecole?.nomEcole ?? ''}`,
      '',
      `Certifie que l'élève ${e.nomComplet}  N° Mle ${e.matricule ?? '…………'}`,
      '',
      `Né(e) le ${e.dateNaissance} à …………………………………………`,
      '',
      `Fréquente régulièrement l'établissement depuis le ${e.dateInscription}`,
      '',
      `Et est dans la classe de ${e.classe}`,
      '',
      'En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.',
    ];
  }
  if (type === 'ATTESTATION_NIVEAU') {
    return [
      `Je soussigné(e) ${d.signataire.nomComplet}, ${d.signataire.fonction} de ${d.ecole?.nomEcole ?? ''}`,
      '',
      `Atteste que M. / Mme ${e.nomComplet}`,
      '',
      `Né(e) le ${e.dateNaissance} à …………………………………………`,
      '',
      `Inscrit(e) le ${e.dateInscription}  sous le N° Mle ${e.matricule ?? '…………'}`,
      '',
      `A fréquenté la classe de ${e.classe} pendant l'année scolaire ${e.anneeScolaire}`,
      '',
      'En foi de quoi la présente attestation lui est délivrée pour servir et valoir ce que de droit.',
    ];
  }
  // QUITUS_SORTIE
  return [
    `Je soussigné(e) ${d.signataire.nomComplet}, ${d.signataire.fonction} de ${d.ecole?.nomEcole ?? ''}`,
    '',
    `Atteste que l'élève ${e.nomComplet}`,
    '',
    `En classe de ${e.classe} est en règle vis-à-vis de l'établissement.`,
    '',
    'En foi de quoi le présent quitus lui est délivré pour servir et valoir ce que de droit.',
  ];
}

function titre(type: TypeDocument): string {
  if (type === 'CERTIFICAT_SCOLARITE') return 'CERTIFICAT DE SCOLARITÉ';
  if (type === 'ATTESTATION_NIVEAU') return 'ATTESTATION DE NIVEAU';
  return 'QUITUS DE SORTIE';
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function genererPDF(
  type: TypeDocument,
  d: DonneesDocument,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 100; // largeur utile
    const CX = doc.page.width / 2;
    const ecole = d.ecole;

    // ── En-tête gauche (hiérarchie) ──
    doc.fontSize(7).font('Helvetica-Bold');
    let y = 50;
    const left = (txt: string) => {
      doc.text(txt, 50, y, { width: W / 2 - 10, align: 'center' });
      y += doc.heightOfString(txt, { width: W / 2 - 10 }) + 4;
    };

    if (ecole?.ministere) left(ecole.ministere.toUpperCase());
    doc.font('Helvetica').fontSize(7).text('*'.repeat(9), 50, y, { width: W / 2 - 10, align: 'center' });
    y += 10;
    if (ecole?.directionRegionale) left(ecole.directionRegionale.toUpperCase());
    doc.text('*'.repeat(9), 50, y, { width: W / 2 - 10, align: 'center' }); y += 10;
    if (ecole?.directionProvinciale) left(ecole.directionProvinciale.toUpperCase());
    doc.text('*'.repeat(13), 50, y, { width: W / 2 - 10, align: 'center' }); y += 10;
    if (ecole?.nomEcole) left(ecole.nomEcole.toUpperCase());

    // ── En-tête droite (pays + devise) ──
    doc.font('Helvetica-Bold').fontSize(8);
    doc.text('BURKINA FASO', CX + 10, 50, { width: W / 2 - 10, align: 'center' });
    doc.font('Helvetica').fontSize(7);
    doc.text('*'.repeat(4), CX + 10, 65, { width: W / 2 - 10, align: 'center' });
    if (ecole?.devise) {
      doc.text(`"${ecole.devise}"`, CX + 10, 78, { width: W / 2 - 10, align: 'center' });
    }

    // ── Numéro ──
    const afterHeader = Math.max(y, 120) + 8;
    doc.font('Helvetica').fontSize(8).text(d.numero, 50, afterHeader, { align: 'left' });

    // ── Ligne de séparation ──
    const sepY = afterHeader + 18;
    doc.moveTo(50, sepY).lineTo(doc.page.width - 50, sepY).lineWidth(0.5).stroke('#000');

    // ── Titre du document ──
    const titreY = sepY + 20;
    doc.font('Helvetica-Bold').fontSize(14).text(titre(type), 50, titreY, { align: 'center', underline: true });

    // ── Corps ──
    let bodyY = titreY + 40;
    doc.font('Helvetica').fontSize(10);
    for (const line of corps(type, d)) {
      if (line === '') { bodyY += 8; continue; }
      doc.text(line, 50, bodyY, { width: W, align: 'justify' });
      bodyY += doc.heightOfString(line, { width: W }) + 4;
    }

    // ── Signature ──
    const sigY = bodyY + 40;
    doc.font('Helvetica').fontSize(10)
      .text(`Fait à ${d.ville}, le ${d.date}`, 50, sigY, { align: 'right' });
    doc.font('Helvetica-Bold').fontSize(10)
      .text(d.signataire.fonction, 50, sigY + 18, { align: 'right' });
    doc.font('Helvetica').fontSize(10)
      .text('', 50, sigY + 50) // espace signature
      .text(d.signataire.nomComplet, 50, sigY + 70, { align: 'right' })
      .text(d.signataire.grade, 50, sigY + 84, { align: 'right' });

    doc.end();
  });
}

// ─── WORD ─────────────────────────────────────────────────────────────────────

export async function genererWord(
  type: TypeDocument,
  d: DonneesDocument,
): Promise<Buffer> {
  const ecole = d.ecole;

  const enteteLigne = (txt: string, bold = false) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: txt, bold, size: 16 })],
    });

  const separateur = (s = '*'.repeat(9)) =>
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s, size: 14 })] });

  const vide = () => new Paragraph({ children: [new TextRun('')] });

  const corpsParagraphes = corps(type, d).map((line) =>
    line === ''
      ? vide()
      : new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: line, size: 22 })],
        }),
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // En-tête hiérarchie
        ...(ecole?.ministere ? [enteteLigne(ecole.ministere.toUpperCase(), true)] : []),
        separateur(),
        ...(ecole?.directionRegionale ? [enteteLigne(ecole.directionRegionale.toUpperCase())] : []),
        separateur(),
        ...(ecole?.directionProvinciale ? [enteteLigne(ecole.directionProvinciale.toUpperCase())] : []),
        separateur('*'.repeat(13)),
        ...(ecole?.nomEcole ? [enteteLigne(ecole.nomEcole.toUpperCase(), true)] : []),

        vide(),

        // Pays + devise (simulés côté droit via tableau)
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({ children: [
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [vide()] }),
              new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BURKINA FASO', bold: true, size: 18 })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '****', size: 14 })] }),
                ...(ecole?.devise ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `"${ecole.devise}"`, italics: true, size: 16 })] })] : []),
              ]}),
            ]}),
          ],
        }),

        vide(),

        // Numéro
        new Paragraph({ children: [new TextRun({ text: d.numero, size: 18 })] }),

        vide(),

        // Ligne de séparation
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
          children: [new TextRun('')],
        }),

        vide(),

        // Titre
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: titre(type), bold: true, size: 28, underline: {} })],
        }),

        vide(),
        vide(),

        // Corps
        ...corpsParagraphes,

        vide(),
        vide(),

        // Signature
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: `Fait à ${d.ville}, le ${d.date}`, size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: d.signataire.fonction, bold: true, size: 22 })],
        }),
        vide(), vide(), vide(),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: d.signataire.nomComplet, bold: true, size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: d.signataire.grade, size: 20 })],
        }),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
