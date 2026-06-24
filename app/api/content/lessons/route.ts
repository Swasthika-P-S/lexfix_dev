import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EDUCATOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const lesson = await prisma.lesson.create({
      data: {
        title: typeof body.title === 'string' ? body.title : (body.title?.en || 'Untitled'),
        description: body.description || '',
        language: body.language || 'en',
        gradeLevel: body.level || 'beginner',
        creatorId: session.user.id!,
        isPublished: body.status === 'published',
        content: body.content || { introduction: { text: { en: '', ta: '' } }, sections: [] },
        teachingGuide: body.teachingGuide || { overview: { en: '', ta: '' }, learningObjectives: { en: [], ta: [] }, steps: [] },
        niosCompetencies: body.niosCompetencies || [],
        disabilityTypes: body.disabilityTypes || [],
        tags: body.tags || [],
        duration: body.estimatedDuration || 30,
        difficulty: body.difficulty || 5,
      },
    });

    return NextResponse.json({
      success: true,
      lessonId: lesson.id,
    });
  } catch (error) {
    console.error('Lesson creation error:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get('createdBy');

    interface LessonQuery {
      creatorId?: string;
      isPublished?: boolean;
    }
    let where: LessonQuery = {};
    if (session.user.role === 'EDUCATOR') {
      where.creatorId = session.user.id;
    } else if (createdBy) {
      where.creatorId = createdBy;
    } else {
      where.isPublished = true;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        gradeLevel: true,
        language: true,
        isPublished: true,
        createdAt: true,
      },
    });

    const mappedLessons = lessons.map(l => ({
      lessonId: l.id,
      title: l.title,
      level: l.gradeLevel,
      language: l.language,
      status: l.isPublished ? 'published' : 'draft',
      createdAt: l.createdAt,
    }));

    return NextResponse.json({ lessons: mappedLessons });
  } catch (error) {
    console.error('Lesson fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}
