# MongoDB Setup Guide

This guide will help you set up MongoDB for the Amana Bookstore application.

## Prerequisites

You need either:
- **Local MongoDB** installed on your machine, OR
- **MongoDB Atlas** (cloud) account

## Option 1: Local MongoDB Setup

### Install MongoDB

**Windows:**
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will run on `mongodb://localhost:27017` by default

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Verify Installation
```bash
mongosh
```

## Option 2: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user with password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

## Configuration

1. **Update `.env.local`** with your MongoDB connection string:

   **For Local MongoDB:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/amana-bookstore
   ```

   **For MongoDB Atlas:**
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/amana-bookstore?retryWrites=true&w=majority
   ```

   Replace `<username>`, `<password>`, and `<cluster-url>` with your actual credentials.

## Import Data

Run the import script to load your book and review data into MongoDB:

```bash
npm run import-data
```

This will:
- Connect to your MongoDB database
- Clear existing collections (if any)
- Import all books from `mongodb-data/books.json`
- Import all reviews from `mongodb-data/reviews.json`
- Create indexes for better query performance

## Verify Data Import

### Using MongoDB Shell (mongosh)

```bash
mongosh
use amana-bookstore
db.books.countDocuments()
db.reviews.countDocuments()
db.books.findOne()
```

### Using MongoDB Compass (GUI)

1. Download MongoDB Compass from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse the `amana-bookstore` database
4. View collections: `books`, `reviews`, `cart`

## Start Your Application

```bash
npm run dev
```

Your app will now fetch data from MongoDB instead of local files!

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books?search=quantum` - Search books

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
  ```json
  { "bookId": "1", "quantity": 1 }
  ```
- `PUT /api/cart` - Update cart item
  ```json
  { "id": "cart-item-id", "quantity": 2 }
  ```
- `DELETE /api/cart?itemId=cart-item-id` - Remove item
- `DELETE /api/cart?clearAll=true` - Clear cart

## Troubleshooting

### Connection Issues

**Error: "MongooseServerSelectionError"**
- Check if MongoDB is running: `mongosh` (local) or verify Atlas connection
- Verify your connection string in `.env.local`
- Check firewall settings (Atlas: whitelist your IP)

**Error: "Authentication failed"**
- Verify username and password in connection string
- Check database user permissions in Atlas

### Import Script Issues

**Error: "Cannot find module"**
```bash
npm install --save-dev tsx
```

**Error: "ENOENT: no such file or directory"**
- Ensure `mongodb-data/` folder exists with JSON files
- Run the script from the project root directory

## Database Schema

### Books Collection
```javascript
{
  _id: "1",
  title: "Book Title",
  author: "Author Name",
  description: "Description...",
  price: 99.99,
  isbn: "978-1234567890",
  genre: ["Genre1", "Genre2"],
  tags: ["tag1", "tag2"],
  datePublished: "2023-01-01",
  pages: 500,
  language: "English",
  publisher: "Publisher Name",
  rating: 4.5,
  reviewCount: 10,
  inStock: true,
  featured: true,
  image: "/images/book.jpg"
}
```

### Reviews Collection
```javascript
{
  _id: "review-1",
  bookId: "1",
  author: "Reviewer Name",
  rating: 5,
  title: "Review Title",
  comment: "Review text...",
  timestamp: "2024-01-01T10:00:00Z",
  verified: true
}
```

### Cart Collection
```javascript
{
  _id: "cart-item-id",
  bookId: "1",
  quantity: 2,
  addedAt: "2024-01-01T10:00:00Z"
}
```

## Next Steps

- Add authentication for user-specific carts
- Implement real-time inventory management
- Add more API endpoints (book details, featured books, etc.)
- Set up proper error handling and logging
- Add data validation with Zod or similar
- Implement caching with Redis for better performance

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Next.js + MongoDB Tutorial](https://nextjs.org/learn/dashboard-app/setting-up-your-database)
