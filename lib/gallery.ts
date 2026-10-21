import { Photo } from './types';

/**
 * Herkese açık galerilerde (ana sayfa, /gallery, /work) gösterilecek fotoğrafları seçer.
 *
 * Nisan 2026 geri yüklemesinde veritabanına yanlışlıkla
 *   • küçük resim boyutunda (200×133 px) bir kayıt ve
 *   • aynı karenin ikinci bir yüklemesi (aynı dosya adı, aynı boyutlar)
 * girdi. Bunlar galeride bozuk ve mükerrer kareler olarak görünüyor. Kayıtlar
 * veritabanından silinene kadar bu filtre onları yalnızca görünümden çıkarır;
 * yönetim paneli tüm kayıtları görmeye devam eder.
 */

/** Uzun kenarı bu değerin altında olan görseller baskı kalitesinde değildir; küçük resim kabul edilir. */
export const MIN_GALLERY_LONG_EDGE = 600;

export const isThumbnailSized = (photo: Pick<Photo, 'width' | 'height'>): boolean =>
  !!photo.width && !!photo.height && Math.max(photo.width, photo.height) < MIN_GALLERY_LONG_EDGE;

const duplicateKey = (photo: Pick<Photo, 'title' | 'width' | 'height'>): string | null => {
  const title = photo.title?.trim().toLowerCase();
  if (!title || !photo.width || !photo.height) return null;
  return `${title}|${photo.width}x${photo.height}`;
};

export function filterGalleryPhotos<T extends Photo>(photos: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const photo of photos) {
    if (isThumbnailSized(photo)) continue;
    const key = duplicateKey(photo);
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    result.push(photo);
  }
  return result;
}
