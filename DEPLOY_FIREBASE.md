# Firebase Deployment Instructions

## Prerequisites

You need to be logged in to Firebase to deploy indexes and security rules.

## Step 1: Login to Firebase

Run this command in your terminal:

```bash
npx firebase-tools login
```

This will open a browser window where you can authenticate with your Google account that has access to the Firebase project.

## Step 2: Verify Project Configuration

Check that the correct project is configured:

```bash
npx firebase-tools projects:list
```

The project should be set to `codesnippetmanage` (as configured in `.firebaserc`).

## Step 3: Deploy Firestore Indexes

Deploy the composite indexes to Firebase:

```bash
npx firebase-tools deploy --only firestore:indexes
```

This will:

- Upload the index configuration from `firestore.indexes.json`
- Create 7 composite indexes for optimal query performance
- Index creation may take several minutes to complete

Expected output:

```
✔  Deploy complete!

Indexes are being created in the background. You can check their status in the Firebase Console.
```

## Step 4: Deploy Firestore Security Rules

Deploy the security rules to Firebase:

```bash
npx firebase-tools deploy --only firestore:rules
```

This will:

- Upload the security rules from `firestore.rules`
- Apply the rules immediately to your Firestore database
- Protect your data with proper access controls

Expected output:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/codesnippetmanage/overview
```

## Step 5: Verify Deployment

### Check Indexes in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/codesnippetmanage/firestore/indexes)
2. Navigate to Firestore Database → Indexes
3. You should see 7 composite indexes:

   - Snippets by User and Language
   - Snippets by User and Tags
   - Snippets by User and Collection
   - Snippets by User and Update Time
   - Shared Snippets
   - Collections by User and Parent
   - Tags by User and Usage

4. Wait for all indexes to finish building (status: "Enabled")

### Check Security Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/codesnippetmanage/firestore/rules)
2. Navigate to Firestore Database → Rules
3. Verify the rules are deployed and showing no errors

## Alternative: Deploy Both at Once

You can deploy both indexes and rules in a single command:

```bash
npx firebase-tools deploy --only firestore
```

## Troubleshooting

### "Permission denied" error

Make sure you're logged in with an account that has Owner or Editor role on the Firebase project:

```bash
npx firebase-tools login --reauth
```

### "Project not found" error

Verify the project ID in `.firebaserc` matches your Firebase project:

```bash
npx firebase-tools use codesnippetmanage
```

### Index creation taking too long

Index creation can take several minutes, especially for the first deployment. You can check the status in the Firebase Console under Firestore → Indexes.

### Rules validation error

If there's a syntax error in the rules, the deployment will fail with details. Check `firestore.rules` for any issues.

## Next Steps

After successful deployment:

1. ✅ Indexes are being created (check Firebase Console)
2. ✅ Security rules are active
3. ✅ Your Firestore database is properly configured
4. ⏭️ You can now proceed with implementing the snippet service layer (Task 5)

## Quick Reference

```bash
# Login
npx firebase-tools login

# Deploy indexes only
npx firebase-tools deploy --only firestore:indexes

# Deploy rules only
npx firebase-tools deploy --only firestore:rules

# Deploy both
npx firebase-tools deploy --only firestore

# Check deployment status
npx firebase-tools projects:list

# View current project
npx firebase-tools use
```
