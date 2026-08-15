const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']

export type RequestFormInput = {
  name: string
  initial: string
  mobile: string
  alternate_mobile: string
  district_id: string | null
  taluk_id: string | null
  local_body_id: string | null
  ward_id: string | null
  assembly_constituency_id: string | null
  parliament_constituency_id: string | null
  address: string
  category_id: string | null
  subject: string
  description: string
  consent: boolean
  company?: string
}

export type ValidationResult = { ok: true } | { ok: false; errors: Record<string, string> }

function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile)
}

export function validateRequestForm(input: RequestFormInput): ValidationResult {
  const errors: Record<string, string> = {}

  if (!input.name || input.name.trim().length < 2) errors.name = 'required'
  if (!isValidMobile(input.mobile)) errors.mobile = 'invalidMobile'
  if (input.alternate_mobile && !isValidMobile(input.alternate_mobile))
    errors.alternate_mobile = 'invalidMobile'
  if (!input.consent) errors.consent = 'pleaseConsent'

  if (input.subject && input.subject.trim().length > 200) errors.subject = 'required'

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true }
}

export function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength)
}

export function isValidFileType(type: string): boolean {
  return ALLOWED_FILE_TYPES.includes(type.toLowerCase())
}

export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE
}
