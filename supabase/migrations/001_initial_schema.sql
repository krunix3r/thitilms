-- ============================================================
-- thitiLMS — Initial Schema Migration
-- ============================================================
-- Privacy by Design: No Device IDs, No IP tracking (COPPA compliant)
-- All tables have Row Level Security (RLS) enabled
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM Types
-- ============================================================
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE grading_schema_type AS ENUM ('thai_standard', 'pass_fail', 'complete_incomplete', 'custom');
CREATE TYPE post_type AS ENUM ('announcement', 'assignment', 'material', 'discussion');

-- ============================================================
-- Table: profiles (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role         user_role NOT NULL DEFAULT 'student',
  avatar_url   TEXT,
  language     VARCHAR(5) NOT NULL DEFAULT 'th', -- 'th' or 'en'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: courses
-- ============================================================
CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  title_en      VARCHAR(255),
  description   TEXT,
  description_en TEXT,
  class_code    VARCHAR(6) UNIQUE NOT NULL,
  subject_code  VARCHAR(50),
  academic_year INT,
  semester      INT CHECK (semester IN (1, 2)),
  grading_schema grading_schema_type NOT NULL DEFAULT 'thai_standard',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  start_date    DATE,
  end_date      DATE,
  cover_color   VARCHAR(7) DEFAULT '#6366f1',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: enrollments (Many-to-Many: students ↔ courses)
-- ============================================================
CREATE TABLE enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- ============================================================
-- Table: posts (Post Stream — announcements, materials, discussions)
-- ============================================================
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_type   post_type NOT NULL DEFAULT 'announcement',
  title       VARCHAR(500),
  content     TEXT,
  attachments JSONB DEFAULT '[]',  -- [{name, url, type, size}]
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: comments
-- ============================================================
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: assignments
-- ============================================================
CREATE TABLE assignments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  post_id           UUID REFERENCES posts(id) ON DELETE SET NULL,
  title             VARCHAR(255) NOT NULL,
  title_en          VARCHAR(255),
  description       TEXT,
  points_possible   FLOAT NOT NULL DEFAULT 100,
  due_date          TIMESTAMPTZ,
  allow_late        BOOLEAN NOT NULL DEFAULT false,
  schema_definition JSONB,      -- SurveyJS JSON Schema for interactive worksheet
  answer_key        JSONB,      -- Correct answers for auto-grading
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: submissions
-- ============================================================
CREATE TABLE submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response_data   JSONB,        -- SurveyJS result JSON
  attachments     JSONB DEFAULT '[]',
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late         BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(assignment_id, student_id)
);

