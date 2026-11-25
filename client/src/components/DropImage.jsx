import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
export default function DropImage({ onFile, label = 'Drop an image here or click to browse' }) {
  const onDrop = useCallback(files => { if (files[0]) onFile(files[0]); }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/jpeg': ['.jpg','.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }, maxSize: 5 * 1024 * 1024, multiple: false });
  return <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${isDragActive ? 'border-terracotta bg-terracotta/5' : 'border-black/10 hover:border-terracotta/50'}`}><input {...getInputProps()}/><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-black/45">JPG, PNG or WEBP · max 5MB before browser compression</p></div>;
}
