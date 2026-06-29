'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { GraduationCap, AlertCircle, Loader2, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

export default function LoginPage() {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(t('auth.loginError'))
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
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
        <div className="text-center mb-8">
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <div style={{
              width: '60px', height: '60px', margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <GraduationCap size={28} color="white" strokeWidth={1.75} />
            </div>
          </Link>
          <h1 className="gradient-text" style={{ fontSize: '1.875rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            thitiLMS
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {t('auth.loginTitle')}
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {t('auth.loginSubtitle')}
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <AlertCircle size={15} strokeWidth={2} />
                {error}
              </div>
            )}

            <div>
              <label className="input-label" htmlFor="login-email">{t('auth.email')}</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="login-password">{t('auth.password')}</label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
              <Link href="/forgot-password" style={{ color: 'var(--color-primary-light)', fontSize: '0.8125rem' }}>
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  {t('common.loading')}
                </>
              ) : t('auth.login')}
            </button>
          </form>

          <div className="divider" style={{ margin: '1.5rem 0', position: 'relative', textAlign: 'center' }}>
            <span style={{
              position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(26,26,46,0.9)', padding: '0 0.75rem',
              color: 'var(--color-text-muted)', fontSize: '0.8125rem',
            }}>
              {t('common.or')}
            </span>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {t('auth.noAccount')}{' '}
            <Link href="/signup" style={{ color: 'var(--color-primary-light)', fontWeight: '600', textDecoration: 'none' }}>
              {t('auth.signup')}
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
