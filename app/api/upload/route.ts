import { NextRequest, NextResponse } from 'next/server';

const CLOUD_NAME = 'dgiak1uhc';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    // API credentials kontrolü
    if (!API_KEY || !API_SECRET) {
      console.error('Cloudinary API credentials missing');
      return NextResponse.json(
        { error: 'Cloudinary yapılandırması eksik' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary'ye signed upload
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'photo-portfolio';

    // Signature oluştur
    const crypto = await import('crypto');
    const signatureString = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // FormData oluştur
    const uploadFormData = new FormData();
    uploadFormData.append('file', new Blob([buffer]), file.name);
    uploadFormData.append('api_key', API_KEY);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);
    uploadFormData.append('folder', folder);

    // Cloudinary'ye yükle
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      return NextResponse.json(
        { error: 'Yükleme başarısız oldu' },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      url: result.secure_url,
      width: result.width,
      height: result.height,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Büyük dosyalar için config
export const config = {
  api: {
    bodyParser: false,
  },
};
