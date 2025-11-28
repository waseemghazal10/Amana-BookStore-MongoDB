import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in environment variables');
    console.log('\n💡 Please add MONGODB_URI to your .env.local file');
    process.exit(1);
  }

  console.log('📍 Connection URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('\n⏳ Connecting to MongoDB...');
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!\n');

    // Test database access
    const db = client.db('amana-bookstore');
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database: amana-bookstore');
    console.log(`📚 Collections found: ${collections.length}\n`);
    
    if (collections.length > 0) {
      console.log('Available collections:');
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
      }
    } else {
      console.log('ℹ️  No collections found. Run "npm run import-data" to import your data.');
    }

    console.log('\n✅ Connection test successful!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check your MONGODB_URI in .env.local');
    console.log('  2. Verify your database user credentials');
    console.log('  3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('  4. Check if your cluster is active');
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
