'use client'

import { QRCodeCanvas } from 'qrcode.react'

export default function QrCode({ url, size = 160 }: { url: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4">
      <QRCodeCanvas value={url} size={size} level="M" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline"
      >
        {url}
      </a>
    </div>
  )
}
