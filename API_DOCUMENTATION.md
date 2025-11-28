# Amana Bookstore API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, no authentication is required. Future implementations should include JWT or session-based auth.

---

## Books Endpoints

### Get All Books
```http
GET /api/books
```

**Query Parameters:**
- `search` (string, optional) - Search books by title, author, description, tags, or genre
- `limit` (number, optional) - Limit number of results (default: 100)
- `skip` (number, optional) - Number of results to skip for pagination (default: 0)
- `sortBy` (string, optional) - Sort field: `title`, `price`, `rating`, `datePublished` (default: title)
- `sortOrder` (string, optional) - Sort order: `asc` or `desc` (default: asc)

**Example Requests:**
```bash
# Get all books
curl http://localhost:3000/api/books

# Search for quantum books
curl http://localhost:3000/api/books?search=quantum

# Get first 10 books sorted by rating (highest first)
curl "http://localhost:3000/api/books?limit=10&sortBy=rating&sortOrder=desc"

# Pagination example
curl "http://localhost:3000/api/books?limit=20&skip=40"
```

**Response:**
```json
[
  {
    "id": "1",
    "title": "Fundamentals of Classical Mechanics",
    "author": "Dr. Ahmad Al-Kindi",
    "description": "A comprehensive introduction to classical mechanics...",
    "price": 89.99,
    "isbn": "978-0123456789",
    "genre": ["Physics", "Textbook"],
    "tags": ["Mechanics", "Physics", "University"],
    "datePublished": "2022-01-15",
    "pages": 654,
    "language": "English",
    "publisher": "Al-Biruni Academic Press",
    "rating": 4.8,
    "reviewCount": 23,
    "inStock": true,
    "featured": true,
    "image": "/images/book1.jpg"
  }
]
```

---

### Get Book by ID
```http
GET /api/books/{id}
```

**Path Parameters:**
- `id` (string, required) - Book ID

**Example Request:**
```bash
curl http://localhost:3000/api/books/1
```

**Response:**
```json
{
  "id": "1",
  "title": "Fundamentals of Classical Mechanics",
  "author": "Dr. Ahmad Al-Kindi",
  "reviews": [
    {
      "id": "review-1",
      "bookId": "1",
      "author": "Dr. Yasmin Al-Baghdadi",
      "rating": 5,
      "title": "Excellent foundation for physics students",
      "comment": "Dr. Al-Kindi has created a comprehensive introduction...",
      "timestamp": "2024-01-15T10:30:00Z",
      "verified": true
    }
  ]
}
```

---

### Get Featured Books
```http
GET /api/books/featured
```

**Example Request:**
```bash
curl http://localhost:3000/api/books/featured
```

**Response:**
```json
{
  "count": 15,
  "books": [...]
}
```

---

### Get Books by Genre
```http
GET /api/books/genre?genre={genreName}
```

**Query Parameters:**
- `genre` (string, required) - Genre name (e.g., Physics, Mathematics, Biology)

**Example Request:**
```bash
curl "http://localhost:3000/api/books/genre?genre=Physics"
```

**Response:**
```json
{
  "genre": "Physics",
  "count": 8,
  "books": [...]
}
```

---

### Get Top-Rated Books
```http
GET /api/books/top-rated?limit={number}
```

**Query Parameters:**
- `limit` (number, optional) - Number of books to return (default: 10)

**Example Request:**
```bash
curl "http://localhost:3000/api/books/top-rated?limit=5"
```

**Response:**
```json
{
  "count": 5,
  "books": [...]
}
```

---

## Reviews Endpoints

### Get All Reviews
```http
GET /api/reviews
```

**Query Parameters:**
- `bookId` (string, optional) - Filter reviews by book ID

**Example Requests:**
```bash
# Get all reviews
curl http://localhost:3000/api/reviews

# Get reviews for specific book
curl "http://localhost:3000/api/reviews?bookId=1"
```

**Response:**
```json
{
  "count": 60,
  "reviews": [...]
}
```

---

### Get Reviews for a Book
```http
GET /api/books/{id}/reviews
```

**Path Parameters:**
- `id` (string, required) - Book ID

**Example Request:**
```bash
curl http://localhost:3000/api/books/1/reviews
```

**Response:**
```json
[
  {
    "id": "review-1",
    "bookId": "1",
    "author": "Dr. Yasmin Al-Baghdadi",
    "rating": 5,
    "title": "Excellent foundation for physics students",
    "comment": "Comprehensive and well-written...",
    "timestamp": "2024-01-15T10:30:00Z",
    "verified": true
  }
]
```

---

### Create Review
```http
POST /api/books/{id}/reviews
```

**Path Parameters:**
- `id` (string, required) - Book ID

**Request Body:**
```json
{
  "author": "John Doe",
  "rating": 5,
  "title": "Amazing book!",
  "comment": "This book is incredibly detailed and helpful..."
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/books/1/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "author": "John Doe",
    "rating": 5,
    "title": "Amazing book!",
    "comment": "This book is incredibly detailed and helpful..."
  }'
```

