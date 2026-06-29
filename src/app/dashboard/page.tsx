import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Key, BookOpen, CheckCircle2, Archive } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Course, Profile } from '@/types/database'

const COVER_GRADIENTS: Record<string, string> = {
  '#6366f1': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  '#ec4899': 'linear-gradient(135deg, #ec4899, #f97316)',
  '#22c55e': 'linear-gradient(135deg, #22c55e, #06b6d4)',
  '#f59e0b': 'linear-gradient(135deg, #f59e0b, #ef4444)',
  '#06b6d4': 'linear-gradient(135deg, #06b6d4, #6366f1)',
}

function getCoverGradient(color: string) {
  return COVER_GRADIENTS[color] ?? `linear-gradient(135deg, ${color}, #8b5cf6)`
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Cover */}
        <div style={{
          height: '96px',
          background: getCoverGradient(course.cover_color),
          display: 'flex', alignItems: 'flex-end',
          padding: '1rem 1.25rem',
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '5px', padding: '2px 8px',
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)',
            fontWeight: '700', letterSpacing: '0.05em', fontFamily: 'monospace',
          }}>
            {course.class_code}
          </span>
          <h3 style={{
            color: 'white', fontWeight: '700', fontSize: '0.9375rem',
            lineHeight: '1.35', textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            maxWidth: '85%',
          }}>
            {course.title}
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: '0.875rem 1.25rem' }}>
          {course.subject_code && (
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
              {course.subject_code}
              {course.semester && ` · เทอม ${course.semester}/${course.academic_year}`}
            </p>
          )}
          {course.description && (
            <p style={{
              fontSize: '0.8125rem', color: 'var(--color-text-muted)',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {course.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profileData) redirect('/login')
  const profile = profileData as Profile

  let courses: Course[] = []

  if (profile.role === 'instructor' || profile.role === 'admin') {
    const { data } = await supabase
      .from('courses').select('*')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false })
    courses = data ?? []
  } else {
    const { data } = await supabase
      .from('enrollments').select('courses(*)')
      .eq('student_id', user.id)
    courses = (data?.map((e: any) => e.courses).filter(Boolean) as Course[]) ?? []
  }

  const isInstructor = profile.role === 'instructor' || profile.role === 'admin'
  const firstName = profile.display_name ?? profile.full_name.split(' ')[0]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            สวัสดี, {firstName}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {isInstructor ? 'จัดการรายวิชาและนักเรียนของคุณ' : 'รายวิชาที่คุณลงทะเบียน'}
          </p>
        </div>

        {isInstructor ? (
          <Link href="/dashboard/create-course" className="btn btn-primary">
            <Plus size={15} strokeWidth={2.5} />
            สร้างรายวิชา
          </Link>
        ) : (
          <Link href="/dashboard/join" className="btn btn-primary">
            <Key size={14} strokeWidth={2} />
            เข้าร่วมรายวิชา
          </Link>
        )}
      </div>

      {/* Stats (Instructor only) */}
      {isInstructor && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'รายวิชาทั้งหมด',  value: courses.length,                              icon: BookOpen,      color: '#6366f1' },
            { label: 'รายวิชาที่เปิดอยู่', value: courses.filter(c => c.is_active).length,  icon: CheckCircle2,  color: '#22c55e' },
            { label: 'รายวิชาปิดแล้ว',  value: courses.filter(c => !c.is_active).length,   icon: Archive,       color: '#64748b' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={color} strokeWidth={1.75} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: '800', color, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--color-border)',
        }}>
          <div style={{
            width: '56px', height: '56px', margin: '0 auto 1.25rem',
            background: 'rgba(99,102,241,0.1)', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={26} color="var(--color-primary)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.125rem' }}>ยังไม่มีรายวิชา</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {isInstructor ? 'เริ่มต้นสร้างรายวิชาแรกของคุณ' : 'ใช้รหัสห้องเรียนเพื่อเข้าร่วมรายวิชา'}
          </p>
          {isInstructor ? (
            <Link href="/dashboard/create-course" className="btn btn-primary">
              <Plus size={14} /> สร้างรายวิชา
            </Link>
          ) : (
            <Link href="/dashboard/join" className="btn btn-primary">
              <Key size={14} /> เข้าร่วมรายวิชา
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
