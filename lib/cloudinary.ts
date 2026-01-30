// Cloudinary Upload
// Çözünürlük ve kalite korunarak fotoğraf yükleme

const CLOUD_NAME = 'dgiak1uhc';
const UPLOAD_PRESET = 'photo-portfolio';

interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Küçük dosyalar için unsigned upload (< 10MB)
 */
const uploadSmallFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'photo-portfolio');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: Math.round((event.loaded / event.total) * 100)
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          console.log('Upload successful:', response.secure_url);
          resolve(response.secure_url);
        } else {
          console.error('Upload failed:', xhr.status, xhr.responseText);
          resolve(null);
        }
      });

      xhr.addEventListener('error', () => {
        console.error('Upload error');
        resolve(null);
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

/**
 * Büyük dosyalar için signed upload (> 10MB)
 * Doğrudan Cloudinary'ye yükler - Vercel limiti atlanır
 * Kalite ve çözünürlük korunur
 */
const uploadLargeFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  try {
    // 1. Sunucudan imza al
    const signatureRes = await fetch('/api/upload/signature');
    if (!signatureRes.ok) {
      console.error('Failed to get signature');
      return null;
    }

    const { signature, timestamp, api_key, cloud_name, folder } = await signatureRes.json();

    // 2. FormData oluştur
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', api_key);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: Math.round((event.loaded / event.total) * 100)
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          console.log('Large file upload successful:', response.secure_url);
          resolve(response.secure_url);
        } else {
          console.error('Large file upload failed:', xhr.status, xhr.responseText);
          resolve(null);
        }
      });

      xhr.addEventListener('error', () => {
        console.error('Large file upload error');
        resolve(null);
      });

      // Doğrudan Cloudinary'ye yükle
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Large file upload error:', error);
    return null;
  }
};

/**
 * Akıllı upload - dosya boyutuna göre otomatik seçim
 * - < 10MB: Unsigned upload (hızlı)
 * - > 10MB: Signed upload via API (100MB'a kadar)
 * Kalite ve çözünürlük her zaman korunur
 */
export const smartUploadToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  const fileSizeMB = file.size / (1024 * 1024);
  console.log(`Uploading ${file.name} (${fileSizeMB.toFixed(2)} MB)`);

  if (fileSizeMB > 10) {
    console.log('Using signed upload for large file');
    return uploadLargeFile(file, onProgress);
  }

  return uploadSmallFile(file, onProgress);
};

export default smartUploadToCloudinary;
