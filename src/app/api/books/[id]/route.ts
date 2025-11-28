// API route to get a specific book by ID and its reviews
import { NextResponse } from 'next/server';
import { getBookById, getReviewsByBookId } from '@/lib/db-operations';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;

    // Fetch book from database
    const book = await getBookById(bookId);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Fetch reviews for this book
    const reviews = await getReviewsByBookId(bookId);

    return NextResponse.json({
      ...book,
      reviews
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}
