type NewRequestInput = {
  request_number: string
  name: string
  mobile: string
  subject: string
  district?: string | null
}

export async function sendTelegramAlert(input: NewRequestInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const text = [
    `📩 New request ${input.request_number}`,
    `👤 ${input.name}`,
    `📞 ${input.mobile}`,
    `📝 ${input.subject}`,
    `📍 ${input.district || '—'}`,
  ].join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    if (!res.ok) {
      console.error('telegram alert error', res.status, await res.text())
    }
  } catch (err) {
    console.error('telegram alert error', err)
  }
}
