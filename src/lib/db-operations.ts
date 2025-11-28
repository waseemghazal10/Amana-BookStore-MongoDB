import { getDatabase } from './mongodb';
import { Book, Review, CartItem } from '@/app/types';
import { ObjectId } from 'mongodb';

// Type guard for MongoDB documents
type MongoDocument<T> = Omit<T, 'id'> & { _id: string };

// Helper to transform MongoDB documents to app types
function transformBook(doc: any): Book {
  return {
    ...doc,
    id: doc._id,
    _id: undefined
  };
}

function transformReview(doc: any): Review {
  return {
    ...doc,
    id: doc._id,
    _id: undefined
  };
}

function transformCartItem(doc: any): CartItem {
  return {
    ...doc,
    id: doc._id,
    _id: undefined
  };
}

// Books operations
export async function getAllBooks(options: { 
  limit?: number; 
  skip?: number;
  sortBy?: 'title' | 'price' | 'rating' | 'datePublished';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<Book[]> {
  try {
    const db = await getDatabase();
    const { limit = 100, skip = 0, sortBy = 'title', sortOrder = 'asc' } = options;
    
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    const books = await db.collection('books')
      .find({})
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .toArray();
    
    return books.map(transformBook);
  } catch (error) {
    console.error('Error fetching books:', error);
    throw new Error('Failed to fetch books from database');
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const db = await getDatabase();
    const book = await db.collection('books').findOne({ _id: id });
    return book ? transformBook(book) : null;
  } catch (error) {
    console.error(`Error fetching book ${id}:`, error);
    throw new Error('Failed to fetch book from database');
  }
}

export async function getFeaturedBooks(limit: number = 10): Promise<Book[]> {
  try {
    const db = await getDatabase();
    const books = await db.collection('books')
      .find({ featured: true })
      .sort({ rating: -1 })
      .limit(limit)
      .toArray();
    return books.map(transformBook);
  } catch (error) {
    console.error('Error fetching featured books:', error);
    throw new Error('Failed to fetch featured books from database');
  }
}

export async function getBooksByGenre(genre: string, limit: number = 50): Promise<Book[]> {
  try {
    const db = await getDatabase();
    const books = await db.collection('books')
      .find({ genre: genre })
      .sort({ rating: -1 })
      .limit(limit)
      .toArray();
    return books.map(transformBook);
  } catch (error) {
    console.error(`Error fetching books by genre ${genre}:`, error);
    throw new Error('Failed to fetch books by genre from database');
  }
}

export async function searchBooks(query: string, limit: number = 50): Promise<Book[]> {
  try {
    const db = await getDatabase();
    
    // Use text search if available (more efficient)
    const books = await db.collection('books')
      .find({ 
        $text: { $search: query }
      })
      .project({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .toArray();
    
    return books.map(transformBook);
  } catch (error) {
    // Fallback to regex search if text index isn't available
    console.warn('Text search failed, falling back to regex search');
    try {
      const db = await getDatabase();
      const books = await db.collection('books')
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { author: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
          ]
        })
        .limit(limit)
        .toArray();
      return books.map(transformBook);
    } catch (fallbackError) {
      console.error('Error searching books:', fallbackError);
      throw new Error('Failed to search books in database');
    }
  }
}

export async function getTopRatedBooks(limit: number = 10): Promise<Book[]> {
  try {
    const db = await getDatabase();
    const books = await db.collection('books')
      .find({ reviewCount: { $gt: 0 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .toArray();
    return books.map(transformBook);
  } catch (error) {
    console.error('Error fetching top-rated books:', error);
    throw new Error('Failed to fetch top-rated books from database');
  }
}

export async function getBooksInStock(limit: number = 100): Promise<Book[]> {
  try {
    const db = await getDatabase();
    const books = await db.collection('books')
      .find({ inStock: true })
      .sort({ title: 1 })
      .limit(limit)
      .toArray();
    return books.map(transformBook);
  } catch (error) {
    console.error('Error fetching in-stock books:', error);
    throw new Error('Failed to fetch in-stock books from database');
  }
}

// Reviews operations
export async function getReviewsByBookId(bookId: string, options: {
  limit?: number;
  sortBy?: 'rating' | 'timestamp';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<Review[]> {
  try {
    const db = await getDatabase();
    const { limit = 50, sortBy = 'timestamp', sortOrder = 'desc' } = options;
    
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    const reviews = await db.collection('reviews')
      .find({ bookId })
      .sort(sort)
      .limit(limit)
      .toArray();
    
    return reviews.map(transformReview);
  } catch (error) {
    console.error(`Error fetching reviews for book ${bookId}:`, error);
    throw new Error('Failed to fetch reviews from database');
  }
}

export async function getAllReviews(limit: number = 100): Promise<Review[]> {
  try {
    const db = await getDatabase();
    const reviews = await db.collection('reviews')
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    return reviews.map(transformReview);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw new Error('Failed to fetch reviews from database');
  }
}

export async function createReview(review: Omit<Review, 'id'>): Promise<Review> {
  try {
    const db = await getDatabase();
    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reviewDoc = {
      ...review,
      _id: reviewId,
      timestamp: review.timestamp || new Date().toISOString(),
      verified: review.verified ?? false
    };
    
    await db.collection('reviews').insertOne(reviewDoc);
    
    // Update book's review count and average rating
    await updateBookReviewStats(review.bookId);
    
    return transformReview(reviewDoc);
  } catch (error) {
    console.error('Error creating review:', error);
    throw new Error('Failed to create review in database');
  }
}

async function updateBookReviewStats(bookId: string): Promise<void> {
  try {
    const db = await getDatabase();
    const reviews = await db.collection('reviews').find({ bookId }).toArray();
    
    const reviewCount = reviews.length;
    const averageRating = reviews.reduce((sum, r: any) => sum + r.rating, 0) / reviewCount;
    
    await db.collection('books').updateOne(
      { _id: bookId },
      { 
        $set: { 
          reviewCount,
          rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
        }
      }
    );
  } catch (error) {
    console.error(`Error updating book stats for ${bookId}:`, error);
  }
}

// Cart operations
export async function getCartItems(): Promise<CartItem[]> {
  try {
    const db = await getDatabase();
    const items = await db.collection('cart')
      .find({})
      .sort({ addedAt: -1 })
      .toArray();
    return items.map(transformCartItem);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw new Error('Failed to fetch cart items from database');
  }
}

export async function getCartItemByBookId(bookId: string): Promise<CartItem | null> {
  try {
    const db = await getDatabase();
    const item = await db.collection('cart').findOne({ bookId });
    return item ? transformCartItem(item) : null;
  } catch (error) {
    console.error(`Error fetching cart item for book ${bookId}:`, error);
    throw new Error('Failed to fetch cart item from database');
  }
}

export async function addToCart(item: Omit<CartItem, 'id'>): Promise<CartItem> {
  try {
    const db = await getDatabase();
    
    // Check if item already exists
    const existing = await db.collection('cart').findOne({ bookId: item.bookId });
    
    if (existing) {
      // Update quantity if item exists
      const newQuantity = (existing.quantity || 0) + item.quantity;
      await db.collection('cart').updateOne(
        { bookId: item.bookId },
        { $set: { quantity: newQuantity, addedAt: new Date().toISOString() } }
      );
      return transformCartItem({ ...existing, quantity: newQuantity });
    }
    
    // Insert new item
    const cartId = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const cartDoc = {
      ...item,
      _id: cartId,
      addedAt: item.addedAt || new Date().toISOString()
    };
    
    await db.collection('cart').insertOne(cartDoc);
    return transformCartItem(cartDoc);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw new Error('Failed to add item to cart in database');
  }
}

export async function updateCartItem(id: string, quantity: number): Promise<void> {
  try {
    const db = await getDatabase();
    
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    
    const result = await db.collection('cart').updateOne(
      { _id: id },
      { $set: { quantity } }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Cart item not found');
    }
  } catch (error) {
    console.error(`Error updating cart item ${id}:`, error);
    throw new Error('Failed to update cart item in database');
  }
}

export async function removeFromCart(id: string): Promise<void> {
  try {
    const db = await getDatabase();
    const result = await db.collection('cart').deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      throw new Error('Cart item not found');
    }
  } catch (error) {
    console.error(`Error removing cart item ${id}:`, error);
    throw new Error('Failed to remove cart item from database');
  }
}

export async function clearCart(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.collection('cart').deleteMany({});
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart in database');
  }
}

export async function getCartTotal(): Promise<{ items: number; subtotal: number }> {
  try {
    const db = await getDatabase();
    const cartItems = await getCartItems();
    
    let subtotal = 0;
    for (const item of cartItems) {
      const book = await getBookById(item.bookId);
      if (book) {
        subtotal += book.price * item.quantity;
      }
    }
    
    return {
      items: cartItems.length,
      subtotal: Math.round(subtotal * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating cart total:', error);
    throw new Error('Failed to calculate cart total');
  }
}
