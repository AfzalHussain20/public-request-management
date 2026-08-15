import * as XLSX from 'xlsx'
import type { RequestStatus } from '@/lib/types'

type NamePair = { name_en: string; name_ta: string } | null

export type ExportRow = {
  request_number: string
  name: string
  initial: string
  mobile: string
  district: NamePair
  taluk: NamePair
  local_body: NamePair
  ward: NamePair
  assembly_constituency: NamePair
  parliament_constituency: NamePair
  address: string
  category: NamePair
  subject: string
  description: string
  status: RequestStatus
  assignee: { name: string } | null
  created_at: string
  updated_at: string
}

export function toExportColumns(rows: ExportRow[]) {
  const n = (o: NamePair) => o?.name_en ?? ''
  return rows.map((r) => ({
    'Request ID': r.request_number,
    Name: r.name,
    Initial: r.initial,
    Mobile: r.mobile,
    District: n(r.district),
    Taluk: n(r.taluk),
    'Local Body': n(r.local_body),
    Ward: n(r.ward),
    'Assembly Constituency': n(r.assembly_constituency),
    'Parliament Constituency': n(r.parliament_constituency),
    Address: r.address,
    Category: n(r.category),
    Subject: r.subject,
    Description: r.description,
    Status: r.status,
    'Assigned To': r.assignee?.name ?? '',
    'Created Date': new Date(r.created_at).toLocaleString(),
    'Updated Date': new Date(r.updated_at).toLocaleString(),
  }))
}

export function exportExcel(rows: ExportRow[], filename: string) {
  const data = toExportColumns(rows)
  const sheet = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, 'Requests')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportCsv(rows: ExportRow[], filename: string) {
  const data = toExportColumns(rows)
  const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data))
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
