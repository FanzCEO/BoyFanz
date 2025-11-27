#!/bin/bash
# BoyFanz Database Setup Script

echo "=================================================="
echo "BoyFanz Database Setup"
echo "=================================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your database settings"
    exit 1
fi

# Extract database credentials from DATABASE_URL or use individual vars
DB_USER=${PGUSER:-"boyzapp_user"}
DB_NAME=${PGDATABASE:-"boyzapp_db"}
DB_HOST=${PGHOST:-"localhost"}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

read -p "Continue with database setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 1
fi

echo ""
echo "Importing database schema..."

if [ -f "database/complete-schema.sql" ]; then
    psql -U $DB_USER -d $DB_NAME -h $DB_HOST -f database/complete-schema.sql
    echo "✓ Database schema imported successfully"
else
    echo "Error: database/complete-schema.sql not found!"
    exit 1
fi

echo ""
echo "Database setup complete!"
