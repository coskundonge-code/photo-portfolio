import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getAdminNotificationEmail, getUserConfirmationEmail } from '@/lib/email-templates';

// Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase admin client (service role for inserting messages)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Konu etiketleri
const subjectLabels: Record<string, string> = {
  order: 'Sipariş Hakkında',
  custom: 'Özel Talep',
  collab: 'İşbirliği',
  other: 'Diğer',
};

// Rate limiting için basit in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 istek
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 saat

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    // Request body'yi parse et
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validasyon
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'İsim, e-posta ve mesaj alanları zorunludur.' },
        { status: 400 }
      );
    }

    // Email format validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    // İsim uzunluk kontrolü
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'İsim 2-100 karakter arasında olmalıdır.' },
        { status: 400 }
      );
    }

    // Mesaj uzunluk kontrolü
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Mesaj 10-5000 karakter arasında olmalıdır.' },
        { status: 400 }
      );
    }

    const subjectLabel = subjectLabels[subject] || subject || 'Genel';

    // Site ayarlarını al
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('site_name, contact_email')
      .single();

    const siteName = settings?.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'Photography Portfolio';
    const adminEmail = settings?.contact_email || process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.error('Admin email not configured');
      return NextResponse.json(
        { error: 'Sistem yapılandırma hatası. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      );
    }

    // Mesajı veritabanına kaydet
    const { error: dbError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject || 'general',
        subject_label: subjectLabel,
        message,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Veritabanı hatası olsa bile e-posta göndermeye devam et
    }

    // E-posta gönderimi için from adresi
    // Resend'de doğrulanmış domain kullanılmalı, yoksa onboarding@resend.dev kullanılır
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Admin'e bildirim e-postası gönder
    const adminEmailResult = await resend.emails.send({
      from: `${siteName} <${fromEmail}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[İletişim Formu] ${subjectLabel} - ${name}`,
      html: getAdminNotificationEmail(
        { name, email, subject, subjectLabel, message },
        siteName
      ),
    });

    if (adminEmailResult.error) {
      console.error('Admin email error:', adminEmailResult.error);
      return NextResponse.json(
        { error: 'E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    // Kullanıcıya onay e-postası gönder
    const userEmailResult = await resend.emails.send({
      from: `${siteName} <${fromEmail}>`,
      to: email,
      subject: `Mesajınız alındı - ${siteName}`,
      html: getUserConfirmationEmail(
        { name, email, subject, subjectLabel, message },
        siteName
      ),
    });

    if (userEmailResult.error) {
      // Kullanıcı e-postası başarısız olsa da işlemi başarılı say
      console.error('User confirmation email error:', userEmailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
