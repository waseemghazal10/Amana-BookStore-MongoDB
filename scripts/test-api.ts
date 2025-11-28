import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<TestResult> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const options: any = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      endpoint,
      method,
      status: response.ok ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data
    };
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: 'FAIL',
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Amana Bookstore API Endpoints\n');
  console.log('=' .repeat(60));
  
  // Test 1: Get all books
  console.log('\n📚 Testing Books Endpoints...');
  results.push(await testEndpoint('/books'));
  
  // Test 2: Search books
  results.push(await testEndpoint('/books?search=quantum'));
  
  // Test 3: Get featured books
  results.push(await testEndpoint('/books/featured'));
  
  // Test 4: Get books by genre
  results.push(await testEndpoint('/books/genre?genre=Physics'));
  
  // Test 5: Get top-rated books
  results.push(await testEndpoint('/books/top-rated?limit=5'));
  
  // Test 6: Get specific book
  results.push(await testEndpoint('/books/1'));
  
  // Test 7: Get reviews for a book
  console.log('\n⭐ Testing Review Endpoints...');
  results.push(await testEndpoint('/books/1/reviews'));
  
  // Test 8: Get all reviews
  results.push(await testEndpoint('/reviews'));
  
  // Test 9: Create a review
  results.push(await testEndpoint('/books/1/reviews', 'POST', {
    author: 'Test User',
    rating: 5,
    title: 'API Test Review',
    comment: 'This is a test review created by the API test script.'
  }));
  
  // Test 10: Get cart items
  console.log('\n🛒 Testing Cart Endpoints...');
  results.push(await testEndpoint('/cart'));
  
  // Test 11: Add to cart
  results.push(await testEndpoint('/cart', 'POST', {
    bookId: '1',
    quantity: 2
  }));
  
  // Test 12: Get cart after adding
  results.push(await testEndpoint('/cart'));
  
  // Test 13: Get database stats
  console.log('\n📊 Testing Stats Endpoint...');
  results.push(await testEndpoint('/stats'));
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Test Results Summary\n');
  
  let passCount = 0;
  let failCount = 0;
  
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.method} ${result.endpoint}`);
    
    if (result.status === 'PASS') {
      passCount++;
      console.log(`   Status: ${result.statusCode}`);
      
      // Show sample data for some endpoints
      if (result.endpoint === '/books' && Array.isArray(result.data)) {
        console.log(`   Books found: ${result.data.length}`);
      } else if (result.endpoint.includes('/featured') && result.data?.books) {
        console.log(`   Featured books: ${result.data.count}`);
      } else if (result.endpoint === '/stats') {
        console.log(`   Total books: ${result.data.stats.totalBooks}`);
        console.log(`   Total reviews: ${result.data.stats.totalReviews}`);
      }
    } else {
      failCount++;
      console.log(`   Error: ${result.error || result.data?.error}`);
      if (result.statusCode) {
        console.log(`   Status Code: ${result.statusCode}`);
      }
    }
    console.log('');
  });
  
  console.log('='.repeat(60));
  console.log(`\n📊 Final Results: ${passCount} passed, ${failCount} failed out of ${results.length} tests\n`);
  
  if (failCount === 0) {
    console.log('🎉 All tests passed! API is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n');
  }
  
  // Exit with error code if any tests failed
  process.exit(failCount > 0 ? 1 : 0);
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/stats`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

async function main() {
  console.log('🔍 Checking if server is running...\n');
  
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.error('❌ Error: Development server is not running!');
    console.log('\n💡 Please start the server first:');
    console.log('   npm run dev\n');
    console.log('   Then run this test script again:');
    console.log('   npm run test-api\n');
    process.exit(1);
  }
  
  console.log('✅ Server is running!\n');
  await runTests();
}

main();
