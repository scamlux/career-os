'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useAppStore } from '@/shared/store/app-store';

type CourseCard = {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Backend' | 'Frontend' | 'Data' | 'Soft Skills';
  lessons: number;
  duration: string;
  mappedSkills: string[];
  instructor: string;
};

const catalog: CourseCard[] = [
  {
    id: 'alpha-node-core',
    title: 'Node.js Backend Alpha',
    level: 'Beginner',
    category: 'Backend',
    lessons: 18,
    duration: '24h',
    mappedSkills: ['Node.js', 'REST', 'PostgreSQL'],
    instructor: 'Artem Volkov'
  },
  {
    id: 'alpha-system-design',
    title: 'System Design Fundamentals',
    level: 'Intermediate',
    category: 'Backend',
    lessons: 14,
    duration: '19h',
    mappedSkills: ['Architecture', 'Scalability', 'Caching'],
    instructor: 'Maya Kim'
  },
  {
    id: 'alpha-react-lab',
    title: 'React Product Engineering',
    level: 'Intermediate',
    category: 'Frontend',
    lessons: 22,
    duration: '31h',
    mappedSkills: ['React', 'State', 'Performance'],
    instructor: 'Daniel Rios'
  },
  {
    id: 'alpha-career-communication',
    title: 'Communication for Career Growth',
    level: 'Beginner',
    category: 'Soft Skills',
    lessons: 10,
    duration: '9h',
    mappedSkills: ['Communication', 'Feedback', 'Negotiation'],
    instructor: 'Elena Markova'
  }
];

export function CoursesMode() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | CourseCard['category']>('All');

  const coursesState = useAppStore((state) => state.coursesState);
  const setActiveCourse = useAppStore((state) => state.setActiveCourse);
  const setActiveLesson = useAppStore((state) => state.setActiveLesson);
  const toggleEnrollCourse = useAppStore((state) => state.toggleEnrollCourse);
  const setCourseProgress = useAppStore((state) => state.setCourseProgress);

  const filtered = useMemo(() => {
    return catalog.filter((course) => {
      const categoryMatch = category === 'All' || course.category === category;
      const searchMatch =
        !search.trim() ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.mappedSkills.join(' ').toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const activeCourse = catalog.find((course) => course.id === coursesState.activeCourseId) ?? filtered[0];

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[280px_1fr_320px]">
      <aside className="panel h-[calc(100vh-11rem)] space-y-3 overflow-auto">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">LMS Navigator</h3>
        <Input
          placeholder="Search by title or skill"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search courses"
        />

        <div className="space-y-2">
          {(['All', 'Backend', 'Frontend', 'Data', 'Soft Skills'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${category === item ? 'border-accent bg-accent/10 text-text' : 'border-line bg-bg text-muted'}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-line bg-bg p-3 text-xs text-muted">
          <p className="font-semibold uppercase tracking-wide text-text">Enrolled</p>
          <div className="mt-2 space-y-2">
            {coursesState.enrolledCourseIds.length === 0 ? <p>No enrolled tracks.</p> : null}
            {coursesState.enrolledCourseIds.map((id) => {
              const progress = coursesState.progressByCourse[id] ?? 0;
              return (
                <div key={id} className="rounded-lg border border-line/80 p-2">
                  <p className="truncate text-text">{catalog.find((item) => item.id === id)?.title ?? id}</p>
                  <p className="mt-1">Progress {progress}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="panel h-[calc(100vh-11rem)] overflow-auto">
        <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text">Courses Workspace</h3>
            <p className="text-xs text-muted">LMS alpha style: focused curriculum, clean tracking, skill mapping.</p>
          </div>
          <p className="text-xs text-muted">{filtered.length} courses</p>
        </div>

        <div className="space-y-3">
          {filtered.map((course) => {
            const enrolled = coursesState.enrolledCourseIds.includes(course.id);
            const progress = coursesState.progressByCourse[course.id] ?? 0;
            return (
              <article key={course.id} className="rounded-2xl border border-line bg-bg p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{course.category} · {course.level}</p>
                    <h4 className="mt-1 text-base font-semibold text-text">{course.title}</h4>
                    <p className="mt-1 text-xs text-muted">Instructor: {course.instructor} · {course.lessons} lessons · {course.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant={enrolled ? 'ghost' : 'primary'} onClick={() => toggleEnrollCourse(course.id)}>
                      {enrolled ? 'Unenroll' : 'Enroll'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setActiveCourse(course.id);
                        setActiveLesson('lesson-1');
                      }}
                    >
                      Open
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {course.mappedSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-line px-2 py-1 text-xs text-muted">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-panel">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" onClick={() => setCourseProgress(course.id, Math.min(100, progress + 10))}>
                    Track +10%
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveLesson('quiz')}>Quiz</Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="panel h-[calc(100vh-11rem)] space-y-3 overflow-auto">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Learning Context</h3>
        {activeCourse ? (
          <>
            <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
              <p className="font-semibold text-text">Now Learning</p>
              <p className="mt-1">{activeCourse.title}</p>
              <p className="text-xs">Lesson: {coursesState.activeLessonId || 'lesson-1'}</p>
            </div>

            <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
              <p className="font-semibold text-text">Roadmap Skills Link</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {activeCourse.mappedSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-line bg-bg p-3 text-sm text-muted">
              <p className="font-semibold text-text">AI Help</p>
              <p className="mt-1">Use AI-HR mode to get mentor hints tied to this course track.</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Choose a course to inspect details.</p>
        )}
      </aside>
    </div>
  );
}
