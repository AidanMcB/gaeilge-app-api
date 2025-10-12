#!/usr/bin/env node

/**
 * Database Migration Script for Vercel
 * This script can be run on Vercel to execute database updates
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
    console.log('🚀 Starting database migrations...');
    
    try {
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful');
        
        // Check if tables already exist
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'notecards', 'categories', 'notecard_categories')
        `);
        
        if (tableCheck.rows.length === 0) {
            // Read and execute setup script only if no tables exist
            const setupScript = fs.readFileSync(path.join(__dirname, 'setup-database.sql'), 'utf8');
            console.log('📋 Executing setup-database.sql...');
            await pool.query(setupScript);
            console.log('✅ Setup script executed successfully');
        } else {
            console.log('📋 Tables already exist, skipping setup script');
        }
        
        // Run individual migrations
        const migrationsDir = path.join(__dirname, 'src', 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        console.log(`📋 Found ${migrationFiles.length} migration files`);
        
        for (const file of migrationFiles) {
            console.log(`🔄 Executing ${file}...`);
            const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await pool.query(migrationSQL);
            console.log(`✅ ${file} completed`);
        }
        
        console.log('🎉 All migrations completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations if this script is executed directly
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };
