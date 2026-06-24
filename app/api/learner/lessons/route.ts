import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-it';

/** Extract a plain string from either a raw string or a bilingual {en, ta} JSON object */
function getText(value: unknown, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const v = value as Record<string, unknown>;
    return (typeof v['en'] === 'string' ? v['en'] : null) ||
           (typeof v['ta'] === 'string' ? v['ta'] : null) ||
           fallback;
  }
  return fallback;
}

interface LessonProgress {
  status: string;
  score: number;
  updatedAt: Date;
}

interface LessonItem {
  id: string;
  title: string;
  description: string;
  language: string;
  gradeLevel: string;
  duration: number;
  disabilityTypes: string[];
  badge?: string;
  competencies: string[];
  learningObjectives: string[];
  hasTranscripts: boolean;
  hasCaptions: boolean;
  progress: {
    status: string;
    score: number;
    attemptCount: number;
    lastAccessedAt: string | null;
  };
}

const ALL_MOCK_LESSONS = (lang: string, progressMap: Map<string, LessonProgress>): LessonItem[] => [
  {
    id: 'adhd-lesson-1',
    title: lang === 'ta' ? 'ஒரு வார்த்தை: வணக்கங்கள்' : 'One Word at a Time: Greetings',
    description: lang === 'ta' ? 'குறுகிய, கவனமான வாழ்த்து பயிற்சி' : 'Short, focused greeting practice',
    language: 'English',
    gradeLevel: 'Beginner',
    duration: 8,
    disabilityTypes: ['ADHD'],
    badge: '⚡ ADHD-Optimised',
    competencies: ['Speaking', 'Vocabulary'],
    learningObjectives: ['Say hello', 'Say good morning'],
    hasTranscripts: true,
    hasCaptions: true,
    progress: {
      status: progressMap.get('adhd-lesson-1')?.status || 'NOT_STARTED',
      score: progressMap.get('adhd-lesson-1')?.score || 0,
      attemptCount: 0,
      lastAccessedAt: progressMap.get('adhd-lesson-1')?.updatedAt?.toISOString() || null
    }
  },
  {
    id: 'dyslexia-lesson-1',
    title: lang === 'ta' ? 'வணக்கங்கள் — பார், சொல்' : 'Greetings — See It, Say It',
    description: lang === 'ta' ? 'ஒலி வழிகாட்டுதலுடன் வாழ்த்து பாடம்' : 'Phonetic-guided greeting lesson',
    language: 'English',
    gradeLevel: 'Beginner',
    duration: 20,
    disabilityTypes: ['DYSLEXIA'],
    badge: '📖 Dyslexia-Friendly',
    competencies: ['Reading', 'Vocabulary'],
    learningObjectives: ['Read greetings'],
    hasTranscripts: true,
    hasCaptions: true,
    progress: {
      status: progressMap.get('dyslexia-lesson-1')?.status || 'NOT_STARTED',
      score: progressMap.get('dyslexia-lesson-1')?.score || 0,
      attemptCount: 0,
      lastAccessedAt: progressMap.get('dyslexia-lesson-1')?.updatedAt?.toISOString() || null
    }
  },
  {
    id: 'demo-lesson-1',
    title: lang === 'ta' ? 'வணக்கங்களும் அறிமுகங்களும்' : 'Greetings & Introductions',
    description: lang === 'ta' ? 'அத்தியாவசிய ஆங்கில வாழ்த்துக்கள்' : 'Master essential English greetings',
    language: 'English',
    gradeLevel: 'Beginner',
    duration: 12,
    disabilityTypes: [],
    competencies: ['Speaking', 'Listening'],
    learningObjectives: ['Say hello', 'Introduce yourself'],
    hasTranscripts: true,
    hasCaptions: true,
    progress: {
      status: progressMap.get('demo-lesson-1')?.status || 'NOT_STARTED',
      score: progressMap.get('demo-lesson-1')?.score || 0,
      attemptCount: 0,
      lastAccessedAt: progressMap.get('demo-lesson-1')?.updatedAt?.toISOString() || null
    }
  }
];

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    interface JWTPayload {
      userId: string;
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const { userId } = decoded;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { learnerProfile: true }
    });

    if (!user || !user.learnerProfile) {
      return NextResponse.json({ error: 'Learner profile not found' }, { status: 404 });
    }

    const learnerId = user.learnerProfile.id;
    const learnerDisabilities: string[] = user.learnerProfile.disabilityTypes || [];

    const url = new URL(req.url);
    const lang = url.searchParams.get('lang') || 'en';

    // Fetch lessons from Prisma
    const dbLessons = await prisma.lesson.findMany({
      where: { isPublished: true },
    });

    // Fetch user progress
    const progressMap = new Map<string, LessonProgress>();
    const progressRecords = await prisma.lessonProgress.findMany({
      where: { learnerId }
    });
    progressRecords.forEach((p: any) => progressMap.set(p.lessonId, p as unknown as LessonProgress));

    // Map Prisma lessons to frontend structure
    const mappedLessons = dbLessons.map((lesson): LessonItem => {
      const progress = progressMap.get(lesson.id);
      
      return {
        id: lesson.id,
        title: getText(lesson.title, 'Untitled Lesson'),
        description: getText(lesson.description, ''),
        language: lesson.language || 'English',
        gradeLevel: lesson.gradeLevel || 'All',
        duration: lesson.duration || 15,
        disabilityTypes: lesson.disabilityTypes || [],
        competencies: lesson.niosCompetencies || [],
        learningObjectives: [],
        hasTranscripts: true,
        hasCaptions: true,
        progress: {
          status: progress?.status || 'NOT_STARTED',
          score: progress?.score || 0,
          attemptCount: 1,
          lastAccessedAt: progress?.updatedAt?.toISOString() || null
        }
      };
    });

    // Use MongoDB lessons if available, otherwise use built-in library
    const allLessons = mappedLessons.length > 0
      ? mappedLessons
      : ALL_MOCK_LESSONS(lang, progressMap);

    // Filter: show a lesson if it has no disabilityTypes (general)
    // OR if the learner has at least one matching disability
    const filteredLessons = allLessons.filter((lesson: LessonItem) => {
      const tags: string[] = lesson.disabilityTypes || [];
      if (tags.length === 0) return true; // general lesson — always show
      if (learnerDisabilities.length === 0) return false; // learner has no disabilities — hide specific lessons
      return tags.some((t: string) => learnerDisabilities.includes(t));
    });

    return NextResponse.json({
      lessons: filteredLessons,
      learnerDisabilities // expose so frontend can show disability badge section
    });

  } catch (error) {
    console.error('Lessons list fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

