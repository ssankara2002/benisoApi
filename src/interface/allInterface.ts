import { User, TypeEnseignementEnum } from '@prisma/client';

// ============================================================================
// === Email Interfaces ===
// ============================================================================

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// ============================================================================
// === Actualite Interfaces ===
// ============================================================================

export interface ActualiteCreateData {
  nom: string;
  description?: string;
  imageIllustration?: string | null;
  typeId: number;
  userId: number;
  date?: string | Date;
}

export interface ActualiteUpdateData {
  nom?: string;
  description?: string;
  imageIllustration?: string | null;
  typeId?: number;
  date?: string | Date;
}

// ============================================================================
// === Video Interfaces ===
// ============================================================================

export interface VideoCreateData {
  fileVideo: string;
  description?: string;
  userId: number;
  niveauId?: number;
  matiereId?: number;
}

export interface VideoUpdateData {
  fileVideo?: string;
  description?: string;
  userId?: number;
  niveauId?: number;
  matiereId?: number;
}

// ============================================================================
// === Accueil Interfaces ===
// ============================================================================

export interface AccueilCreateData {
  nom: string;
  titre?: string;
  description?: string;
  logoEcole?: string;
  images?: string[];
  userId: number;
}

export interface AccueilUpdateData {
  nom?: string;
  titre?: string;
  description?: string;
  logoEcole?: string;
  images?: string[];
  userId?: number;
}

// ============================================================================
// === User Interfaces ===
// ============================================================================

export interface UserCreateData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  adresse?: string;
  phone?: string;
  roleId?: number;
}

export interface UserUpdateData {
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  adresse?: string;
  phone?: string;
  roleId?: number;
  isArchived?: boolean;
}

// ============================================================================
// === Contact Interfaces ===
// ============================================================================

export interface ContactCreateData {
  nom: string;
  prenom?: string;
  email: string;
  typeSujet?: string;
  message?: string;
  userId?: number;
}

export interface ContactUpdateData {
  nom?: string;
  prenom?: string;
  email?: string;
  typeSujet?: string;
  message?: string;
  userId?: number;
}

// ============================================================================
// === Auth Interfaces ===
// ============================================================================

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

// ============================================================================
// === Cours Interfaces ===
// ============================================================================

export interface CoursCreateData {
  nom: string;
  description?: string;
  file?: string | null;
  userId: number;
  niveauId?: number;
  matiereId?: number;
}

export interface CoursUpdateData {
  nom?: string;
  description?: string;
  file?: string | null | undefined;
  userId?: number;
  niveauId?: number | null;
  matiereId?: number | null;
}

// ============================================================================
// === Presentation Interfaces ===
// ============================================================================

export interface PresentationCreateData {
  description?: string;
  histoire?: string;
  mission?: string;
  userId: number;
}

export interface PresentationUpdateData {
  description?: string;
  histoire?: string;
  mission?: string;
  userId?: number;
}

// ============================================================================
// === Role Interfaces ===
// ============================================================================

export interface RoleCreateData {
  name: string;
  description?: string;
}

export interface RoleUpdateData {
  name?: string;
  description?: string;
}

// ============================================================================
// === Permission Interfaces ===
// ============================================================================

export interface PermissionCreateData {
  key: string;
  description?: string;
}

export interface PermissionUpdateData {
  key?: string;
  description?: string;
}

// ============================================================================
// === Specialite Interfaces ===
// ============================================================================

export interface SpecialiteCreateData {
  nom: string;
  filiereId: number;
}

export interface SpecialiteUpdateData {
  nom?: string;
  filiereId?: number;
}

// ============================================================================
// === Filiere Interfaces ===
// ============================================================================

export interface FiliereCreateData {
  nom: string;
}

export interface FiliereUpdateData {
  nom?: string;
}

// ============================================================================
// === Type Interfaces ===
// ============================================================================

export interface TypeCreateData {
  nom: string;
}

