type AdminAlertInput = {
  request_number: string
  name: string
  mobile: string
  subject: string
  district?: string | null
}

export async function sendWhatsAppAdminAlert(input: AdminAlertInput): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const to = process.env.WHATSAPP_ADMIN_NUMBER
  if (!token || !phoneNumberId || !to) return

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'new_request_alert'

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: input.request_number },
                { type: 'text', text: input.name },
                { type: 'text', text: input.mobile },
                { type: 'text', text: input.subject },
                { type: 'text', text: input.district || '—' },
              ],
            },
          ],
        },
      }),
    })
    if (!res.ok) {
      console.error('whatsapp alert error', res.status, await res.text())
    }
  } catch (err) {
    console.error('whatsapp alert error', err)
  }
}
