# Gaeilge App API - Build & Deploy Guide

## Overview
This document describes the build and deployment process for the Gaeilge App API, including database migration procedures.

## Current Setup
- **Platform**: Vercel (Serverless Functions)
- **Runtime**: Node.js 22.x (default)
- **Database**: PostgreSQL (Vercel Postgres)
- **Framework**: Express.js

## Build Process

### Automatic Build (Vercel)
When you push to your main branch or create a pull request, Vercel automatically:
1. **Detects changes** in the `gaeilge-app-api` directory
2. **Installs dependencies** using `npm install`
3. **Builds the application** (minimal build step for Express.js)
4. **Deploys serverless functions** to Vercel's edge network

### Build Configuration
- **Entry Point**: `index.js`
- **Node.js Version**: 22.x (specified in `package.json` engines)
- **Dependencies**: Automatically installed from `package.json`

## Database Migrations

### ⚠️ Important: Manual Process Required
**Database migrations do NOT run automatically during deployment.** You must run them manually after each deployment.

### Migration Files
Located in `src/migrations/`:
- `001_create_notecards_table.sql`
- `002_create_categories_table.sql`
- `003_create_notecard_categories_table.sql`
- `004_create_users_table.sql`
- `005_update_notecards_with_users_fk.sql`

### Running Migrations

#### Option 1: Using the Migration Script (Recommended)
```bash
# From the gaeilge-app-api directory
npm run migrate
```

#### Option 2: Using the Deploy Script
```bash
# Make the script executable
chmod +x deploy-db-updates.sh

# Run the script
./deploy-db-updates.sh
```

#### Option 3: Manual psql Connection
```bash
# Connect to your Vercel database
psql $DATABASE_URL

# Run individual migration files
\i src/migrations/001_create_notecards_table.sql
\i src/migrations/002_create_categories_table.sql
# ... etc
```

### Environment Variables Required
- `DATABASE_URL`: Your Vercel Postgres connection string
- `NODE_ENV`: Set to `production` for SSL connections

## Deployment Workflow

### 1. Code Changes
```bash
# Make your changes to the API
git add .
git commit -m "Your changes"
git push origin main
```

### 2. Vercel Deployment
- Vercel automatically detects the push
- Builds and deploys the API
- Updates the serverless functions

### 3. Database Updates (Manual)
```bash
# After deployment, run migrations
cd gaeilge-app-api
npm run migrate
```

### 4. Verification
- Test your API endpoints
- Verify database schema changes
- Check application logs in Vercel dashboard

## Environment Configuration

### Required Environment Variables
Set these in your Vercel project settings:

```env
# Database
DATABASE_URL=postgresql://...

# Firebase Client SDK (for frontend authentication)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (for backend authentication)
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# CORS
FRONTEND_ORIGIN=https://your-frontend-domain.vercel.app

# Environment
NODE_ENV=production
```

### Firebase Service Account Setup
To get the Firebase Admin SDK credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the values and set them as environment variables in Vercel

**Important**: The `FIREBASE_PRIVATE_KEY` should include the full private key with `\n` characters preserved (Vercel will handle the newlines correctly).

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is set correctly
   - Check SSL settings for production

2. **Migration Failures**
   - Ensure migration files are syntactically correct
   - Check for conflicting schema changes
   - Verify database permissions

3. **CORS Issues**
   - Update `FRONTEND_ORIGIN` environment variable
   - Check CORS configuration in `index.js`

4. **Firebase Authentication Errors**
   - Verify all Firebase environment variables are set correctly
   - Check that `FIREBASE_PRIVATE_KEY` includes proper newline characters
   - Ensure Firebase project ID matches in all environment variables
   - Verify service account has proper permissions

### Logs and Debugging
- **Vercel Dashboard**: View function logs and errors
- **Local Testing**: Use `npm start` to test locally
- **Database Logs**: Check Vercel Postgres logs

## Best Practices

### Before Deployment
1. **Test migrations locally** with a copy of production data
2. **Backup your database** before running migrations
3. **Review migration files** for potential conflicts

### During Deployment
1. **Monitor Vercel logs** for build errors
2. **Run migrations immediately** after successful deployment
3. **Test critical endpoints** after migration

### After Deployment
1. **Verify all functionality** works as expected
2. **Update documentation** if schema changes affect API
3. **Monitor performance** and error rates

## Future Improvements

### Automated Migrations
Consider implementing automated migrations by:
1. Adding a build hook in `vercel.json`
2. Creating a migration API endpoint
3. Using Vercel's build commands to run migrations

### Example Automated Setup
```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run migrate && npm run build",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

## Support
For issues with deployment or migrations, check:
- Vercel documentation
- PostgreSQL documentation
- Project logs in Vercel dashboard