export interface TypeUpdateData {
  nom?: string;
}

// ============================================================================
// === Evenement Interfaces ===
// ============================================================================

export interface EvenementCreateData {
  nom: string;
  dateDebut?: Date;
  dateFin?: Date;
  lieu?: string;
  image?: string;
  userId?: number;
}

export interface EvenementUpdateData {
  nom?: string;
  dateDebut?: Date;
  dateFin?: Date;
  lieu?: string;
  image?: string;
  userId?: number;
}

// ============================================================================
// === TypeEnseignement Interfaces ===
// ============================================================================

export interface TypeEnseignementCreateData {
  nom: TypeEnseignementEnum;
}

export interface TypeEnseignementUpdateData {
  nom?: TypeEnseignementEnum;
}

// ============================================================================
// === CoeficientSerie Interfaces ===
// ============================================================================

export interface CoeficientSerieCreateData {
  valeur: number;
  matiereId: number;
  serieId: number;
  niveauId?: number;
}

export interface CoeficientSerieUpdateData {
  valeur?: number;
  matiereId?: number;
  serieId?: number;
  niveauId?: number;
}

// ============================================================================
// === Serie Interfaces ===
// ============================================================================

export interface SerieCreateData {
  nom: string;
  niveauId: number;
}

export interface SerieUpdateData {
  nom?: string;
  niveauId?: number;
}

export interface SerieOption {
  value: string;
  label: string;
  description?: string;
  category: 'GENERAL' | 'TECHNIQUE';
  type?: string;
}

export const SERIES_BF: SerieOption[] = [
  // ENSEIGNEMENT GÉNÉRAL
  {
    value: 'Série A1',
    label: 'Série A1 - Lettres classiques',
    description: 'Latin / Grec',
    category: 'GENERAL',
    type: 'Littéraire'
  },
  {
    value: 'Série A2',
    label: 'Série A2 - Lettres modernes',
    description: 'Lettres modernes',
    category: 'GENERAL',
    type: 'Littéraire'
  },
  {
    value: 'Série A3',
    label: 'Série A3 - Langues vivantes',
    description: 'Langues vivantes',
    category: 'GENERAL',
    type: 'Littéraire'
  },
  {
    value: 'Série A4',
    label: 'Série A4 - Littérature & sciences humaines',
    description: 'Littérature & sciences humaines',
    category: 'GENERAL',
    type: 'Littéraire'
  },
  {
    value: 'Série C',
    label: 'Série C - Scientifique',
    description: 'Mathématiques – Physique',
    category: 'GENERAL',
    type: 'Scientifique'
  },
  {
    value: 'Série D',
    label: 'Série D - Scientifique',
    description: 'SVT – Biologie',
    category: 'GENERAL',
    type: 'Scientifique'
  },

  // ENSEIGNEMENT TECHNIQUE - Séries industrielles
  {
    value: 'Série F3',
    label: 'Série F3 - Génie électrique',
    description: 'Génie électrique',
    category: 'TECHNIQUE',
    type: 'Industriel'
  },
  {
    value: 'Série F4',
    label: 'Série F4 - Génie mécanique',
    description: 'Génie mécanique',
    category: 'TECHNIQUE',
    type: 'Industriel'
  },
  {
    value: 'Série F5',
    label: 'Série F5 - Génie civil',
    description: 'BTP',
    category: 'TECHNIQUE',
    type: 'Industriel'
  },

  // ENSEIGNEMENT TECHNIQUE - Séries technologiques
  {
    value: 'Série E',
    label: 'Série E - Informatique / Électronique / Télécommunications',
    description: 'Informatique / Électronique / Télécommunications',
    category: 'TECHNIQUE',
    type: 'Technologique'
  },

  // ENSEIGNEMENT TECHNIQUE - Séries tertiaires
  {
    value: 'Série G2',
    label: 'Série G2 - Comptabilité et gestion',
    description: 'Comptabilité et gestion',
    category: 'TECHNIQUE',
    type: 'Tertiaire'
  },
  {
    value: 'Série G3',
    label: 'Série G3 - Secrétariat / Bureautique',
    description: 'Secrétariat / Bureautique',
    category: 'TECHNIQUE',
    type: 'Tertiaire'
  },

  // ENSEIGNEMENT TECHNIQUE - Séries agricoles
  {
    value: 'Série A_AGRICOLE',
    label: 'Série A Agricole - Agriculture et élevage',
    description: 'Agriculture et élevage',
    category: 'TECHNIQUE',
    type: 'Agricole'
  },
  {
    value: 'Série AGRO_PASTORAL',
    label: 'Série Agro-pastoral',
    description: 'Production et transformation agricoles',
    category: 'TECHNIQUE',
    type: 'Agricole'
  },
];

