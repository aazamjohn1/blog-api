import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import createHttpError from 'http-errors';
import FileModel from '../schemas/fileSchema';
const fileRouter = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder name in Cloudinary account
    format: async (req: any, file: { mimetype: string; }) => {
      const fileTypes = /jpeg|jpg|png|gif/;
      const extname = fileTypes.test(file.mimetype) ? file.mimetype.split('/')[1] : 'jpg';
      return extname;
    },
    public_id: (req: any, file: any) => Date.now().toString(),
    resource_type: 'auto' // Ensures proper handling for image and gif uploads
  } as any, // Casting to `any` to bypass type errors
});

const upload = multer({ storage });

fileRouter.post(
  '/upload-image',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(createHttpError(400, 'No file uploaded'));
      }

      // Save file metadata to the database
      const savedFile = await FileModel.create({
        name: req.file.originalname,
        path: req.file.path, // Cloudinary URL
        uploadDate: new Date(),
        publicId: req.file.filename, // Save Cloudinary public_id for future management
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: savedFile,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default fileRouter;
