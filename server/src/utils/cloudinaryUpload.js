import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

export function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
      if (error) reject(error); else resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
}

export function optimizedUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}
