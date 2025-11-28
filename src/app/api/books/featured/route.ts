// API route to get featured books
import { NextResponse } from 'next/server';
import { getFeaturedBooks } from '@/lib/db-operations';

export async function GET() {
  try {
    const books = await getFeaturedBooks();

    return NextResponse.json({
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured books' },
      { status: 500 }
    );
  }
}