// Séries par catégorie
export const SERIES_GENERAL = SERIES_BF.filter(s => s.category === 'GENERAL');
export const SERIES_TECHNIQUE = SERIES_BF.filter(s => s.category === 'TECHNIQUE');

// Séries par type
export const SERIES_LITTERAIRE = SERIES_BF.filter(s => s.type === 'Littéraire');
export const SERIES_SCIENTIFIQUE = SERIES_BF.filter(s => s.type === 'Scientifique');
export const SERIES_INDUSTRIEL = SERIES_BF.filter(s => s.type === 'Industriel');
export const SERIES_TECHNOLOGIQUE = SERIES_BF.filter(s => s.type === 'Technologique');
export const SERIES_TERTIAIRE = SERIES_BF.filter(s => s.type === 'Tertiaire');
export const SERIES_AGRICOLE = SERIES_BF.filter(s => s.type === 'Agricole');

// Pour les selects (value/label uniquement)
export const SERIES_SELECT_OPTIONS = SERIES_BF.map(s => ({
  value: s.value,
  label: s.label
}));

// Obtenir le label d'une série par sa valeur
export const getSerieLabel = (value: string): string => {
  const serie = SERIES_BF.find(s => s.value === value);
  return serie ? serie.label : value;
};

// Obtenir une série par sa valeur
export const getSerieByValue = (value: string): SerieOption | undefined => {
  return SERIES_BF.find(s => s.value === value);
};

// ============================================================================
// === CoeficientNiveau Interfaces ===
// ============================================================================

export interface CoeficientNiveauCreateData {
  valeur: number;
  niveauId: number;
  matiereId: number;
}

export interface CoeficientNiveauUpdateData {
  valeur?: number;
  niveauId?: number;
  matiereId?: number;
}

// ============================================================================
// === Parent Interfaces ===
// ============================================================================

export interface ParentCreateData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  adresse?: string;
  phone?: string;
  eleveIds?: number[];
}

export interface ParentUpdateData {
  nom?: string;
  prenom?: string;
  email?: string;
  adresse?: string;
  phone?: string;
  eleveIds?: number[];
}

// ============================================================================
// === Eleve Interfaces ===
// ============================================================================

export interface UserForEleveCreateData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  adresse?: string;
  phone?: string;
}

export interface EleveCreateData {
  userId: number;
  niveauId?: number;
  classeId?: number;
  anneeId?: number;
  filiereId?: number;
  dateNaissance?: Date | string;
  acteNaissance?: string;
  bulletin?: string | string[];
  attestation?: string;
}

export interface EleveUpdateData {
  // Champs de l'utilisateur
  nom?: string;
  prenom?: string;
  email?: string;
  adresse?: string;
  phone?: string;

  // Champs de l'élève
  niveauId?: number;
  classeId?: number;
  anneeId?: number;
  filiereId?: number;
  dateNaissance?: Date | string;
  acteNaissance?: string;
  bulletin?: string | string[];
  attestation?: string;
}


// ============================================================================
// === Staff Interfaces ===
// ============================================================================

