#!/bin/bash

# Database Update Script for Vercel PostgreSQL
# This script helps you execute database updates on your Vercel-deployed database

echo "🚀 Vercel Database Update Script"
echo "================================"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) is not installed."
    echo "Install it with:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo "✅ PostgreSQL client found"

echo ""
echo "📋 Choose your update method:"
echo "1. Run complete setup (setup-database.sql)"
echo "2. Run individual migrations"
echo "3. Connect to database for manual commands"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔧 Running complete database setup..."
        echo "You'll need your Vercel database connection string."
        echo "Get it from: vercel env pull"
        echo ""
        read -p "Enter your PostgreSQL connection string: " CONNECTION_STRING
        
        echo "Executing setup-database.sql..."
        psql "$CONNECTION_STRING" -f setup-database.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Database setup completed successfully!"
        else
            echo "❌ Database setup failed"
        fi
        ;;
        
    2)
        echo ""
        echo "🔧 Running individual migrations..."
        echo "You'll need your Vercel database connection string."
        echo "Get it from: vercel env pull"
        echo ""
        read -p "Enter your PostgreSQL connection string: " CONNECTION_STRING
        
        echo "Running migrations in order..."
        for migration in src/migrations/*.sql; do
            echo "Executing $(basename "$migration")..."
            psql "$CONNECTION_STRING" -f "$migration"
            if [ $? -eq 0 ]; then
                echo "✅ $(basename "$migration") completed"
            else
                echo "❌ $(basename "$migration") failed"
                exit 1
            fi
        done
        echo "✅ All migrations completed successfully!"
        ;;
        
    3)
        echo ""
        echo "🔧 Connecting to database for manual commands..."
        echo "You'll need your Vercel database connection string."
        echo "Get it from: vercel env pull"
        echo ""
        read -p "Enter your PostgreSQL connection string: " CONNECTION_STRING
        
        echo "Connecting to database..."
        psql "$CONNECTION_STRING"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Database update process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test your API endpoints"
echo "2. Verify data in your database"
echo "3. Update your frontend if needed"
