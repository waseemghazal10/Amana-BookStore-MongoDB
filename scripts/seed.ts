import { config } from 'dotenv';
import { resolve } from 'path';
import { getDatabase } from '../src/lib/mongodb';
import { initializeDatabase, dropAllCollections } from '../src/lib/db-schema';
import { books } from '../src/app/data/books';
import { reviews } from '../src/app/data/reviews';
import { initialCart } from '../src/app/data/cart';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

interface SeedOptions {
  reset?: boolean;
  verbose?: boolean;
}

/**
 * Seed the database with initial data
 */
async function seedDatabase(options: SeedOptions = {}) {
  const { reset = false, verbose = true } = options;

  try {
    if (verbose) {
      console.log('🌱 Starting database seeding...\n');
    }

    const db = await getDatabase();

    // Reset database if requested
    if (reset) {
      if (verbose) console.log('🗑️  Resetting database...');
      await dropAllCollections();
      if (verbose) console.log('✓ Database reset complete\n');
    }

    // Initialize collections with schema validation and indexes
    if (verbose) console.log('⚙️  Initializing database schema...');
    await initializeDatabase();
    if (verbose) console.log('✓ Schema initialization complete\n');

    // Transform data for MongoDB (id -> _id)
    const booksData = books.map(book => ({
      ...book,
      _id: book.id
    }));

    const reviewsData = reviews.map(review => ({
      ...review,
      _id: review.id
    }));

    const cartData = initialCart.map(item => ({
      ...item,
      _id: item.id
    }));

    // Seed books
    if (verbose) console.log(`📚 Seeding books collection...`);
    if (booksData.length > 0) {
      await db.collection('books').deleteMany({});
      await db.collection('books').insertMany(booksData);
      if (verbose) console.log(`✓ Inserted ${booksData.length} books`);
    }

    // Seed reviews
    if (verbose) console.log(`⭐ Seeding reviews collection...`);
    if (reviewsData.length > 0) {
      await db.collection('reviews').deleteMany({});
      await db.collection('reviews').insertMany(reviewsData);
      if (verbose) console.log(`✓ Inserted ${reviewsData.length} reviews`);
    }

    // Seed cart (usually empty)
    if (verbose) console.log(`🛒 Seeding cart collection...`);
    await db.collection('cart').deleteMany({});
    if (cartData.length > 0) {
      await db.collection('cart').insertMany(cartData);
      if (verbose) console.log(`✓ Inserted ${cartData.length} cart items`);
    } else {
      if (verbose) console.log(`✓ Cart initialized (empty)`);
    }

    // Display summary
    if (verbose) {
      console.log('\n📊 Seeding Summary:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Database: amana-bookstore`);
      console.log(`Books: ${booksData.length} documents`);
      console.log(`Reviews: ${reviewsData.length} documents`);
      console.log(`Cart: ${cartData.length} documents`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ Database seeding completed successfully!');
    }

    return {
      success: true,
      counts: {
        books: booksData.length,
        reviews: reviewsData.length,
        cart: cartData.length
      }
    };

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

/**
 * Add sample data to existing collections (useful for testing)
 */
export async function addSampleData() {
  const db = await getDatabase();

  // Add some sample cart items for testing
  const sampleCartItems = [
    {
      _id: 'cart-sample-1',
      bookId: '1',
      quantity: 2,
      addedAt: new Date().toISOString()
    },
    {
      _id: 'cart-sample-2',
      bookId: '13',
      quantity: 1,
      addedAt: new Date().toISOString()
    }
  ];

  await db.collection('cart').insertMany(sampleCartItems);
  console.log('✓ Added sample cart items');
}

// Run seeder if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const reset = args.includes('--reset') || args.includes('-r');
  const addSamples = args.includes('--samples') || args.includes('-s');

  seedDatabase({ reset, verbose: true })
    .then(async (result) => {
      if (addSamples) {
        console.log('\n📦 Adding sample data...');
        await addSampleData();
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase;
