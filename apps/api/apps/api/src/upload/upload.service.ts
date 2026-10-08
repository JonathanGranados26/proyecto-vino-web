import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gws-wine-platform',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      );

      // Convertir buffer a stream
      const bufferStream = require('stream').Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extraer el public_id de la URL de Cloudinary
    const match = imageUrl.match(/\/gws-wine-platform\/([^.]+)/);
    if (match) {
      await cloudinary.uploader.destroy(`gws-wine-platform/${match[1]}`);
    }
  }
}