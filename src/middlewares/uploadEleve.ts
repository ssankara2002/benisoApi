import multer, { StorageEngine } from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer les dossiers pour les documents d'élèves
const uploadsBaseDir = path.join(__dirname, '../../uploads');
const acteNaissanceDir = path.join(uploadsBaseDir, 'actes-naissance');
const bulletinDir = path.join(uploadsBaseDir, 'bulletins');
const attestationDir = path.join(uploadsBaseDir, 'attestations');
const photosDir = path.join(uploadsBaseDir, 'photos');

// Créer les dossiers s'ils n'existent pas
[uploadsBaseDir, acteNaissanceDir, bulletinDir, attestationDir, photosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage pour les actes de naissance
const acteNaissanceStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, acteNaissanceDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `acte-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Configuration du stockage pour les bulletins
const bulletinStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bulletinDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `bulletin-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Configuration du stockage pour les attestations
const attestationStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, attestationDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `attestation-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Filtrage des fichiers (accepter uniquement PDF et images)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF, JPG, JPEG et PNG sont autorisés'));
  }
};

// Exports des middlewares d'upload
export const uploadActeNaissance = multer({
  storage: acteNaissanceStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

export const uploadBulletin = multer({
  storage: bulletinStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

export const uploadAttestation = multer({
  storage: attestationStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Configuration du stockage pour les photos d'élèves
const photoStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/photos'); // Chemin relatif au lieu du chemin absolu
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Filtrage pour les photos (accepter uniquement les images)
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers JPG, JPEG et PNG sont autorisés pour les photos'));
  }
};

export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max pour les photos
});

// Middleware pour uploader plusieurs fichiers d'élève à la fois
export const uploadEleveDocuments = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let destDir = uploadsBaseDir;

      if (file.fieldname === 'acteNaissance') {
        destDir = acteNaissanceDir;
      } else if (file.fieldname === 'bulletin') {
        destDir = bulletinDir;
      } else if (file.fieldname === 'attestation') {
        destDir = attestationDir;
      } else if (file.fieldname === 'photo') {
        destDir = photosDir;
      }

      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname;
      const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Pour la photo, n'accepter que les images
    if (file.fieldname === 'photo') {
      const allowedTypes = /jpg|jpeg|png/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error('Seuls les fichiers JPG, JPEG et PNG sont autorisés pour les photos'));
      }
    } else {
      // Pour les autres documents, accepter PDF et images
      const allowedTypes = /pdf|jpg|jpeg|png/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error('Seuls les fichiers PDF, JPG, JPEG et PNG sont autorisés'));
      }
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).fields([
  { name: 'acteNaissance', maxCount: 1 },
  { name: 'bulletin', maxCount: 1 },
  { name: 'attestation', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]);
