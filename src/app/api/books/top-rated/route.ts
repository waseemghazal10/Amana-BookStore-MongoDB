// API route to get top-rated books
import { NextResponse } from 'next/server';
import { getTopRatedBooks } from '@/lib/db-operations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const books = await getTopRatedBooks(limit);

    return NextResponse.json({
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error fetching top-rated books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top-rated books' },
      { status: 500 }
    );
  }
}
