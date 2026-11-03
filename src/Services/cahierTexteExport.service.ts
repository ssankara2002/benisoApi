import PDFDocument from 'pdfkit';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  ImageRun,
} from 'docx';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const includeComplet = {
  seance: {
    include: {
      emploiDuTemps: {
        include: {
          classe: { select: { id: true, nom: true } },
          matiere: { select: { id: true, libelle: true } },
        },
      },
    },
  },
  staff: { include: { user: { select: { nom: true, prenom: true } } } },
};

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatHeure(h: string | undefined): string {
  return h ?? '—';
}

async function getCahiersForExport(classeId: number, dateDebut?: Date, dateFin?: Date) {
  return prisma.cahierTexte.findMany({
    where: {
      seance: {
        emploiDuTemps: { classeId },
        ...(dateDebut && dateFin ? { date: { gte: dateDebut, lte: dateFin } } : {}),
      },
    },
    include: includeComplet,
    orderBy: { createdAt: 'asc' },
  });
}

async function getSingleCahier(id: number) {
  return prisma.cahierTexte.findUnique({ where: { id }, include: includeComplet });
}

// ─────────────────────────────────────────────────────────────
//  PDF EXPORT
// ─────────────────────────────────────────────────────────────

function drawSectionTitle(doc: PDFKit.PDFDocument, label: string, y: number): number {
  doc.rect(50, y, doc.page.width - 100, 18).fill('#1e40af');
  doc
    .fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(label.toUpperCase(), 56, y + 4, { width: doc.page.width - 112 });
  doc.fillColor('#1e293b');
  return y + 22;
}

function drawField(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  y: number
): number {
  const pageW = doc.page.width - 100;
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text(label, 50, y, { width: pageW });
  y += 12;
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#1e293b')
    .text(value || '—', 50, y, { width: pageW });
  y += doc.fontSize(9).heightOfString(value || '—', { width: pageW }) + 8;
  return y;
}

