// API route to get all reviews with optional filtering
import { NextResponse } from 'next/server';
import { getAllReviews } from '@/lib/db-operations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    let reviews;
    if (bookId) {
      // Import the specific function if needed
      const { getReviewsByBookId } = await import('@/lib/db-operations');
      reviews = await getReviewsByBookId(bookId);
    } else {
      reviews = await getAllReviews();
    }

    return NextResponse.json({
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