export interface StaffCreateData {
  userId: number;
}

export interface UserForStaffCreateData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  adresse?: string;
  phone?: string;
  roleId?: number;
}

export interface StaffUpdateData {
  // User fields
  nom?: string;
  prenom?: string;
  email?: string;
  adresse?: string;
  phone?: string;
  roleId?: number;
}

// ============================================================================
// === Absence Interfaces ===
// ============================================================================

export interface AbsenceCreateData {
  motif: string;             // obligatoire
  dateDebut: Date;           // obligatoire
  dateFin: Date;             // obligatoire
  justification: boolean;    // obligatoire
  eleveId?: number;          // optionnel, si absence d'un �l�ve
  staffId?: number;          // optionnel, si absence d'un staff
  matiereId: number;         // obligatoire
  classeId: number;          // obligatoire
  userId?: number;           // optionnel, l'utilisateur qui enregistre l'absence
}

export interface AbsenceUpdateData {
  motif?: string;
  dateDebut: Date;           // obligatoire
  dateFin: Date;             // obligatoire
  eleveId?: number;
  matiereId?: number;
  staffId?: number;
  userId?: number;
}

// ============================================================================
// === Retard Interfaces ===
// ============================================================================

export interface RetardCreateData {
  date: Date;
  justification: boolean;
  autorisation?: string;
  confProf: boolean;
  eleveId: number;
  matiereId: number;
  classeId: number;
  userId?: number;
}

export interface RetardUpdateData {
  date?: Date;
  justification?: boolean;
  autorisation?: string;
  confProf?: boolean;
  eleveId?: number;
  matiereId?: number;
  classeId?: number;
  userId?: number;
}

// ============================================================================
// === LeavePermission Interfaces ===
// ============================================================================

export interface LeavePermissionCreateData {
  motif?: string;
  dateDebut?: Date;
  dateFin?: Date;
  userId?: number;
  statut?: string;
}

export interface LeavePermissionUpdateData {
  motif?: string;
  dateDebut?: Date;
  dateFin?: Date;
  userId?: number;
  statut?: string;
}

// ============================================================================
// === Note Interfaces ===
// ============================================================================

export interface NoteCreateData {
  valeur: number;
  eleveId: number;
  evaluationId: number;
}

export interface NoteUpdateData {
  valeur?: number;
  eleveId?: number;
  evaluationId?: number;
}

// ============================================================================
// === Evaluation Interfaces ===
// ============================================================================

export interface EvaluationCreateData {
  date: Date;
  type?: string;
  matiereId: number;
  classeId: number;
  anneeId: number;
  trimestreId?: number;
  staffId: number; // ID du staff connect�
}

export interface EvaluationUpdateData {
  date?: Date;
  type?: string;
  matiereId?: number;
  classeId?: number;
  anneeId?: number;
  trimestreId?: number;
  staffId?: number;
}

// ============================================================================
// === ReferenceSac Interfaces ===
// ============================================================================

export interface ReferenceSacCreateData {
  staffId: number;
  matiereId: number;
  classeId: number;
  anneeId?: number;
}

// ============================================================================
// === Matiere Interfaces ===
// ============================================================================

export interface MatiereCreateData {
  libelle: string;
  typeMatiereId?: number;
}

export interface MatiereUpdateData {
  libelle?: string;
  typeMatiereId?: number;
}

// ============================================================================
// === Galery Interfaces ===
// ============================================================================

export interface GaleryCreateData {
  image: string;
  typeId: number;
  description?: string;
  userId: number;
}

export interface GaleryUpdateData {
  image?: string;
  typeId?: number;
  description?: string;
  userId?: number;
}

// ============================================================================
// === Classe Interfaces ===
// ============================================================================

export interface ClasseCreateData {
  nom: string;
  capacite?: number;
  niveauId: number;
}

export interface ClasseUpdateData {
  nom?: string;
  capacite?: number;
  niveauId?: number;
}

