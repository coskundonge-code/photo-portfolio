// E-posta Template'leri
// Resend ile kullanılmak üzere HTML e-posta şablonları

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  subjectLabel: string;
  message: string;
}

// Konu etiketlerini Türkçe'ye çevir
const subjectLabels: Record<string, string> = {
  order: 'Sipariş Hakkında',
  custom: 'Özel Talep',
  collab: 'İşbirliği',
  other: 'Diğer',
};

// Admin'e gönderilecek bildirim e-postası
export function getAdminNotificationEmail(data: ContactFormData, siteName: string): string {
  const subjectText = subjectLabels[data.subject] || data.subjectLabel || data.subject;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni İletişim Mesajı</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background-color: #000000;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: 0.5px;">
                ${siteName}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; color: #000000; font-size: 24px; font-weight: 500;">
                Yeni İletişim Mesajı
              </h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Gönderen</span>
                    <p style="margin: 4px 0 0 0; color: #000; font-size: 16px;">${data.name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">E-posta</span>
                    <p style="margin: 4px 0 0 0; color: #000; font-size: 16px;">
                      <a href="mailto:${data.email}" style="color: #000; text-decoration: underline;">${data.email}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Konu</span>
                    <p style="margin: 4px 0 0 0; color: #000; font-size: 16px;">${subjectText}</p>
                  </td>
                </tr>
              </table>

              <div style="background-color: #f9f9f9; padding: 24px; border-radius: 4px;">
                <span style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Mesaj</span>
                <p style="margin: 12px 0 0 0; color: #000; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              </div>

              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
                <a href="mailto:${data.email}?subject=Re: ${subjectText}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; font-size: 14px; border-radius: 4px;">
                  Yanıtla
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Bu e-posta ${siteName} web sitesi iletişim formu üzerinden gönderilmiştir.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Kullanıcıya gönderilecek onay e-postası
export function getUserConfirmationEmail(data: ContactFormData, siteName: string): string {
  const subjectText = subjectLabels[data.subject] || data.subjectLabel || data.subject;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mesajınız Alındı</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background-color: #000000;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: 0.5px;">
                ${siteName}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #000000; font-size: 24px; font-weight: 500;">
                Mesajınız Alındı
              </h2>

              <p style="margin: 0 0 24px 0; color: #444; font-size: 16px; line-height: 1.6;">
                Merhaba ${data.name},
              </p>

              <p style="margin: 0 0 24px 0; color: #444; font-size: 16px; line-height: 1.6;">
                Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapacağım.
              </p>

              <div style="background-color: #f9f9f9; padding: 24px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Mesajınızın Özeti</p>
                <p style="margin: 0 0 4px 0; color: #000; font-size: 14px;"><strong>Konu:</strong> ${subjectText}</p>
                <p style="margin: 0; color: #000; font-size: 14px; line-height: 1.5; white-space: pre-wrap;"><strong>Mesaj:</strong> ${data.message.length > 200 ? data.message.substring(0, 200) + '...' : data.message}</p>
              </div>

              <p style="margin: 0; color: #444; font-size: 16px; line-height: 1.6;">
                Teşekkürler,<br>
                <strong>${siteName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Bu otomatik bir onay e-postasıdır. Lütfen bu e-postayı yanıtlamayın.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Sipariş onay e-postası (ileride kullanılabilir)
export function getOrderConfirmationEmail(
  orderData: {
    orderNumber: string;
    customerName: string;
    items: { title: string; size: string; price: number }[];
    totalAmount: number;
  },
  siteName: string
): string {
  const itemsHtml = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <p style="margin: 0; color: #000; font-size: 15px;">${item.title}</p>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">Boyut: ${item.size}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
          <p style="margin: 0; color: #000; font-size: 15px;">₺${item.price.toLocaleString('tr-TR')}</p>
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sipariş Onayı</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background-color: #000000;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: 0.5px;">
                ${siteName}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #000000; font-size: 24px; font-weight: 500;">
                Siparişiniz Alındı
              </h2>

              <p style="margin: 0 0 24px 0; color: #444; font-size: 16px; line-height: 1.6;">
                Merhaba ${orderData.customerName},
              </p>

              <p style="margin: 0 0 24px 0; color: #444; font-size: 16px; line-height: 1.6;">
                Siparişiniz başarıyla alınmıştır. Sipariş numaranız: <strong>${orderData.orderNumber}</strong>
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 16px 0;">
                    <p style="margin: 0; color: #000; font-size: 16px; font-weight: 600;">Toplam</p>
                  </td>
                  <td style="padding: 16px 0; text-align: right;">
                    <p style="margin: 0; color: #000; font-size: 18px; font-weight: 600;">₺${orderData.totalAmount.toLocaleString('tr-TR')}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                Siparişinizin hazırlık süreci hakkında size ayrıca bilgi verilecektir.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Sorularınız için iletişim sayfamızdan bize ulaşabilirsiniz.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
