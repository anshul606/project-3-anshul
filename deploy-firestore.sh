#!/bin/bash

# Firebase Deployment Script
# This script deploys Firestore indexes and security rules to Firebase

echo "🚀 Firebase Deployment Script"
echo "=============================="
echo ""

# Check if user is logged in
echo "📋 Checking Firebase authentication..."
if ! npx firebase-tools login:list | grep -q "@"; then
    echo "❌ Not logged in to Firebase"
    echo "Please run: npx firebase-tools login"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Show current project
echo "📋 Current Firebase project:"
npx firebase-tools use
echo ""

# Ask user what to deploy
echo "What would you like to deploy?"
echo "1) Indexes only"
echo "2) Security rules only"
echo "3) Both indexes and rules"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📤 Deploying Firestore indexes..."
        npx firebase-tools deploy --only firestore:indexes
        ;;
    2)
        echo ""
        echo "📤 Deploying Firestore security rules..."
        npx firebase-tools deploy --only firestore:rules
        ;;
    3)
        echo ""
        echo "📤 Deploying Firestore indexes and security rules..."
        npx firebase-tools deploy --only firestore
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "1. Check index status: https://console.firebase.google.com/project/codesnippetmanage/firestore/indexes"
echo "2. Verify security rules: https://console.firebase.google.com/project/codesnippetmanage/firestore/rules"
echo ""
