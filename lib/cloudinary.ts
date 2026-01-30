// Cloudinary Unsigned Upload
// Çözünürlük ve kalite korunarak fotoğraf yükleme

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Debug: Environment variables kontrolü
if (typeof window !== 'undefined') {
  console.log('Cloudinary Config:', {
    cloudName: CLOUD_NAME ? 'SET' : 'NOT SET',
    uploadPreset: UPLOAD_PRESET ? 'SET' : 'NOT SET'
  });
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  original_filename: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Cloudinary'ye fotoğraf yükler
 * - Çözünürlük korunur (transformasyon yok)
 * - Orijinal kalite korunur
 * - Progress callback ile yükleme durumu takip edilebilir
 */
export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  // Environment variables kontrolü
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error('Cloudinary yapılandırması eksik!', {
      CLOUD_NAME: CLOUD_NAME || 'EKSİK',
      UPLOAD_PRESET: UPLOAD_PRESET || 'EKSİK'
    });
    alert('Cloudinary yapılandırması eksik. Lütfen Vercel environment variables kontrol edin.');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'photo-portfolio');

    // Kalite ayarları - orijinal kaliteyi koru
    // q_auto kullanmıyoruz çünkü kalite düşürüyor
    // Transformasyon yok = orijinal dosya korunur

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
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          console.log('Upload successful:', response.secure_url);
          resolve(response.secure_url);
        } else {
          console.error('Cloudinary upload failed:', {
            status: xhr.status,
            response: xhr.responseText,
            cloudName: CLOUD_NAME,
            preset: UPLOAD_PRESET
          });
          // Kullanıcıya daha detaylı hata göster
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            alert(`Yükleme hatası: ${errorResponse.error?.message || 'Bilinmeyen hata'}`);
          } catch {
            alert(`Yükleme hatası (${xhr.status}): Cloudinary ayarlarını kontrol edin.`);
          }
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        console.error('Cloudinary upload error');
        reject(new Error('Upload error'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

/**
 * Büyük dosyalar için chunk upload (10MB üzeri)
 * Cloudinary unsigned upload'da 10MB sınırı var
 * Bu fonksiyon büyük dosyaları parçalayarak yükler
 */
export const uploadLargeToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  const MAX_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB chunks

  // 10MB'dan küçük dosyalar için normal upload
  if (file.size <= 10 * 1024 * 1024) {
    return uploadToCloudinary(file, onProgress);
  }

  try {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const totalChunks = Math.ceil(file.size / MAX_CHUNK_SIZE);
    let uploadedUrl: string | null = null;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * MAX_CHUNK_SIZE;
      const end = Math.min(start + MAX_CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'photo-portfolio');
      formData.append('public_id', uniqueId);

      // Chunk bilgileri
      const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          headers: {
            'X-Unique-Upload-Id': uniqueId,
            'Content-Range': contentRange,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chunk upload failed:', errorText);
        throw new Error('Chunk upload failed');
      }

      // Progress güncelle
      if (onProgress) {
        onProgress({
          loaded: end,
          total: file.size,
          percent: Math.round((end / file.size) * 100)
        });
      }

      // Son chunk'ta URL'yi al
      if (chunkIndex === totalChunks - 1) {
        const result: CloudinaryUploadResponse = await response.json();
        uploadedUrl = result.secure_url;
      }
    }

    return uploadedUrl;
  } catch (error) {
    console.error('Large file upload error:', error);
    return null;
  }
};

/**
 * Akıllı upload - dosya boyutuna göre otomatik seçim
 * Kalite ve çözünürlük her zaman korunur
 */
export const smartUploadToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  // Dosya boyutunu kontrol et
  const fileSizeMB = file.size / (1024 * 1024);

  console.log(`Uploading ${file.name} (${fileSizeMB.toFixed(2)} MB)`);

  if (fileSizeMB > 10) {
    console.log('Using chunked upload for large file');
    return uploadLargeToCloudinary(file, onProgress);
  }

  return uploadToCloudinary(file, onProgress);
};

export default smartUploadToCloudinary;
