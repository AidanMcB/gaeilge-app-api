#!/bin/bash

# Database Setup Script for Gaeilge App
# This script will help you set up the PostgreSQL database

echo "🚀 Setting up Gaeilge App Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "On macOS: brew services start postgresql"
    echo "On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is installed and running"

# Get database credentials
echo ""
echo "📝 Please provide your PostgreSQL credentials:"
read -p "PostgreSQL username (default: $(whoami)): " DB_USER
DB_USER=${DB_USER:-$(whoami)}

read -p "PostgreSQL password: " -s DB_PASSWORD
echo ""

read -p "PostgreSQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "PostgreSQL port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Create the database
echo ""
echo "🗄️  Creating database 'gaeilge_app'..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER gaeilge_app

if [ $? -eq 0 ]; then
    echo "✅ Database 'gaeilge_app' created successfully"
else
    echo "❌ Failed to create database. It might already exist."
fi

# Run the SQL setup script
echo ""
echo "📋 Setting up database tables..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d gaeilge_app -f setup-database.sql

if [ $? -eq 0 ]; then
    echo "✅ Database tables created successfully"
else
    echo "❌ Failed to create tables"
    exit 1
fi

# Create .env file
echo ""
echo "📄 Creating .env file..."
cat > .env << EOF
# Database Configuration
GAEILGE_ENV=local
DB_USER=$DB_USER
DB_HOST=$DB_HOST
DB_NAME=gaeilge_app
DB_PASSWORD=$DB_PASSWORD
DB_PORT=$DB_PORT

# Backend Configuration
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Firebase Configuration (you'll need to add these)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (for backend)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
EOF

echo "✅ .env file created"
echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the Firebase configuration in the .env file"
echo "2. Start your backend server: npm start"
echo "3. Start your frontend server: npm run dev"
echo ""
echo "🔧 To test the database connection:"
echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d gaeilge_app -c 'SELECT * FROM users;'"
