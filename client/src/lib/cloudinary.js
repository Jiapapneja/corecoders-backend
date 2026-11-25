import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { api } from './api.js';

export async function uploadImage(file) {
  const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1800, useWebWorker: true, fileType: 'image/webp' });
  const { data: signature } = await api.get('/uploads/signature');
  const form = new FormData();
  form.append('file', compressed);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', signature.timestamp);
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);
  const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, form);
  return data.secure_url;
}
