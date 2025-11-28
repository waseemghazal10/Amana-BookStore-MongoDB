// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import BookGrid from './components/BookGrid';
import { fetchBooks, addToCart } from '@/lib/api-client';
import { Book } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from API on component mount
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const fetchedBooks = await fetchBooks();
        setBooks(fetchedBooks);
      } catch (err) {
        console.error('Failed to load books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Cart handler that calls the API
  const handleAddToCart = async (bookId: string) => {
    try {
      await addToCart(bookId, 1);
      console.log(`Added book ${bookId} to cart`);
      // You could show a success notification here
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // You could show an error notification here
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="text-center bg-blue-100 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to the Amana Bookstore!</h1>
        <p className="text-lg text-gray-600">
          Your one-stop shop for the best books. Discover new worlds and adventures.
        </p>
      </section>

      {/* Book Grid */}
      <BookGrid books={books} onAddToCart={handleAddToCart} />
    </div>
  );
}
