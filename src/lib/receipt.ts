export type SubmittedRequest = {
  id: string
  request_number: string
  name: string
  mobile: string
  subject: string
  status: string
  created_at: string
}

export function buildWhatsAppMessage(req: SubmittedRequest): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  return [
    `*Public Request Submitted*`,
    `Request ID: ${req.request_number}`,
    `Name: ${req.name}`,
    `Subject: ${req.subject}`,
    `Status: ${req.status}`,
    appUrl ? `Track: ${appUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function whatsAppDeepLink(message: string, phone?: string): string {
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}

export function downloadReceipt(req: SubmittedRequest, lang: 'en' | 'ta') {
  const title = lang === 'ta' ? 'கோரிக்கை ரசீது' : 'Request Receipt'
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><title>${title} - ${req.request_number}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 40px; }
  .receipt { max-width: 420px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 24px; }
  h1 { font-size: 18px; margin-top: 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 0; font-size: 14px; vertical-align: top; }
  td:first-child { color: #555; width: 40%; }
</style></head>
<body>
  <div class="receipt">
    <h1>${title}</h1>
    <table>
      <tr><td>${lang === 'ta' ? 'கோரிக்கை எண்' : 'Request ID'}</td><td><strong>${req.request_number}</strong></td></tr>
      <tr><td>${lang === 'ta' ? 'பெயர்' : 'Name'}</td><td>${req.name}</td></tr>
      <tr><td>${lang === 'ta' ? 'கைபேசி எண்' : 'Mobile'}</td><td>${req.mobile}</td></tr>
      <tr><td>${lang === 'ta' ? 'தலைப்பு' : 'Subject'}</td><td>${req.subject}</td></tr>
      <tr><td>${lang === 'ta' ? 'நிலை' : 'Status'}</td><td>${req.status}</td></tr>
      <tr><td>${lang === 'ta' ? 'தேதி' : 'Date'}</td><td>${new Date(req.created_at).toLocaleString()}</td></tr>
    </table>
  </div>
</body>
</html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${req.request_number}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
