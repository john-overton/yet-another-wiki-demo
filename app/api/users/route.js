import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate offset
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { role: { contains: search } },
      ],
    } : {};

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination and search
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        auth_type: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit,
    });

    return Response.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
