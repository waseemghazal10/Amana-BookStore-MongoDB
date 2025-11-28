# MongoDB Atlas Setup Checklist

## ✅ Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google/GitHub
3. Verify your email

## ✅ Step 2: Create Your First Cluster
1. Click "Create" or "Build a Database"
2. Choose **M0 FREE** tier
3. Select Cloud Provider: **AWS** (recommended)
4. Choose Region: (closest to you)
5. Cluster Name: `Cluster0` (default is fine)
6. Click **"Create Deployment"**

## ✅ Step 3: Create Database User
1. Create a username: `amana-admin`
2. Click "Autogenerate Secure Password"
3. **SAVE THE PASSWORD** somewhere safe
4. Click "Create Database User"

## ✅ Step 4: Configure Network Access
1. Choose "My Local Environment"
2. Add your IP address:
   - Option A: Click "Add My Current IP Address"
   - Option B: Add `0.0.0.0/0` for access from anywhere (dev only)
3. Click "Finish and Close"

## ✅ Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Drivers"
3. Select Driver: "Node.js"
4. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials

## ✅ Step 6: Update .env.local
1. Open `.env.local` in your project
2. Replace the MONGODB_URI value with your connection string:
   ```
   MONGODB_URI=mongodb+srv://amana-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/amana-bookstore?retryWrites=true&w=majority
   ```
3. Make sure to add `/amana-bookstore` before the `?` to specify the database name
4. Save the file

## ✅ Step 7: Test Connection
Run this command to test if everything works:
```bash
npm run test-db
```

You should see:
- ✅ Successfully connected to MongoDB!
- Database name and collections info

## ✅ Step 8: Import Your Data
Run this command to import all books and reviews:
```bash
npm run import-data
```

This will:
- Import 46 books
- Import 60 reviews
- Create indexes for better performance

## ✅ Step 9: Start Your Application
```bash
npm run dev
```

Visit http://localhost:3000 and your app will now use MongoDB!

## Troubleshooting

### ❌ Connection Timeout
- Check if your IP is whitelisted in Network Access
- Try adding 0.0.0.0/0 to allow all IPs (temporarily)

### ❌ Authentication Failed
- Verify username and password in connection string
- Make sure to URL-encode special characters in password
- Example: if password is `p@ss!word`, encode as `p%40ss%21word`

### ❌ Database Not Found
- Make sure connection string includes `/amana-bookstore` before `?`
- Example: `...mongodb.net/amana-bookstore?retryWrites=true...`

## Next Steps

After successful setup:
- ✅ Test your API endpoints
- ✅ View data in MongoDB Compass
- ✅ Monitor usage in Atlas dashboard
- ✅ Add more features (authentication, etc.)

## Useful Commands

```bash
# Test database connection
npm run test-db

# Import/re-import data
npm run import-data

# Start development server
npm run dev

# Build for production
npm run build
```

## MongoDB Atlas Dashboard
Access your cluster: https://cloud.mongodb.com/
