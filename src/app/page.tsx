import Link from 'next/link'
import {
  BookOpen, Users, FileText, Zap, Award, Globe,
  ArrowRight, GraduationCap
} from 'lucide-react'

const FEATURES = [
  { icon: BookOpen, label: 'จัดการรายวิชา' },
  { icon: Users,    label: 'รหัสห้องเรียน' },
  { icon: FileText, label: 'ใบกิจกรรมโต้ตอบ' },
  { icon: Zap,      label: 'ตรวจงานอัตโนมัติ' },
  { icon: Award,    label: 'เกรดมาตรฐานไทย' },
  { icon: Globe,    label: 'รองรับ 2 ภาษา' },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '0', right: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(15,15,26,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={18} color="white" />
          </div>
          <span className="gradient-text" style={{ fontWeight: '800', fontSize: '1.2rem' }}>thitiLMS</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/login" className="btn btn-ghost">เข้าสู่ระบบ</Link>
          <Link href="/signup" className="btn btn-primary">เริ่มต้นใช้งาน</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '5rem 2rem', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <div className="badge badge-primary" style={{ marginBottom: '1.5rem' }}>
          ระบบห้องเรียนออนไลน์รุ่นใหม่
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: '900',
          lineHeight: '1.1',
          letterSpacing: '-0.03em',
          maxWidth: '800px',
          marginBottom: '1.5rem',
        }}>
          เรียนรู้และสอน{' '}
          <span className="gradient-text">ออนไลน์</span>{' '}
          ได้อย่างไร้ขีดจำกัด
        </h1>

        <p style={{
          fontSize: '1.125rem',
          color: 'var(--color-text-muted)',
          maxWidth: '540px',
          lineHeight: '1.7',
          marginBottom: '2.5rem',
        }}>
          แพลตฟอร์มจัดการเรียนการสอนที่ทรงพลัง รองรับใบกิจกรรมโต้ตอบ
          ระบบเกรดมาตรฐานไทย และการตรวจงานอัตโนมัติ
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            เริ่มต้นฟรี
            <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            เข้าสู่ระบบ
          </Link>
        </div>

        {/* Feature chips */}
        <div style={{
          display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
          justifyContent: 'center', marginTop: '3rem',
        }}>
          {FEATURES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="badge badge-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Icon size={13} />
              {label}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
