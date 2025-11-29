// Health check endpoint to diagnose connection issues
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
    connectionTest: 'pending'
  };

  // Try to connect to database
  try {
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    
    diagnostics.connectionTest = 'success';
    diagnostics.database = 'amana-bookstore';
    diagnostics.collections = collections.map(c => c.name);
    
    // Try to count books
    const booksCount = await db.collection('books').countDocuments();
    const reviewsCount = await db.collection('reviews').countDocuments();
    
    diagnostics.bookCount = booksCount;
    diagnostics.reviewCount = reviewsCount;
    
  } catch (error) {
    diagnostics.connectionTest = 'failed';
    diagnostics.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
