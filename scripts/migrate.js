#!/usr/bin/env node

/**
 * Database migration script for Focus Mind Sync
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/migrate.js
 *
 * This script applies the schema and RLS policies to your Supabase database.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is required');
    console.error('Usage: DATABASE_URL="postgresql://..." node scripts/migrate.js');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    console.log('Connecting to database...');
    await client.connect();

    // Read and execute schema
    console.log('Applying schema...');
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('Schema applied successfully');

    // Read and execute RLS policies
    console.log('Applying RLS policies...');
    const rlsPath = path.join(__dirname, '..', 'supabase', 'rls.sql');
    const rls = fs.readFileSync(rlsPath, 'utf8');

    // Split RLS policies and execute one by one (some may already exist)
    const statements = rls.split(';').filter(s => s.trim());
    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (err) {
        // Ignore "already exists" errors for policies
        if (!err.message.includes('already exists')) {
          console.warn('Warning:', err.message);
        }
      }
    }
    console.log('RLS policies applied successfully');

    console.log('\\nMigration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
