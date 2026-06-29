'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  GraduationCap, LayoutDashboard, BookOpen, BarChart2,
  ClipboardList, LogOut, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import type { Profile } from '@/types/database'

interface SidebarProps {
  profile: Profile
}

const NAV_INSTRUCTOR = [
  { href: '/dashboard',           icon: LayoutDashboard, labelKey: 'dashboard.myCourses' },
  { href: '/dashboard/gradebook', icon: BarChart2,        labelKey: 'course.gradebook' },
]

const NAV_STUDENT = [
  { href: '/dashboard',              icon: LayoutDashboard, labelKey: 'dashboard.myCourses' },
  { href: '/dashboard/assignments',  icon: ClipboardList,   labelKey: 'course.assignments' },
]

export function Sidebar({ profile }: SidebarProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = profile.role === 'instructor' ? NAV_INSTRUCTOR : NAV_STUDENT

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 0.75rem',
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0,
    }}>
      {/* App Logo */}
      <div style={{ padding: '0 0.5rem', marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={17} color="white" strokeWidth={1.75} />
          </div>
          <span className="gradient-text" style={{ fontWeight: '800', fontSize: '1.05rem' }}>
            thitiLMS
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: '500',
                color: isActive ? 'white' : 'var(--color-text-muted)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                  : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.75} />
              {t(labelKey as any)}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <LanguageToggle className="w-full justify-center" />

        {/* Profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-2)',
        }}>
          <div className="avatar" style={{ width: '34px', height: '34px', fontSize: '0.8125rem' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {profile.full_name}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
              {profile.role === 'instructor' ? 'ครูผู้สอน' : 'นักเรียน'}
            </p>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="btn-icon btn-ghost"
            title="ออกจากระบบ"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  )
}
