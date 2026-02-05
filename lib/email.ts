import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com'
const contactEmail = process.env.CONTACT_EMAIL || 'hello@example.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Photography'

interface ContactEmailData {
  name: string
  email: string
  subject: string
  message: string
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    title: string
    size: string
    frame: string
    price: number
  }>
  totalAmount: number
  shippingAddress: string
}

// İletişim formu - Site sahibine bildirim
export async function sendContactNotification(data: ContactEmailData) {
  const { name, email, subject, message } = data

  const subjectMap: Record<string, string> = {
    order: 'Sipariş Hakkında',
    custom: 'Özel Talep',
    collaboration: 'İşbirliği',
    other: 'Diğer',
  }

  const subjectText = subjectMap[subject] || subject

  return resend.emails.send({
    from: `${siteName} <${fromEmail}>`,
    to: contactEmail,
    replyTo: email,
    subject: `[${siteName}] Yeni İletişim: ${subjectText}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
            .value { margin-bottom: 16px; }
            .message-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #000; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Yeni İletişim Mesajı</h2>
            </div>

            <div class="label">Gönderen</div>
            <div class="value">${name}</div>

            <div class="label">E-posta</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>

            <div class="label">Konu</div>
            <div class="value">${subjectText}</div>

            <div class="label">Mesaj</div>
            <div class="message-box">${message.replace(/\n/g, '<br>')}</div>

            <div class="footer">
              Bu mesaj ${siteName} web sitesi iletişim formundan gönderildi.
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

// İletişim formu - Gönderene otomatik yanıt
export async function sendContactAutoReply(data: ContactEmailData) {
  const { name, email } = data

  return resend.emails.send({
    from: `${siteName} <${fromEmail}>`,
    to: email,
    subject: `Mesajınız Alındı - ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">${siteName}</h2>
            </div>

            <p>Merhaba ${name},</p>

            <p>Mesajınız başarıyla alındı. En kısa sürede size geri dönüş yapacağım.</p>

            <p>Teşekkürler,<br>${siteName}</p>

            <div class="footer">
              Bu otomatik bir yanıttır. Lütfen bu e-postayı yanıtlamayın.
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

// Sipariş onayı - Müşteriye
export async function sendOrderConfirmation(data: OrderEmailData) {
  const { orderNumber, customerName, customerEmail, items, totalAmount, shippingAddress } = data

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.size}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.frame}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₺${item.price.toLocaleString('tr-TR')}</td>
      </tr>
    `
    )
    .join('')

  return resend.emails.send({
    from: `${siteName} <${fromEmail}>`,
    to: customerEmail,
    subject: `Siparişiniz Alındı - #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .order-number { background: #f9f9f9; padding: 15px; text-align: center; margin: 20px 0; }
            .order-number span { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; }
            .total { font-size: 18px; font-weight: bold; text-align: right; padding: 20px 0; }
            .address-box { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Siparişiniz Onaylandı</h2>
            </div>

            <p>Merhaba ${customerName},</p>

            <p>Siparişiniz başarıyla alındı ve hazırlanmaya başlandı.</p>

            <div class="order-number">
              Sipariş Numarası: <span>#${orderNumber}</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Boyut</th>
                  <th>Çerçeve</th>
                  <th style="text-align: right;">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total">
              Toplam: ₺${totalAmount.toLocaleString('tr-TR')}
            </div>

            <div class="address-box">
              <strong>Teslimat Adresi:</strong><br>
              ${shippingAddress.replace(/\n/g, '<br>')}
            </div>

            <p>Kargoya verildiğinde size bilgi vereceğiz.</p>

            <p>Teşekkürler,<br>${siteName}</p>

            <div class="footer">
              Sorularınız için bize ulaşabilirsiniz: ${contactEmail}
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

// Sipariş bildirimi - Site sahibine
export async function sendOrderNotification(data: OrderEmailData) {
  const { orderNumber, customerName, customerEmail, items, totalAmount, shippingAddress } = data

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.size}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.frame}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₺${item.price.toLocaleString('tr-TR')}</td>
      </tr>
    `
    )
    .join('')

  return resend.emails.send({
    from: `${siteName} <${fromEmail}>`,
    to: contactEmail,
    subject: `Yeni Sipariş #${orderNumber} - ₺${totalAmount.toLocaleString('tr-TR')}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; margin: -20px -20px 20px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .info-box { background: #f9f9f9; padding: 15px; }
            .label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #000; font-size: 12px; }
            .total { font-size: 20px; font-weight: bold; background: #f0f0f0; padding: 15px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Yeni Sipariş Alındı!</h2>
              <p style="margin: 5px 0 0; opacity: 0.8;">#${orderNumber}</p>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <div class="label">Müşteri</div>
                <strong>${customerName}</strong><br>
                <a href="mailto:${customerEmail}">${customerEmail}</a>
              </div>
              <div class="info-box">
                <div class="label">Teslimat Adresi</div>
                ${shippingAddress.replace(/\n/g, '<br>')}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Boyut</th>
                  <th>Çerçeve</th>
                  <th style="text-align: right;">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total">
              Toplam: ₺${totalAmount.toLocaleString('tr-TR')}
            </div>
          </div>
        </body>
      </html>
    `,
  })
}
