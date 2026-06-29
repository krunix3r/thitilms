'use client'

import { useTransition } from 'react'
import { Languages } from 'lucide-react'

interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const [isPending, startTransition] = useTransition()

  const currentLocale = typeof document !== 'undefined'
    ? document.cookie.match(/locale=([^;]+)/)?.[1] ?? 'th'
    : 'th'

  const toggleLanguage = () => {
    startTransition(() => {
      const newLocale = currentLocale === 'th' ? 'en' : 'th'
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
      window.location.reload()
    })
  }

  return (
    <button
      id="language-toggle"
      onClick={toggleLanguage}
      disabled={isPending}
      className={`btn btn-secondary btn-sm ${className}`}
      aria-label="Toggle language"
      style={{ gap: '0.375rem' }}
    >
      <Languages size={14} strokeWidth={1.75} />
      <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>
        {currentLocale === 'th' ? 'TH' : 'EN'}
      </span>
    </button>
  )
}
