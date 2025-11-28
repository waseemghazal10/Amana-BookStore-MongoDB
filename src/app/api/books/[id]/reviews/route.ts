// API route to get reviews for a specific book
import { NextResponse } from 'next/server';
import { getReviewsByBookId, createReview } from '@/lib/db-operations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
    const reviews = await getReviewsByBookId(bookId);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
    const body = await request.json();

    const { author, rating, title, comment } = body;

    // Validate required fields
    if (!author || !rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: author, rating, title, comment' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const newReview = await createReview({
      bookId,
      author,
      rating,
      title,
      comment,
      timestamp: new Date().toISOString(),
      verified: false
    });

    return NextResponse.json(
      { 
        message: 'Review created successfully',
        review: newReview 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
