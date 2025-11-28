# MongoDB Implementation Guide

## 🎯 Why This Approach is Better

### **Previous Approach (JSON Files):**
- ❌ Manual JSON file management
- ❌ No data validation
- ❌ No indexes for performance
- ❌ Redundant data transformation
- ❌ Limited query capabilities

### **New Approach (Native MongoDB):**
- ✅ TypeScript data sources directly
- ✅ Schema validation at database level
- ✅ Automatic indexes for performance
- ✅ Type-safe operations
- ✅ Advanced querying (text search, aggregations)
- ✅ Real-time statistics updates

## 📁 Project Structure

```
Amana-Bookstore/
├── src/
│   ├── lib/
│   │   ├── mongodb.ts          # MongoDB connection
│   │   ├── db-schema.ts        # Schema validation & indexes
│   │   └── db-operations.ts    # CRUD operations (improved)
│   └── app/
│       └── data/
│           ├── books.ts        # TypeScript book data
│           ├── reviews.ts      # TypeScript review data
│           └── cart.ts         # TypeScript cart data
├── scripts/
│   ├── seed.ts                 # New seeder (TypeScript data)
│   ├── test-connection.ts      # Connection tester
│   └── import-data.ts          # Old JSON importer (deprecated)
└── mongodb-data/               # JSON files (no longer needed)
```

## 🚀 Quick Start

### **1. Seed Database (Recommended)**

Use TypeScript data directly - no JSON files needed:

```bash
# Seed database with validation and indexes
npm run db:seed

# Reset database and seed from scratch
npm run db:seed:reset

# Reset, seed, and add sample cart items for testing
npm run db:seed:samples
```

### **2. Test Connection**

```bash
npm run db:test
```

### **3. Start Application**

```bash
npm run dev
```

## 🎨 Key Features

### **1. Schema Validation**

MongoDB validates data at insertion:

```typescript
// Books must have valid ISBNs, positive prices, ratings 0-5
{
  isbn: { pattern: '^978-[0-9]{10}$' },
  price: { minimum: 0 },
  rating: { minimum: 0, maximum: 5 }
}
```

### **2. Performance Indexes**

Automatic indexes for fast queries:

- **Text search** on title, author, description, tags
- **Featured books** index
- **Genre filtering** index
- **Rating sorting** index
- **Date sorting** index
- **Stock availability** index

### **3. Improved Operations**

#### **Search with Text Index**
```typescript
// Intelligent search with relevance scoring
const books = await searchBooks('quantum physics');
```

#### **Advanced Filtering**
```typescript
// Get top-rated books
const topBooks = await getTopRatedBooks(10);

// Get books in stock only
const available = await getBooksInStock();

// Get books by genre with sorting
const scienceBooks = await getBooksByGenre('Physics', 20);
```

#### **Pagination Support**
```typescript
// Get books with pagination
const books = await getAllBooks({
  limit: 20,
  skip: 40,  // Page 3
  sortBy: 'rating',
  sortOrder: 'desc'
});
```

#### **Smart Cart Operations**
```typescript
// Automatically merges quantities if book already in cart
await addToCart({ bookId: '1', quantity: 2 });

// Get cart total with calculated subtotal
const { items, subtotal } = await getCartTotal();
```

#### **Review Statistics**
```typescript
// Creating a review automatically updates book's avg rating
await createReview({
  bookId: '1',
  author: 'John Doe',
  rating: 5,
  title: 'Great book!',
  comment: 'Loved it',
  verified: true
});
// Book rating and reviewCount updated automatically
```

## 📊 Database Operations

### **Books**

```typescript
import {
  getAllBooks,
  getBookById,
  getFeaturedBooks,
  getBooksByGenre,
  searchBooks,
  getTopRatedBooks,
  getBooksInStock
} from '@/lib/db-operations';

// Get all books with options
const books = await getAllBooks({
  limit: 50,
  skip: 0,
  sortBy: 'rating',
  sortOrder: 'desc'
});

// Search books (uses text index for performance)
const results = await searchBooks('machine learning', 20);

// Get featured books
const featured = await getFeaturedBooks(10);

// Get top-rated books
const topRated = await getTopRatedBooks(10);
```

### **Reviews**

