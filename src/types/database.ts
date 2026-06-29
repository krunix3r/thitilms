export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'student' | 'instructor' | 'admin'
export type GradingSchemaType = 'thai_standard' | 'pass_fail' | 'complete_incomplete' | 'custom'
export type PostType = 'announcement' | 'assignment' | 'material' | 'discussion'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          display_name: string | null
          role: UserRole
          avatar_url: string | null
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          display_name?: string | null
          role?: UserRole
          avatar_url?: string | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      courses: {
        Row: {
          id: string
          instructor_id: string
          title: string
          title_en: string | null
          description: string | null
          description_en: string | null
          class_code: string
          subject_code: string | null
          academic_year: number | null
          semester: number | null
          grading_schema: GradingSchemaType
          is_active: boolean
          start_date: string | null
          end_date: string | null
          cover_color: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'enrolled_at'>
        Update: never
      }
      posts: {
        Row: {
          id: string
          course_id: string
          author_id: string
          post_type: PostType
          title: string | null
          content: string | null
          attachments: Json
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>
        Update: never
      }
      assignments: {
        Row: {
          id: string
          course_id: string
          post_id: string | null
          title: string
          title_en: string | null
          description: string | null
          points_possible: number
          due_date: string | null
          allow_late: boolean
          schema_definition: Json | null
          answer_key: Json | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assignments']['Insert']>
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          response_data: Json | null
          attachments: Json
          submitted_at: string
          is_late: boolean
        }
        Insert: Omit<Database['public']['Tables']['submissions']['Row'], 'id' | 'submitted_at'>
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>
      }
      grades: {
        Row: {
          id: string
          submission_id: string
          score: number | null
          letter_grade: string | null
          gpa_value: number | null
          grade_status: string | null
          feedback: string | null
          is_auto_graded: boolean
          graded_at: string
          graded_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'id' | 'graded_at'>
        Update: Partial<Database['public']['Tables']['grades']['Insert']>
      }
    }
    Functions: {
      generate_class_code: {
        Args: Record<string, never>
        Returns: string
      }
      compute_thai_grade: {
        Args: { score: number }
        Returns: { letter_grade: string; gpa_value: number; grade_status: string }[]
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Assignment = Database['public']['Tables']['assignments']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type Grade = Database['public']['Tables']['grades']['Row']

// Thai Grading Schema
export const THAI_GRADING_SCALE = [
  { min: 80, max: 100, letter: 'A',  gpa: 4.0, label_th: 'ดีเยี่ยม',  label_en: 'Excellent' },
  { min: 75, max: 79,  letter: 'B+', gpa: 3.5, label_th: 'ดีมาก',     label_en: 'Very Good' },
  { min: 70, max: 74,  letter: 'B',  gpa: 3.0, label_th: 'ดี',         label_en: 'Good' },
  { min: 65, max: 69,  letter: 'C+', gpa: 2.5, label_th: 'ค่อนข้างดี', label_en: 'Fairly Good' },
  { min: 60, max: 64,  letter: 'C',  gpa: 2.0, label_th: 'พอใช้',      label_en: 'Fair' },
  { min: 55, max: 59,  letter: 'D+', gpa: 1.5, label_th: 'อ่อน',       label_en: 'Poor' },
  { min: 50, max: 54,  letter: 'D',  gpa: 1.0, label_th: 'อ่อนมาก',    label_en: 'Very Poor' },
  { min: 0,  max: 49,  letter: 'F',  gpa: 0.0, label_th: 'ตก',         label_en: 'Fail' },
] as const

export function computeThaiGrade(score: number) {
  return THAI_GRADING_SCALE.find(g => score >= g.min && score <= g.max)
    ?? THAI_GRADING_SCALE[THAI_GRADING_SCALE.length - 1]
}
