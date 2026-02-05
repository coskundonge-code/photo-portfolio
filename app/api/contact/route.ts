import { NextRequest, NextResponse } from 'next/server'
import { sendContactNotification, sendContactAutoReply } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurunuz.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      )
    }

    // Send notification to site owner
    const notificationResult = await sendContactNotification({
      name,
      email,
      subject,
      message,
    })

    if (notificationResult.error) {
      console.error('Contact notification error:', notificationResult.error)
      return NextResponse.json(
        { error: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      )
    }

    // Send auto-reply to sender
    await sendContactAutoReply({
      name,
      email,
      subject,
      message,
    })

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi.',
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    )
  }
}