export async function exportCahierPDF(id: number): Promise<Buffer> {
  const cahier = await getSingleCahier(id);
  if (!cahier) throw new Error('Cahier introuvable');

  const edt = cahier.seance?.emploiDuTemps;
  const classe = edt?.classe?.nom ?? '—';
  const matiere = edt?.matiere?.libelle ?? '—';
  const jourIndex = edt?.jour ?? 0;
  const jour = JOURS[jourIndex] ?? '—';
  const heureDebut = formatHeure(edt?.heureDebut);
  const heureFin = formatHeure(edt?.heureFin);
  const prof = cahier.staff?.user
    ? `${cahier.staff.user.prenom} ${cahier.staff.user.nom}`
    : '—';

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width - 100;

    // ── En-tête ──
    doc.rect(50, 40, pageW, 60).fill('#1e40af');
    doc
      .fillColor('#ffffff')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('CAHIER DE TEXTE', 50, 52, { width: pageW, align: 'center' });
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`${classe}  ·  ${matiere}`, 50, 76, { width: pageW, align: 'center' });

    // ── Métadonnées ──
    let y = 120;
    const halfW = (pageW - 10) / 2;

    const meta = [
      ['Classe', classe],
      ['Matière', matiere],
      ['Jour', jour],
      ['Horaire', `${heureDebut} – ${heureFin}`],
      ['Date du cours', formatDate(cahier.seance?.date)],
      ['Professeur', prof],
      ['Statut', cahier.valide ? 'Validé' : 'Non validé'],
      ['Date de signature', formatDate(cahier.dateSignature)],
    ];

    doc.rect(50, y, pageW, 2).fill('#1e40af');
    y += 8;

    meta.forEach(([lbl, val], i) => {
      const col = i % 2 === 0 ? 50 : 50 + halfW + 10;
      if (i % 2 === 0 && i > 0) y += 22;
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#64748b').text(lbl, col, y, { width: halfW });
      doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(val, col, y + 10, { width: halfW });
    });
    y += 32;

    doc.rect(50, y, pageW, 1).fill('#e2e8f0');
    y += 12;

    // ── Sections ──
    y = drawSectionTitle(doc, '01  Contenu de la séance', y);
    y += 4;
    y = drawField(doc, '', cahier.contenu, y);
    y += 4;

    y = drawSectionTitle(doc, '02  Devoirs', y);
    y += 4;
    y = drawField(doc, '', cahier.devoirs ?? '—', y);
    y += 4;

    if (cahier.dateRemise) {
      y = drawSectionTitle(doc, '03  Date de remise des devoirs', y);
      y += 4;
      y = drawField(doc, '', formatDate(cahier.dateRemise), y);
      y += 4;
    }

    y = drawSectionTitle(doc, '04  Observations', y);
    y += 4;
    y = drawField(doc, '', cahier.observations ?? '—', y);
    y += 8;

    // ── Signature ──
    if (cahier.signatureProf) {
      const sigLabel = '05  Signature du professeur';
      // Vérifier si on a assez de place sinon nouvelle page
      if (y + 120 > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
      y = drawSectionTitle(doc, sigLabel, y);
      y += 6;

      // Signature est un data URL base64
      try {
        const base64Data = cahier.signatureProf.replace(/^data:image\/\w+;base64,/, '');
        const sigBuffer = Buffer.from(base64Data, 'base64');
        doc.image(sigBuffer, 50, y, { height: 60, fit: [200, 60] });
        y += 70;
      } catch {
        y = drawField(doc, '', '[Signature disponible]', y);
      }
    }

    // ── Pied de page ──
    const footerY = doc.page.height - 40;
    doc.rect(50, footerY - 4, pageW, 1).fill('#e2e8f0');
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} — Système de gestion scolaire`,
        50,
        footerY + 2,
        { width: pageW, align: 'center' }
      );

    doc.end();
  });
}

export async function exportCahierClassePDF(
  classeId: number,
  dateDebut?: Date,
  dateFin?: Date
): Promise<Buffer> {
  const cahiers = await getCahiersForExport(classeId, dateDebut, dateFin);
  if (!cahiers.length) throw new Error('Aucun cahier de texte pour cette classe');

  const classe = cahiers[0]?.seance?.emploiDuTemps?.classe?.nom ?? '—';

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width - 100;

    // ── Page de garde ──
    doc.rect(50, 40, pageW, 80).fill('#1e40af');
    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('CAHIER DE TEXTE', 50, 56, { width: pageW, align: 'center' });
    doc
      .fontSize(13)
      .font('Helvetica')
      .text(`Classe : ${classe}`, 50, 88, { width: pageW, align: 'center' });

    if (dateDebut && dateFin) {
      doc
        .fontSize(10)
        .text(
          `Période : ${formatDate(dateDebut)} – ${formatDate(dateFin)}`,
          50,
          106,
          { width: pageW, align: 'center' }
        );
    }

    let y = 140;
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`${cahiers.length} entrée(s)  ·  Imprimé le ${new Date().toLocaleDateString('fr-FR')}`, 50, y, {
        width: pageW,
        align: 'center',
      });
    y += 24;
    doc.rect(50, y, pageW, 2).fill('#1e40af');
    y += 16;

    // ── Liste des entrées ──
    cahiers.forEach((cahier, index) => {
      const edt = cahier.seance?.emploiDuTemps;
      const matiere = edt?.matiere?.libelle ?? '—';
      const jourIndex = edt?.jour ?? 0;
      const jour = JOURS[jourIndex] ?? '—';
      const heureDebut = formatHeure(edt?.heureDebut);
      const heureFin = formatHeure(edt?.heureFin);
      const prof = cahier.staff?.user
        ? `${cahier.staff.user.prenom} ${cahier.staff.user.nom}`
        : '—';

      // Vérifier l'espace disponible
      if (y + 160 > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }

      // ── Entête entrée ──
      doc.rect(50, y, pageW, 22).fill('#1e40af');
      doc
        .fillColor('#ffffff')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(
          `${String(index + 1).padStart(2, '0')}  ${jour} ${heureDebut}–${heureFin}  ·  ${matiere}`,
          56, y + 6, { width: pageW - 12 }
        );
      doc.fillColor('#1e293b');
      y += 26;

      // Date + Prof
      doc.fontSize(8).font('Helvetica').fillColor('#475569');
      doc.text(`Date : ${formatDate(cahier.seance?.date)}   |   Professeur : ${prof}`, 50, y, { width: pageW });
      y += 14;

      // Contenu
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#334155').text('Contenu :', 50, y);
      y += 11;
      doc.fontSize(8.5).font('Helvetica').fillColor('#1e293b').text(cahier.contenu, 50, y, { width: pageW });
      y += doc.fontSize(8.5).heightOfString(cahier.contenu, { width: pageW }) + 6;

      // Devoirs
      if (cahier.devoirs) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#b45309').text('Devoirs :', 50, y);
        y += 11;
        doc.fontSize(8.5).font('Helvetica').fillColor('#1e293b').text(cahier.devoirs, 50, y, { width: pageW });
        y += doc.fontSize(8.5).heightOfString(cahier.devoirs, { width: pageW }) + 4;
        if (cahier.dateRemise) {
          doc
            .fontSize(7.5)
            .font('Helvetica-Oblique')
            .fillColor('#64748b')
            .text(`À rendre le : ${formatDate(cahier.dateRemise)}`, 50, y, { width: pageW });
          y += 12;
        }
      }

      // Observations
      if (cahier.observations) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text('Observations :', 50, y);
        y += 11;
        doc.fontSize(8.5).font('Helvetica').fillColor('#1e293b').text(cahier.observations, 50, y, { width: pageW });
        y += doc.fontSize(8.5).heightOfString(cahier.observations, { width: pageW }) + 4;
      }

      // Signature inline
      if (cahier.signatureProf) {
        try {
          const base64Data = cahier.signatureProf.replace(/^data:image\/\w+;base64,/, '');
          const sigBuffer = Buffer.from(base64Data, 'base64');
          doc.image(sigBuffer, 50, y, { height: 30, fit: [120, 30] });
          y += 36;
        } catch {
          // ignorer si erreur d'image
        }
      }

      // Statut + séparateur
      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(cahier.valide ? '#16a34a' : '#dc2626')
        .text(cahier.valide ? '✓ Validé' : '○ Non validé', 50, y);
      y += 14;
      doc.rect(50, y, pageW, 1).fill('#e2e8f0');
      y += 14;
    });

    // ── Pied de page ──
    const footerY = doc.page.height - 40;
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} — Système de gestion scolaire`,
        50,
        footerY + 2,
        { width: pageW, align: 'center' }
      );

    doc.end();
  });
}

