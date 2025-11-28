import { Db, Collection } from 'mongodb';
import { getDatabase } from './mongodb';

// MongoDB Schema Definitions
export const collectionSchemas = {
  books: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'title', 'author', 'price', 'isbn'],
        properties: {
          _id: { bsonType: 'string' },
          title: { bsonType: 'string', minLength: 1 },
          author: { bsonType: 'string', minLength: 1 },
          description: { bsonType: 'string' },
          price: { bsonType: 'double', minimum: 0 },
          image: { bsonType: 'string' },
          isbn: { bsonType: 'string', pattern: '^978-[0-9]{10}$' },
          genre: { bsonType: 'array', items: { bsonType: 'string' } },
          tags: { bsonType: 'array', items: { bsonType: 'string' } },
          datePublished: { bsonType: 'string' },
          pages: { bsonType: 'int', minimum: 1 },
          language: { bsonType: 'string' },
          publisher: { bsonType: 'string' },
          rating: { bsonType: 'double', minimum: 0, maximum: 5 },
          reviewCount: { bsonType: 'int', minimum: 0 },
          inStock: { bsonType: 'bool' },
          featured: { bsonType: 'bool' }
        }
      }
    }
  },
  reviews: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'bookId', 'author', 'rating', 'title', 'comment', 'timestamp'],
        properties: {
          _id: { bsonType: 'string' },
          bookId: { bsonType: 'string' },
          author: { bsonType: 'string', minLength: 1 },
          rating: { bsonType: 'int', minimum: 1, maximum: 5 },
          title: { bsonType: 'string', minLength: 1 },
          comment: { bsonType: 'string', minLength: 1 },
          timestamp: { bsonType: 'string' },
          verified: { bsonType: 'bool' }
        }
      }
    }
  },
  cart: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'bookId', 'quantity', 'addedAt'],
        properties: {
          _id: { bsonType: 'string' },
          bookId: { bsonType: 'string' },
          quantity: { bsonType: 'int', minimum: 1 },
          addedAt: { bsonType: 'string' }
        }
      }
    }
  }
};

// Index definitions for each collection
export const collectionIndexes = {
  books: [
    { key: { title: 'text', author: 'text', description: 'text', tags: 'text' }, name: 'text_search' },
    { key: { featured: 1 }, name: 'featured_idx' },
    { key: { genre: 1 }, name: 'genre_idx' },
    { key: { rating: -1 }, name: 'rating_idx' },
    { key: { datePublished: -1 }, name: 'date_published_idx' },
    { key: { inStock: 1 }, name: 'in_stock_idx' }
  ],
  reviews: [
    { key: { bookId: 1 }, name: 'book_id_idx' },
    { key: { rating: -1 }, name: 'rating_idx' },
    { key: { timestamp: -1 }, name: 'timestamp_idx' },
    { key: { verified: 1 }, name: 'verified_idx' }
  ],
  cart: [
    { key: { bookId: 1 }, name: 'book_id_idx' },
    { key: { addedAt: -1 }, name: 'added_at_idx' }
  ]
};

/**
 * Initialize database with proper schema validation and indexes
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  // Get list of existing collections
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map(c => c.name);

  for (const [collectionName, schema] of Object.entries(collectionSchemas)) {
    if (existingNames.includes(collectionName)) {
      // Update existing collection validation
      await db.command({
        collMod: collectionName,
        validator: schema.validator
      });
      console.log(`✓ Updated validation for collection: ${collectionName}`);
    } else {
      // Create new collection with validation
      await db.createCollection(collectionName, schema);
      console.log(`✓ Created collection: ${collectionName}`);
    }

    // Create indexes
    const indexes = collectionIndexes[collectionName as keyof typeof collectionIndexes];
    if (indexes && indexes.length > 0) {
      await db.collection(collectionName).createIndexes(indexes);
      console.log(`✓ Created ${indexes.length} indexes for: ${collectionName}`);
    }
  }
}

/**
 * Get typed collection references
 */
export async function getCollections() {
  const db = await getDatabase();
  
  return {
    books: db.collection('books'),
    reviews: db.collection('reviews'),
    cart: db.collection('cart')
  };
}

/**
 * Drop all collections (use with caution!)
 */
export async function dropAllCollections(): Promise<void> {
  const db = await getDatabase();
  const collections = await db.listCollections().toArray();
  
  for (const collection of collections) {
    await db.collection(collection.name).drop();
    console.log(`✓ Dropped collection: ${collection.name}`);
  }
}