-- ============================================================
-- Table: grades
-- ============================================================
CREATE TABLE grades (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  score           FLOAT,                    -- raw score (0-100)
  letter_grade    VARCHAR(3),               -- A, B+, B, C+, C, D+, D, F
  gpa_value       FLOAT,                    -- 4.0, 3.5, 3.0, ...
  grade_status    VARCHAR(20),              -- pass, fail, complete, incomplete
  feedback        TEXT,
  is_auto_graded  BOOLEAN NOT NULL DEFAULT false,
  graded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded_by       UUID REFERENCES profiles(id)
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_courses_updated_at    BEFORE UPDATE ON courses    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated_at      BEFORE UPDATE ON posts      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'ผู้ใช้ใหม่'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate unique 6-digit class code
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  code VARCHAR(6);
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT COUNT(*) > 0 INTO exists FROM courses WHERE class_code = code;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- THAI STANDARD GRADING FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION compute_thai_grade(score FLOAT)
RETURNS TABLE(letter_grade VARCHAR(3), gpa_value FLOAT, grade_status VARCHAR(20)) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN score >= 80 THEN 'A'
      WHEN score >= 75 THEN 'B+'
      WHEN score >= 70 THEN 'B'
      WHEN score >= 65 THEN 'C+'
      WHEN score >= 60 THEN 'C'
      WHEN score >= 55 THEN 'D+'
      WHEN score >= 50 THEN 'D'
      ELSE 'F'
    END::VARCHAR(3),
    CASE
      WHEN score >= 80 THEN 4.0
      WHEN score >= 75 THEN 3.5
      WHEN score >= 70 THEN 3.0
      WHEN score >= 65 THEN 2.5
      WHEN score >= 60 THEN 2.0
      WHEN score >= 55 THEN 1.5
      WHEN score >= 50 THEN 1.0
      ELSE 0.0
    END::FLOAT,
    CASE
      WHEN score >= 50 THEN 'pass'
      ELSE 'fail'
    END::VARCHAR(20);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_courses_instructor_id   ON courses(instructor_id);
CREATE INDEX idx_courses_class_code      ON courses(class_code);
CREATE INDEX idx_enrollments_student_id  ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id   ON enrollments(course_id);
CREATE INDEX idx_posts_course_id         ON posts(course_id);
CREATE INDEX idx_assignments_course_id   ON assignments(course_id);
CREATE INDEX idx_submissions_assignment  ON submissions(assignment_id);
CREATE INDEX idx_submissions_student     ON submissions(student_id);
CREATE INDEX idx_grades_submission       ON grades(submission_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades      ENABLE ROW LEVEL SECURITY;

-- profiles: Users can view/edit own profile; admin sees all
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- courses: Instructor manages own courses; enrolled students can view
CREATE POLICY "courses_select" ON courses FOR SELECT USING (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = id AND e.student_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (
  instructor_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor', 'admin'))
);
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (instructor_id = auth.uid());
CREATE POLICY "courses_delete" ON courses FOR DELETE USING (instructor_id = auth.uid());

-- enrollments: Students see own; instructors see their course enrollments
CREATE POLICY "enrollments_select" ON enrollments FOR SELECT USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "enrollments_insert" ON enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "enrollments_delete" ON enrollments FOR DELETE USING (student_id = auth.uid());

-- posts: Course members can read; only instructor can write
CREATE POLICY "posts_select" ON posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = course_id AND (c.instructor_id = auth.uid() OR e.student_id = auth.uid())
  )
);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid())
);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (author_id = auth.uid());

-- comments: Course members can read and write own comments
CREATE POLICY "comments_select" ON comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts p
    JOIN courses c ON c.id = p.course_id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE p.id = post_id AND (c.instructor_id = auth.uid() OR e.student_id = auth.uid())
  )
);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (author_id = auth.uid());

-- assignments: Enrolled students and instructor can view; only instructor inserts
CREATE POLICY "assignments_select" ON assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = course_id AND (c.instructor_id = auth.uid() OR e.student_id = auth.uid())
  )
);
CREATE POLICY "assignments_insert" ON assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid())
);
CREATE POLICY "assignments_update" ON assignments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid())
);

-- submissions: Students see own; instructor sees course submissions
CREATE POLICY "submissions_select" ON submissions FOR SELECT USING (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM assignments a
    JOIN courses c ON c.id = a.course_id
    WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
  )
);
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "submissions_update" ON submissions FOR UPDATE USING (student_id = auth.uid());

-- grades: Students see own; instructor sees and manages their course grades
CREATE POLICY "grades_select" ON grades FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM submissions s WHERE s.id = submission_id AND s.student_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    JOIN courses c ON c.id = a.course_id
    WHERE s.id = submission_id AND c.instructor_id = auth.uid()
  )
);
CREATE POLICY "grades_insert" ON grades FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    JOIN courses c ON c.id = a.course_id
    WHERE s.id = submission_id AND c.instructor_id = auth.uid()
  )
);
CREATE POLICY "grades_update" ON grades FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    JOIN courses c ON c.id = a.course_id
    WHERE s.id = submission_id AND c.instructor_id = auth.uid()
  )
);
