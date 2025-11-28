import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'amana-bookstore';

async function importData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Read JSON files
    const booksData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'mongodb-data', 'books.json'), 'utf-8')
    );
    const reviewsData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'mongodb-data', 'reviews.json'), 'utf-8')
    );
    const cartData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'mongodb-data', 'cart.json'), 'utf-8')
    );

    // Clear existing collections
    console.log('Clearing existing collections...');
    await db.collection('books').deleteMany({});
    await db.collection('reviews').deleteMany({});
    await db.collection('cart').deleteMany({});

    // Import books
    if (booksData.length > 0) {
      console.log(`Importing ${booksData.length} books...`);
      await db.collection('books').insertMany(booksData);
      console.log('✓ Books imported successfully');
    }

    // Import reviews
    if (reviewsData.length > 0) {
      console.log(`Importing ${reviewsData.length} reviews...`);
      await db.collection('reviews').insertMany(reviewsData);
      console.log('✓ Reviews imported successfully');
    }

    // Import cart (if any)
    if (cartData.length > 0) {
      console.log(`Importing ${cartData.length} cart items...`);
      await db.collection('cart').insertMany(cartData);
      console.log('✓ Cart items imported successfully');
    }

    // Create indexes for better performance
    console.log('Creating indexes...');
    await db.collection('books').createIndex({ title: 'text', author: 'text', description: 'text' });
    await db.collection('books').createIndex({ featured: 1 });
    await db.collection('books').createIndex({ genre: 1 });
    await db.collection('reviews').createIndex({ bookId: 1 });
    console.log('✓ Indexes created successfully');

    console.log('\n✅ Data import completed successfully!');
    console.log(`\nDatabase: ${DB_NAME}`);
    console.log(`Books: ${booksData.length}`);
    console.log(`Reviews: ${reviewsData.length}`);
    console.log(`Cart items: ${cartData.length}`);

  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the import
importData();
