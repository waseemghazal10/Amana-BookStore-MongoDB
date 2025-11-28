# Vercel Deployment Troubleshooting Guide

## Issue: "Failed to load books. Please try again later."

This error means the frontend can't connect to the MongoDB database. Here's how to fix it:

## Step 1: Verify Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **Amana-Bookstore**
3. Click **Settings** → **Environment Variables**
4. Add this variable (if not already added):

```
Name: MONGODB_URI
Value: mongodb+srv://amana_db_user:WSWg192%40%40@cluster0.dej1t2y.mongodb.net/amana-bookstore?retryWrites=true&w=majority&appName=Cluster0
```

5. ✅ Check all three environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Click **Save**

## Step 2: Configure MongoDB Atlas Network Access

This is the **MOST COMMON** issue! MongoDB Atlas blocks connections by default.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Select your cluster: **Cluster0**
4. Click **Network Access** (left sidebar)
5. Click **ADD IP ADDRESS**
6. Click **ALLOW ACCESS FROM ANYWHERE**
   - This adds IP: `0.0.0.0/0` (allows all IPs)
   - ⚠️ For production, you should whitelist specific Vercel IPs instead
7. Click **Confirm**
8. Wait 1-2 minutes for changes to propagate

## Step 3: Redeploy on Vercel

After adding environment variable or updating network access:

1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click the **...** (three dots) menu
4. Click **Redeploy**
5. Wait for deployment to complete

## Step 4: Test Your Deployment

1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Check if books load
3. If still failing, check Vercel logs:
   - Click **Deployments** → Latest deployment
   - Click **Functions** tab
   - Look for error messages

## Common Errors and Solutions

### Error: "Please add your Mongo URI to .env.local"
**Solution**: Environment variable not set in Vercel → Follow Step 1

### Error: "MongoServerError: connection timeout"
**Solution**: IP address not whitelisted in MongoDB Atlas → Follow Step 2

### Error: "Authentication failed"
**Solution**: Check password in connection string:
- Password should be URL-encoded: `@` becomes `%40`
- Current password: `WSWg192@@` → `WSWg192%40%40`

## Vercel-Specific MongoDB Considerations

1. **Serverless Functions**: Each API call creates a new connection
2. **Connection Pooling**: Our code uses global caching in development, fresh connections in production
3. **Cold Starts**: First request may be slower (3-5 seconds)
4. **Timeout**: Vercel functions have 10-second timeout on free tier

## Testing Locally vs Production

### Local (works):
```bash
npm run dev
# Uses .env.local file
```

### Vercel (production):
- Uses Environment Variables from Vercel Dashboard
- Must have MongoDB Network Access configured

## Need More Help?

Check Vercel function logs for detailed error messages:
1. Vercel Dashboard → Your Project
2. Click **Deployments**
3. Click latest deployment
4. Click **Functions** tab
5. Click on a function (e.g., `/api/books`)
6. View real-time logs

## Quick Checklist

Before asking for help, verify:
- [ ] MONGODB_URI set in Vercel Environment Variables
- [ ] All three environments checked (Production, Preview, Development)
- [ ] MongoDB Atlas Network Access set to 0.0.0.0/0
- [ ] Waited 1-2 minutes after changing MongoDB settings
- [ ] Redeployed on Vercel after making changes
- [ ] Checked Vercel function logs for specific errors
