import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

export const metadata: Metadata = {
  title: 'thitiLMS — ระบบจัดการเรียนการสอนออนไลน์',
  description: 'ระบบห้องเรียนออนไลน์แบบครบวงจร สำหรับครูและนักเรียน รองรับใบกิจกรรมโต้ตอบ การมอบหมายงาน และระบบตรวจงานอัตโนมัติ',
  keywords: ['LMS', 'ห้องเรียนออนไลน์', 'e-learning', 'Thailand', 'Education'],
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
