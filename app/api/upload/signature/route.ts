import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUD_NAME = 'dgiak1uhc';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function GET() {
  try {
    if (!API_KEY || !API_SECRET) {
      console.error('Cloudinary API credentials missing');
      return NextResponse.json(
        { error: 'Cloudinary yapılandırması eksik' },
        { status: 500 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'photo-portfolio';

    // Signature oluştur - parametreler alfabetik sırada olmalı
    const signatureString = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    return NextResponse.json({
      signature,
      timestamp,
      api_key: API_KEY,
      cloud_name: CLOUD_NAME,
      folder
    });

  } catch (error) {
    console.error('Signature error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
