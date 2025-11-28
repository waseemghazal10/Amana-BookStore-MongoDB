// src/app/api/books/route.ts
import { NextResponse } from 'next/server';
import { getAllBooks, searchBooks } from '@/lib/db-operations';

// GET /api/books - Return all books or search results
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');

    let books;
    if (searchQuery) {
      books = await searchBooks(searchQuery);
    } else {
      books = await getAllBooks();
    }

    return NextResponse.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch books';
    return NextResponse.json(
      { error: 'Failed to fetch books', details: errorMessage },
      { status: 500 }
    );
  }
}

// Future implementation notes:
// - Connect to a database (e.g., PostgreSQL, MongoDB)
// - Add authentication middleware for admin operations
// - Implement pagination for large datasets
// - Add filtering and search query parameters
// - Include proper error handling and logging
// - Add rate limiting for API protection
// - Implement caching strategies for better performance

// Example future database integration:
// import { db } from '@/lib/database';
// 
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const page = parseInt(searchParams.get('page') || '1');
//   const limit = parseInt(searchParams.get('limit') || '10');
//   const genre = searchParams.get('genre');
//   
//   try {
//     const books = await db.books.findMany({
//       where: genre ? { genre: { contains: genre } } : {},
//       skip: (page - 1) * limit,
//       take: limit,
//     });
//     
//     return NextResponse.json(books);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Database connection failed' },
//       { status: 500 }
//     );
//   }
// }