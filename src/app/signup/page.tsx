'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Sparkles, AlertCircle, GraduationCap, BookOpen, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

type Role = 'student' | 'instructor'

const ROLE_OPTIONS: { value: Role; icon: typeof GraduationCap; labelKey: string; descTh: string }[] = [
  { value: 'student',    icon: GraduationCap, labelKey: 'auth.roleStudent',    descTh: 'เข้าร่วมห้องเรียนด้วยรหัส' },
  { value: 'instructor', icon: BookOpen,       labelKey: 'auth.roleInstructor', descTh: 'สร้างและบริหารห้องเรียน' },
]

export default function SignupPage() {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' as Role })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: form.role } },
    })
    if (error) {
      setError(t('auth.signupError'))
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4rem 1rem 1.5rem' }}>
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '55%', height: '55%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
        }} />
      </div>

      {/* Back to home */}
      <div className="fixed top-4 left-4">
        <Link href="/" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)' }}>
          <ChevronLeft size={15} />
          หน้าหลัก
        </Link>
      </div>
      <div className="fixed top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <div style={{
              width: '52px', height: '52px', margin: '0 auto 0.75rem',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <Sparkles size={24} color="white" strokeWidth={1.75} />
            </div>
          </Link>
          <h1 className="gradient-text" style={{ fontSize: '1.625rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            {t('auth.signupTitle')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem', fontSize: '0.8125rem' }}>
            {t('auth.signupSubtitle')}
          </p>
        </div>

        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Role Selector */}
            <div>
              <label className="input-label">{t('auth.role')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {ROLE_OPTIONS.map(({ value, icon: Icon, labelKey, descTh }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value}`}
                    onClick={() => handleChange('role', value)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: form.role === value
                        ? '2px solid var(--color-primary)'
                        : '2px solid var(--color-border)',
                      background: form.role === value
                        ? 'rgba(99,102,241,0.15)'
                        : 'var(--color-surface-2)',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      display: 'flex', justifyContent: 'center', marginBottom: '0.375rem',
                      color: form.role === value ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                    }}>
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <div style={{
                      fontWeight: '600', fontSize: '0.875rem',
                      color: form.role === value ? 'var(--color-primary-light)' : 'var(--color-text)',
                    }}>
                      {t(labelKey as any)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {descTh}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="signup-name">{t('auth.fullName')}</label>
              <input id="signup-name" type="text" className="input"
                placeholder="ชื่อ-นามสกุล" value={form.fullName}
                onChange={e => handleChange('fullName', e.target.value)} required />
            </div>

            <div>
              <label className="input-label" htmlFor="signup-email">{t('auth.email')}</label>
              <input id="signup-email" type="email" className="input"
                placeholder="your@email.com" value={form.email}
                onChange={e => handleChange('email', e.target.value)} required />
            </div>

            <div>
              <label className="input-label" htmlFor="signup-password">{t('auth.password')}</label>
              <input id="signup-password" type="password" className="input"
                placeholder="อย่างน้อย 8 ตัวอักษร" value={form.password}
                onChange={e => handleChange('password', e.target.value)} required minLength={8} />
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? t('common.loading') : t('auth.signup')}
            </button>
          </form>

          <div className="divider" style={{ margin: '1rem 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {t('auth.hasAccount')}{' '}
            <Link href="/login" style={{ color: 'var(--color-primary-light)', fontWeight: '600', textDecoration: 'none' }}>
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
