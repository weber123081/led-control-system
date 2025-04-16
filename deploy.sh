#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Create deployment directory
echo "Creating deployment directory..."
rm -rf deployment
mkdir -p deployment

# Copy dist files to deployment
echo "Copying build files..."
cp -r dist/* deployment/

# Copy server configs if they exist
if [ -f "nginx.conf" ]; then
    echo "Copying Nginx configuration..."
    cp nginx.conf deployment/
fi

if [ -f ".env.production" ]; then
    echo "Copying production environment file..."
    cp .env.production deployment/.env
fi

echo "Deployment files prepared in 'deployment' directory"
echo "Done! 🚀" 