// ─────────────────────────────────────────────────────────────
//  WORD EXPORT
// ─────────────────────────────────────────────────────────────

function makeParagraph(text: string, opts?: { bold?: boolean; color?: string; size?: number; italic?: boolean }): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts?.bold ?? false,
        color: opts?.color,
        size: (opts?.size ?? 10) * 2, // half-points
        italics: opts?.italic ?? false,
      }),
    ],
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: '1e40af', size: 22 })],
  });
}

function labeledField(label: string, value: string): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: `${label} : `, bold: true, size: 18 }), new TextRun({ text: value || '—', size: 18 })],
    }),
  ];
}

function metaTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: 'f1f5f9' },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 18 })] })],
          }),
        ],
      })
    ),
  });
}

export async function exportCahierWord(id: number): Promise<Buffer> {
  const cahier = await getSingleCahier(id);
  if (!cahier) throw new Error('Cahier introuvable');

  const edt = cahier.seance?.emploiDuTemps;
  const classe = edt?.classe?.nom ?? '—';
  const matiere = edt?.matiere?.libelle ?? '—';
  const jourIndex = edt?.jour ?? 0;
  const jour = JOURS[jourIndex] ?? '—';
  const prof = cahier.staff?.user
    ? `${cahier.staff.user.prenom} ${cahier.staff.user.nom}`
    : '—';

  const sections: any[] = [];

  // Titre
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'CAHIER DE TEXTE', bold: true, size: 32, color: '1e40af' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${classe}  ·  ${matiere}`, size: 22, color: '334155' })],
    }),
    new Paragraph({ children: [] })
  );

  // Tableau des métadonnées
  sections.push(
    sectionHeading('Informations générales'),
    new Paragraph({ children: [] }),
    metaTable([
      ['Classe', classe],
      ['Matière', matiere],
      ['Jour', jour],
      ['Horaire', `${formatHeure(edt?.heureDebut)} – ${formatHeure(edt?.heureFin)}`],
      ['Date du cours', formatDate(cahier.seance?.date)],
      ['Professeur', prof],
      ['Statut', cahier.valide ? 'Validé' : 'Non validé'],
      ['Date de signature', formatDate(cahier.dateSignature)],
    ]),
    new Paragraph({ children: [] })
  );

  // Contenu
  sections.push(
    sectionHeading('Contenu de la séance'),
    new Paragraph({ children: [new TextRun({ text: cahier.contenu, size: 20 })] }),
    new Paragraph({ children: [] })
  );

  // Devoirs
  sections.push(
    sectionHeading('Devoirs'),
    new Paragraph({ children: [new TextRun({ text: cahier.devoirs ?? '—', size: 20 })] })
  );
  if (cahier.dateRemise) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'À rendre le : ', bold: true, size: 18 }),
          new TextRun({ text: formatDate(cahier.dateRemise), size: 18, italics: true }),
        ],
      })
    );
  }
  sections.push(new Paragraph({ children: [] }));

  // Observations
  sections.push(
    sectionHeading('Observations'),
    new Paragraph({ children: [new TextRun({ text: cahier.observations ?? '—', size: 20 })] }),
    new Paragraph({ children: [] })
  );

  // Signature image
  if (cahier.signatureProf) {
    try {
      const base64Data = cahier.signatureProf.replace(/^data:image\/\w+;base64,/, '');
      const sigBuffer = Buffer.from(base64Data, 'base64');
      sections.push(
        sectionHeading('Signature du professeur'),
        new Paragraph({
          children: [
            new ImageRun({
              data: sigBuffer,
              transformation: { width: 150, height: 60 },
              type: 'png',
            }),
          ],
        }),
        new Paragraph({ children: [] })
      );
    } catch {
      // ignorer
    }
  }

  // Pied de page
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Généré le ${new Date().toLocaleDateString('fr-FR')} — Système de gestion scolaire`,
          size: 14,
          color: '94a3b8',
          italics: true,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [{ children: sections }],
  });

  return Packer.toBuffer(doc);
}

