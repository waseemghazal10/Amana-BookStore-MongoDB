// API route to get books by genre
import { NextResponse } from 'next/server';
import { getBooksByGenre } from '@/lib/db-operations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');

    if (!genre) {
      return NextResponse.json(
        { error: 'Genre parameter is required' },
        { status: 400 }
      );
    }

    const books = await getBooksByGenre(genre);

    return NextResponse.json({
      genre,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books by genre' },
      { status: 500 }
    );
  }
}
