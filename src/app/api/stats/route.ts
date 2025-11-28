// API route to get database statistics
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Get collection stats
    const booksCount = await db.collection('books').countDocuments();
    const reviewsCount = await db.collection('reviews').countDocuments();
    const cartCount = await db.collection('cart').countDocuments();

    // Get featured books count
    const featuredCount = await db.collection('books').countDocuments({ featured: true });

    // Get in-stock books count
    const inStockCount = await db.collection('books').countDocuments({ inStock: true });

    // Get average rating
    const ratingAgg = await db.collection('books').aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]).toArray();

    const avgRating = ratingAgg[0]?.avgRating || 0;

    // Get genre distribution
    const genreAgg = await db.collection('books').aggregate([
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const genres = genreAgg.map(g => ({ genre: g._id, count: g.count }));

    return NextResponse.json({
      stats: {
        totalBooks: booksCount,
        totalReviews: reviewsCount,
        cartItems: cartCount,
        featuredBooks: featuredCount,
        inStockBooks: inStockCount,
        averageRating: parseFloat(avgRating.toFixed(2)),
        genres
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database statistics' },
      { status: 500 }
    );
  }
}
