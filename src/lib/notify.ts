import { sendWhatsAppAdminAlert } from '@/lib/whatsapp'
import { sendTelegramAlert } from '@/lib/telegram'

type NewRequest = {
  request_number: string
  name: string
  mobile: string
  subject: string
  district: string | null
}

/**
 * Notifies the admin office about a new request over every configured channel
 * (WhatsApp Cloud API and/or Telegram bot). No-ops silently when unconfigured.
 */
export async function notifyNewRequest(input: NewRequest): Promise<void> {
  await Promise.allSettled([sendWhatsAppAdminAlert(input), sendTelegramAlert(input)])
}