// ============================================================================
// === SiteEleve Interfaces ===
// ============================================================================

export interface SiteEleveCreateData {
  nom: string;
  prenom?: string;
  userId: number;
}

export interface SiteEleveUpdateData {
  nom?: string;
  prenom?: string;
  userId?: number;
}

// ============================================================================
// === Annee Interfaces ===
// ============================================================================

export interface AnneeCreateData {
  libelle?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface AnneeUpdateData {
  libelle?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

// ============================================================================
// === Inscription Eleve Interfaces ===
// ============================================================================

export interface InscriptionEleveData {
  // ID de l'utilisateur connecté (requis pour auto-détection)
  userId: number;

  // ID de l'élève (optionnel si utilisateur = élève, requis si staff/admin)
  eleveId?: number;

  // Données Inscription
  niveauId?: number;
  classeId?: number;
  // Année scolaire (optionnel, auto-détecté si non fourni)
  anneeId?: number;

  // Données Paiement
  montant: number;
  typePaiement?: 'COMPLET' | 'TRANCHES';
  modePaiement: 'espece' | 'electronique' | 'cinetpay';
  paymentProvider?: 'cinetpay';

  // Données pour paiement électronique Moneroo (optionnel)
  paymentMethod?: string; // ex: "mtn_benin", "moov_benin"
  phoneNumber?: string; // Numéro du client pour le paiement mobile
  country?: string; // Code pays (ex: "BJ")

  // Données pour paiement CinetPay
  transactionId?: string;
  currency?: string;
  description?: string;
  notifyUrl?: string;
  returnUrl?: string;
  channels?: string;
  lang?: string;
  metadata?: string;
  invoice_data?: Record<string, string>;
  lock_phone_number?: boolean;
  customer_id?: string;
  customer_name?: string;
  customer_surname?: string;
  customer_phone_number?: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  customer_country?: string;
  customer_state?: string;
  customer_zip_code?: string;
}

export interface InscriptionResult {
  success: boolean;
  message: string;
  data?: {
    user: any;
    eleve: any;
    inscription: any;
    paiement: any;
    mobileMoney?: {
      paymentId: string;
      status: string;
      reference: string;
      message: string;
    };
    cinetpay?: {
      paymentToken: string;
      paymentUrl: string;
      transactionId: string;
      status: string;
      apiResponseId?: string;
    };
  };
  error?: string;
}

// ============================================================================
// === Niveau Interfaces ===
// ============================================================================

export interface NiveauCreateData {
  nomNiveau: string;
  cycle?: string;
  scolarite?: number;
  typeEnseignementId?: number;
}

export interface NiveauUpdateData {
  nomNiveau?: string;
  cycle?: string;
  scolarite?: number;
  typeEnseignementId?: number;
}

// ============================================================================
// === Bulletin Interfaces ===
// ============================================================================

export interface NotesByMatiere {
  matiereId: number;
  matiereLibelle: string;
  typeMatiere: string;
  devoir?: number;
  interro?: number;
  compo?: number;
  moyenne: number;
  appreciation: string;
  coef: number;
  notePonderee: number;
  nomProf: string;
}

export interface MoyenneParType {
  typeMatiere: string;
  moyenne: number;
  meilleureMoyenne: number;
  totalCoef: number;
  rang: number;
  totalEleves: number;
}

export interface AbsenceData {
  justifiees: number;
  nonJustifiees: number;
  total: number;
  retraitPoints: number;
}

export interface BulletinData {
  eleve: {
    nom: string;
    prenom: string;
    niveau: string;
    dateNaissance: Date;
    matricule: string | null;
  };
  classe: {
    id: number;
    nom: string;
    niveau: string;
  };
  estRedoublant: boolean;
  classeRedoublee: string | null;
  decision: string | null;
  trimestre: {
    id: number;
    nom: string;
  };
  annee: {
    id: number;
    libelle: string;
    dateDebut: Date | null;
    dateFin: Date | null;
  };
  notesByMatiere: NotesByMatiere[];
  moyennesParType: MoyenneParType[];
  moyenneGenerale: number;
  appreciationGenerale: string;
  rang: number;
  totalEleves: number;
  meilleureMoyenneClasse?: number;
  moyennePlusBasse?: number;
  moyenneAnnuelle?: number;
  absences: AbsenceData;
  moyenneDefinitive: number;
  rappelMoyennes: {
    trimestre1?: number;
    trimestre2?: number;
  };
}

// ============================================================================
// === Categorie Comptable Interfaces ===
// ============================================================================

export interface CategorieComptableCreateData {
  libelle: string;
  type: 'RECETTE' | 'DEPENSE';
}

export interface CategorieComptableUpdateData {
  libelle?: string;
  type?: 'RECETTE' | 'DEPENSE';
}

// ============================================================================
// === Compte Bancaire Interfaces ===
// ============================================================================

export interface CompteBancaireCreateData {
  libelle: string;
  type: 'CAISSE' | 'BANQUE';
  soldeInitial?: number;
}

export interface CompteBancaireUpdateData {
  libelle?: string;
  type?: 'CAISSE' | 'BANQUE';
  soldeInitial?: number;
}

// ============================================================================
// === Transaction Interfaces ===
// ============================================================================

export interface LigneTransactionData {
  libelle: string;
  montant: number;
  quantite?: number;
}

export interface TransactionCreateData {
  libelle: string;
  montant: number;
  type: 'RECETTE' | 'DEPENSE';
  date: Date | string;
  dateEcheance?: Date | string;
  pieceJustificative?: string;
  note?: string;
  categorieId?: number;
  compteId?: number;
  anneeId?: number;
  userId: number;
  paiementId?: number;
  lignes?: LigneTransactionData[];
}

export interface TransactionUpdateData {
  libelle?: string;
  montant?: number;
  date?: Date | string;
  dateEcheance?: Date | string;
  pieceJustificative?: string;
  note?: string;
  categorieId?: number;
  compteId?: number;
  anneeId?: number;
}

export interface TransactionFilters {
  type?: 'RECETTE' | 'DEPENSE';
  statut?: 'EN_ATTENTE' | 'VALIDE' | 'ANNULE';
  categorieId?: number;
  compteId?: number;
  anneeId?: number;
  dateDebut?: Date | string;
  dateFin?: Date | string;
}

export interface StatistiquesTransactions {
  recettes: {
    total: number;
    nombre: number;
  };
  depenses: {
    total: number;
    nombre: number;
  };
  solde: number;
}

// ============================================================================
// === Budget Interfaces ===
// ============================================================================

export interface BudgetCreateData {
  libelle: string;
  montantPrevu: number;
  type: 'RECETTE' | 'DEPENSE';
  anneeId?: number;
  categorieId?: number;
}

export interface BudgetUpdateData {
  libelle?: string;
  montantPrevu?: number;
  type?: 'RECETTE' | 'DEPENSE';
  anneeId?: number;
  categorieId?: number;
}

export interface BudgetFilters {
  type?: 'RECETTE' | 'DEPENSE';
  anneeId?: number;
  categorieId?: number;
}

export interface BudgetAvecRealisation {
  id: number;
  libelle: string;
  montantPrevu: number;
  montantRealise: number;
  tauxRealisation: number;
  ecart: number;
  type: 'RECETTE' | 'DEPENSE';
  anneeId?: number;
  categorieId?: number;
}

export interface TableauDeBordBudgetaire {
  recettes: {
    prevues: number;
    realisees: number;
    ecart: number;
    tauxRealisation: number;
  };
  depenses: {
    prevues: number;
    realisees: number;
    ecart: number;
    tauxRealisation: number;
  };
  solde: {
    prevu: number;
    realise: number;
  };
}
