// ==== FILE: /app/admin/users/formatPhoneNumber.ts START ====
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length !== 10) return phone
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}
// ==== FILE: /app/admin/users/formatPhoneNumber.ts END ====
