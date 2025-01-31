// src/config/multerConfig.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Directorio base donde se guardarán los avatares
const BASE_DIRECTORY = 'assets/usersProfile';

// Configurar storage de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurarnos de que la carpeta exista. (Node 14+)
    if (!fs.existsSync(BASE_DIRECTORY)) {
      fs.mkdirSync(BASE_DIRECTORY, { recursive: true });
    }
    cb(null, BASE_DIRECTORY);
  },
  filename: (req, file, cb) => {
    // Queremos un solo avatar por usuario, asumiendo que 
    // la info del usuario está en req.user
    const userId = req.user.id_usuario;
    // Extraer la extensión del archivo original
    const ext = path.extname(file.originalname).toLowerCase(); 
    // Generar un nombre consistente, por ejemplo: user_12345.jpg
    const filename = `user_${userId}${ext}`;
    cb(null, filename);
  },
});

// Filtro de archivos (opcional): limitar a imágenes
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no permitido (sólo .jpg, .png, .jpeg,  .webp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB, por ejemplo
});

export default upload;