```typescript
import {
  getReviewsByBookId,
  getAllReviews,
  createReview
} from '@/lib/db-operations';

// Get reviews with sorting
const reviews = await getReviewsByBookId('1', {
  limit: 50,
  sortBy: 'rating',
  sortOrder: 'desc'
});

// Create review (auto-updates book stats)
const newReview = await createReview({
  bookId: '1',
  author: 'Jane Smith',
  rating: 5,
  title: 'Excellent!',
  comment: 'Must read',
  timestamp: new Date().toISOString(),
  verified: true
});
```

### **Cart**

```typescript
import {
  getCartItems,
  getCartItemByBookId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartTotal
} from '@/lib/db-operations';

// Add to cart (merges if exists)
await addToCart({ bookId: '1', quantity: 2 });

// Update quantity
await updateCartItem('cart-id', 5);

// Get cart summary
const { items, subtotal } = await getCartTotal();
```

## 🔧 Advanced Usage

### **Initialize Database Schema**

```typescript
import { initializeDatabase } from '@/lib/db-schema';

// Set up collections with validation and indexes
await initializeDatabase();
```

### **Custom Queries**

```typescript
import { getDatabase } from '@/lib/mongodb';

const db = await getDatabase();

// Complex aggregation
const stats = await db.collection('books').aggregate([
  { $match: { inStock: true } },
  { $group: {
      _id: '$genre',
      avgPrice: { $avg: '$price' },
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
]).toArray();
```

## 📝 Database Commands

```bash
# Test database connection
npm run db:test

# Seed database (keeps existing data, updates schema)
npm run db:seed

# Reset and seed (clears all data, fresh start)
npm run db:seed:reset

# Reset, seed, and add sample cart items
npm run db:seed:samples

# Legacy JSON import (not recommended)
npm run import-data
```

## 🎯 Best Practices

### **1. Always Use TypeScript Operations**

```typescript
// ✅ Good - Type-safe, validated
import { getBookById } from '@/lib/db-operations';
const book = await getBookById('1');

// ❌ Avoid - No type safety
const db = await getDatabase();
const book = await db.collection('books').findOne({ _id: '1' });
```

### **2. Handle Errors Gracefully**

```typescript
try {
  const books = await getAllBooks();
  return NextResponse.json(books);
} catch (error) {
  console.error('Error fetching books:', error);
  return NextResponse.json(
    { error: 'Failed to fetch books' },
    { status: 500 }
  );
}
```

### **3. Use Appropriate Limits**

```typescript
// ✅ Good - Limit results for performance
const books = await getAllBooks({ limit: 50 });

// ❌ Avoid - Could return thousands of documents
const books = await getAllBooks({ limit: 999999 });
```

### **4. Leverage Indexes**

```typescript
// ✅ Good - Uses text index
const results = await searchBooks('quantum');

// ✅ Good - Uses genre index
const physics = await getBooksByGenre('Physics');

// ❌ Avoid - No index, slow
const db = await getDatabase();
const books = await db.collection('books')
  .find({ publisher: { $regex: /Press/i } })
  .toArray();
```

## 🔍 Monitoring

### **View Data in MongoDB Atlas**

1. Go to https://cloud.mongodb.com/
2. Select your cluster
3. Click "Browse Collections"
4. View books, reviews, cart collections

### **Check Indexes**

```typescript
const db = await getDatabase();
const indexes = await db.collection('books').indexes();
console.log(indexes);
```

## 🚨 Troubleshooting

### **Schema Validation Errors**

If you see validation errors:
```bash
# Reset database and re-seed
npm run db:seed:reset
```

### **Performance Issues**

```bash
# Check if indexes exist
npm run db:test

# Re-initialize schema and indexes
npm run db:seed
```

### **Connection Issues**

```bash
# Test connection
npm run db:test

# Check .env.local has correct MONGODB_URI
```

## 📚 Next Steps

1. **Add Aggregations**: Create analytics endpoints
2. **Implement Caching**: Add Redis for frequently accessed data
3. **Add Transactions**: For complex multi-document operations
4. **Real-time Updates**: Use Change Streams for live data
5. **Backup Strategy**: Set up automated backups in Atlas

## 🎉 Benefits Summary

- **No JSON files needed** - Direct TypeScript to MongoDB
- **Type-safe operations** - Full TypeScript support
- **Validated data** - Schema validation at DB level
- **Fast queries** - Automatic indexes
- **Better DX** - Simple, intuitive API
- **Production-ready** - Error handling, logging, optimization