export async function exportCahierClasseWord(
  classeId: number,
  dateDebut?: Date,
  dateFin?: Date
): Promise<Buffer> {
  const cahiers = await getCahiersForExport(classeId, dateDebut, dateFin);
  if (!cahiers.length) throw new Error('Aucun cahier de texte pour cette classe');

  const classe = cahiers[0]?.seance?.emploiDuTemps?.classe?.nom ?? '—';
  const docChildren: any[] = [];

  // Titre
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'CAHIER DE TEXTE', bold: true, size: 36, color: '1e40af' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Classe : ${classe}`, size: 24, color: '334155' })],
    })
  );

  if (dateDebut && dateFin) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `Période : ${formatDate(dateDebut)} – ${formatDate(dateFin)}`, size: 20, color: '64748b' }),
        ],
      })
    );
  }

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${cahiers.length} entrée(s)  ·  Imprimé le ${new Date().toLocaleDateString('fr-FR')}`,
          size: 18,
          color: '94a3b8',
        }),
      ],
    }),
    new Paragraph({ children: [] })
  );

  // Une section par cahier
  cahiers.forEach((cahier, index) => {
    const edt = cahier.seance?.emploiDuTemps;
    const matiere = edt?.matiere?.libelle ?? '—';
    const jourIndex = edt?.jour ?? 0;
    const jour = JOURS[jourIndex] ?? '—';
    const prof = cahier.staff?.user
      ? `${cahier.staff.user.prenom} ${cahier.staff.user.nom}`
      : '—';

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `${String(index + 1).padStart(2, '0')}. ${jour}  ·  ${matiere}`,
            bold: true,
            size: 22,
            color: '1e40af',
          }),
        ],
      }),
      ...labeledField('Date', formatDate(cahier.seance?.date)),
      ...labeledField('Professeur', prof),
      ...labeledField('Horaire', `${formatHeure(edt?.heureDebut)} – ${formatHeure(edt?.heureFin)}`),
      new Paragraph({ children: [] }),
      new Paragraph({ children: [new TextRun({ text: 'Contenu :', bold: true, size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: cahier.contenu, size: 20 })] }),
      new Paragraph({ children: [] })
    );

    if (cahier.devoirs) {
      docChildren.push(
        new Paragraph({ children: [new TextRun({ text: 'Devoirs :', bold: true, size: 20, color: 'b45309' })] }),
        new Paragraph({ children: [new TextRun({ text: cahier.devoirs, size: 20 })] })
      );
      if (cahier.dateRemise) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'À rendre le : ', bold: true, size: 18 }),
              new TextRun({ text: formatDate(cahier.dateRemise), size: 18, italics: true }),
            ],
          })
        );
      }
      docChildren.push(new Paragraph({ children: [] }));
    }

    if (cahier.observations) {
      docChildren.push(
        new Paragraph({ children: [new TextRun({ text: 'Observations :', bold: true, size: 18 })] }),
        new Paragraph({ children: [new TextRun({ text: cahier.observations, size: 18, italics: true })] }),
        new Paragraph({ children: [] })
      );
    }

    if (cahier.signatureProf) {
      try {
        const base64Data = cahier.signatureProf.replace(/^data:image\/\w+;base64,/, '');
        const sigBuffer = Buffer.from(base64Data, 'base64');
        docChildren.push(
          new Paragraph({ children: [new TextRun({ text: 'Signature :', bold: true, size: 18 })] }),
          new Paragraph({
            children: [
              new ImageRun({ data: sigBuffer, transformation: { width: 120, height: 48 }, type: 'png' }),
            ],
          }),
          new Paragraph({ children: [] })
        );
      } catch {
        // ignorer
      }
    }

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: cahier.valide ? '✓ Validé' : '○ Non validé',
            bold: true,
            size: 16,
            color: cahier.valide ? '16a34a' : 'dc2626',
          }),
        ],
      }),
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e2e8f0' } },
        children: [],
      }),
      new Paragraph({ children: [] })
    );
  });

  // Pied de page
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Généré le ${new Date().toLocaleDateString('fr-FR')} — Système de gestion scolaire`,
          size: 14,
          color: '94a3b8',
          italics: true,
        }),
      ],
    })
  );

  const wordDoc = new Document({ sections: [{ children: docChildren }] });
  return Packer.toBuffer(wordDoc);
}
