// Cloudinary Upload
// Çözünürlük ve kalite korunarak fotoğraf yükleme

const CLOUD_NAME = 'dgiak1uhc';
const UPLOAD_PRESET = 'photo-portfolio';
const MAX_FILE_SIZE = 9.5 * 1024 * 1024; // 9.5MB (Cloudinary free limit is 10MB)

interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Resmi sıkıştır - çözünürlük korunur, sadece JPEG kalitesi ayarlanır
 * @param file - Orijinal dosya
 * @param quality - JPEG kalitesi (0-1), varsayılan 0.92 (çok yüksek kalite)
 * @returns Sıkıştırılmış dosya
 */
const compressImage = (file: File, quality: number = 0.92): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Orijinal çözünürlüğü koru
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Resmi çiz
      ctx.drawImage(img, 0, 0);

      // JPEG olarak sıkıştır
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }

          // Yeni dosya oluştur
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          console.log(`Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (quality: ${quality})`);
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Image load failed'));

    // Dosyayı data URL olarak oku
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

/**
 * Akıllı sıkıştırma - dosya 10MB'ın altına inene kadar kaliteyi düşür
 * Minimum kalite: 0.70 (hala çok iyi görsel kalite)
 */
const smartCompress = async (file: File): Promise<File> => {
  const fileSizeMB = file.size / (1024 * 1024);

  // Zaten yeterince küçükse sıkıştırma
  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }

  console.log(`File too large (${fileSizeMB.toFixed(2)}MB), compressing...`);

  // Kademeli sıkıştırma - yüksek kaliteden başla
  const qualities = [0.92, 0.85, 0.80, 0.75, 0.70];

  for (const quality of qualities) {
    const compressed = await compressImage(file, quality);

    if (compressed.size <= MAX_FILE_SIZE) {
      console.log(`Compression successful at quality ${quality}`);
      return compressed;
    }
  }

  // En düşük kalite bile yetmediyse, son deneme
  const lastAttempt = await compressImage(file, 0.65);
  if (lastAttempt.size <= MAX_FILE_SIZE) {
    return lastAttempt;
  }

  // Hala çok büyükse uyar ama yine de dön
  console.warn('Could not compress below 10MB, upload may fail');
  return lastAttempt;
};

/**
 * Cloudinary'ye yükle (unsigned upload)
 */
const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'photo-portfolio');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve) => {
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
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const errorMsg = errorResponse.error?.message || 'Bilinmeyen hata';
            alert(`Yükleme hatası: ${errorMsg}`);
          } catch {
            alert(`Yükleme hatası: HTTP ${xhr.status}`);
          }
          resolve(null);
        }
      });

      xhr.addEventListener('error', () => {
        console.error('Upload network error');
        alert('Ağ hatası - bağlantınızı kontrol edin');
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
 * Akıllı upload - büyük dosyaları otomatik sıkıştır
 * - Çözünürlük HER ZAMAN korunur
 * - Sadece JPEG kalitesi ayarlanır (görsel fark minimal)
 * - 100MB'a kadar dosya desteklenir
 */
export const smartUploadToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string | null> => {
  const originalSizeMB = file.size / (1024 * 1024);
  console.log(`Uploading ${file.name} (${originalSizeMB.toFixed(2)} MB)`);

  // Büyük dosyaları sıkıştır
  let fileToUpload = file;
  if (file.size > MAX_FILE_SIZE) {
    try {
      // Sıkıştırma aşamasını göster
      onProgress?.({ loaded: 0, total: 100, percent: 0 });
      fileToUpload = await smartCompress(file);
      const newSizeMB = fileToUpload.size / (1024 * 1024);
      console.log(`Ready to upload: ${newSizeMB.toFixed(2)} MB`);
    } catch (error) {
      console.error('Compression error:', error);
      alert('Resim sıkıştırma hatası');
      return null;
    }
  }

  return uploadToCloudinary(fileToUpload, onProgress);
};

export default smartUploadToCloudinary;
