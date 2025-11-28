// src/lib/api-client.ts
import { Book, Review, CartItem } from '@/app/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  return response.json();
}

// Books API
export async function fetchBooks(searchQuery?: string): Promise<Book[]> {
  const url = searchQuery 
    ? `${API_BASE_URL}/api/books?search=${encodeURIComponent(searchQuery)}`
    : `${API_BASE_URL}/api/books`;
  
  const response = await fetch(url);
  return handleResponse<Book[]>(response);
}

export async function fetchBookById(id: string): Promise<Book & { reviews: Review[] }> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`);
  return handleResponse<Book & { reviews: Review[] }>(response);
}

export async function fetchFeaturedBooks(): Promise<{ count: number; books: Book[] }> {
  const response = await fetch(`${API_BASE_URL}/api/books/featured`);
  return handleResponse<{ count: number; books: Book[] }>(response);
}

export async function fetchBooksByGenre(genre: string): Promise<{ count: number; books: Book[] }> {
  const response = await fetch(`${API_BASE_URL}/api/books/genre?genre=${encodeURIComponent(genre)}`);
  return handleResponse<{ count: number; books: Book[] }>(response);
}

export async function fetchTopRatedBooks(limit: number = 10): Promise<{ count: number; books: Book[] }> {
  const response = await fetch(`${API_BASE_URL}/api/books/top-rated?limit=${limit}`);
  return handleResponse<{ count: number; books: Book[] }>(response);
}

// Reviews API
export async function fetchReviews(bookId?: string): Promise<Review[]> {
  const url = bookId 
    ? `${API_BASE_URL}/api/reviews?bookId=${bookId}`
    : `${API_BASE_URL}/api/reviews`;
  
  const response = await fetch(url);
  return handleResponse<Review[]>(response);
}

export async function fetchReviewsByBookId(bookId: string): Promise<Review[]> {
  const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/reviews`);
  return handleResponse<Review[]>(response);
}

export async function createReview(bookId: string, review: {
  author: string;
  rating: number;
  title: string;
  comment: string;
}): Promise<Review> {
  const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });
  return handleResponse<Review>(response);
}

// Cart API
export async function fetchCartItems(): Promise<CartItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/cart`);
  return handleResponse<CartItem[]>(response);
}

export async function addToCart(bookId: string, quantity: number = 1): Promise<CartItem> {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookId, quantity }),
  });
  return handleResponse<CartItem>(response);
}

export async function updateCartItem(id: string, quantity: number): Promise<CartItem> {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, quantity }),
  });
  return handleResponse<CartItem>(response);
}

export async function removeFromCart(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  return handleResponse<{ success: boolean; message: string }>(response);
}

export async function clearCart(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clearAll: true }),
  });
  return handleResponse<{ success: boolean; message: string }>(response);
}

// Stats API
export async function fetchStats(): Promise<{
  totalBooks: number;
  totalReviews: number;
  cartItems: number;
  featuredBooks: number;
  inStockBooks: number;
  averageRating: number;
  genres: Array<{ _id: string; count: number }>;
}> {
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  return handleResponse(response);
}