**Response:**
```json
{
  "message": "Review created successfully",
  "review": {
    "id": "review-61",
    "bookId": "1",
    "author": "John Doe",
    "rating": 5,
    "title": "Amazing book!",
    "comment": "This book is incredibly detailed and helpful...",
    "timestamp": "2024-11-28T20:30:00Z",
    "verified": false
  }
}
```

---

## Cart Endpoints

### Get Cart Items
```http
GET /api/cart
```

**Example Request:**
```bash
curl http://localhost:3000/api/cart
```

**Response:**
```json
[
  {
    "id": "cart-item-1",
    "bookId": "1",
    "quantity": 2,
    "addedAt": "2024-11-28T10:00:00Z"
  }
]
```

---

### Add Item to Cart
```http
POST /api/cart
```

**Request Body:**
```json
{
  "bookId": "1",
  "quantity": 1
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"bookId": "1", "quantity": 1}'
```

**Response:**
```json
{
  "message": "Item added to cart successfully",
  "item": {
    "id": "cart-item-1",
    "bookId": "1",
    "quantity": 1,
    "addedAt": "2024-11-28T20:30:00Z"
  }
}
```

---

### Update Cart Item
```http
PUT /api/cart
```

**Request Body:**
```json
{
  "id": "cart-item-1",
  "quantity": 3
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"id": "cart-item-1", "quantity": 3}'
```

**Response:**
```json
{
  "message": "Cart item updated successfully"
}
```

---

### Remove Item from Cart
```http
DELETE /api/cart?itemId={id}
```

**Query Parameters:**
- `itemId` (string, required) - Cart item ID

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/cart?itemId=cart-item-1"
```

**Response:**
```json
{
  "message": "Item removed from cart successfully",
  "itemId": "cart-item-1"
}
```

---

### Clear Cart
```http
DELETE /api/cart?clearAll=true
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/cart?clearAll=true"
```

**Response:**
```json
{
  "message": "Cart cleared successfully"
}
```

---

## Statistics Endpoint

### Get Database Statistics
```http
GET /api/stats
```

**Example Request:**
```bash
curl http://localhost:3000/api/stats
```

**Response:**
```json
{
  "stats": {
    "totalBooks": 46,
    "totalReviews": 60,
    "cartItems": 0,
    "featuredBooks": 15,
    "inStockBooks": 43,
    "averageRating": 4.45,
    "genres": [
      { "genre": "Physics", "count": 8 },
      { "genre": "Mathematics", "count": 7 },
      { "genre": "Biology", "count": 5 }
    ]
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields: author, rating, title, comment"
}
```

### 404 Not Found
```json
{
  "error": "Book not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch books from database"
}
```

---

## Testing the API

### Using cURL

```bash
# Test connection
curl http://localhost:3000/api/stats

# Search books
curl "http://localhost:3000/api/books?search=quantum"

# Get featured books
curl http://localhost:3000/api/books/featured

# Get book details
curl http://localhost:3000/api/books/1

# Add review
curl -X POST http://localhost:3000/api/books/1/reviews \
  -H "Content-Type: application/json" \
  -d '{"author":"Test User","rating":5,"title":"Great!","comment":"Excellent book"}'
```

### Using PowerShell

```powershell
# Get all books
Invoke-RestMethod -Uri "http://localhost:3000/api/books" -Method Get

# Search books
Invoke-RestMethod -Uri "http://localhost:3000/api/books?search=quantum" -Method Get

# Get stats
Invoke-RestMethod -Uri "http://localhost:3000/api/stats" -Method Get

# Add to cart
$body = @{
    bookId = "1"
    quantity = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/cart" -Method Post -Body $body -ContentType "application/json"
```

### Using JavaScript/Fetch

```javascript
// Get all books
const books = await fetch('http://localhost:3000/api/books')
  .then(res => res.json());

// Search books
const results = await fetch('http://localhost:3000/api/books?search=quantum')
  .then(res => res.json());

// Add review
const review = await fetch('http://localhost:3000/api/books/1/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    author: 'Jane Doe',
    rating: 5,
    title: 'Excellent',
    comment: 'Very informative'
  })
}).then(res => res.json());
```

---

## Rate Limiting & Best Practices

**Current Status:** No rate limiting implemented

**Future Recommendations:**
- Implement rate limiting (e.g., 100 requests per minute per IP)
- Add API key authentication for production
- Implement caching for frequently accessed data
- Add request validation middleware
- Implement proper logging and monitoring

---

## Database Connection

All API routes use serverless functions that:
1. Connect to MongoDB on-demand
2. Execute the database operation
3. Close the connection automatically
4. Handle errors gracefully

Connection details are managed through environment variables in `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amana-bookstore
```
