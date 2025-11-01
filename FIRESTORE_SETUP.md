# Firestore Database Setup Guide

This guide explains how to set up and test the Firestore database structure and security rules for the Code Snippet Manager application.

## Database Structure

The application uses four main Firestore collections:

### 1. Users Collection (`users/{userId}`)

Stores user profile information and preferences.

```javascript
{
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  preferences: {
    theme: string,              // 'light' or 'dark'
    defaultLanguage: string,    // Default programming language
    keyboardShortcuts: object   // Custom keyboard shortcuts
  }
}
```

### 2. Snippets Collection (`snippets/{snippetId}`)

Stores code snippets with metadata and sharing information.

```javascript
{
  userId: string,              // Owner's user ID
  title: string,               // Snippet title
  description: string,         // Snippet description
  code: string,                // Code content
  language: string,            // Programming language
  tags: array<string>,         // Tags for categorization
  collectionId: string | null, // Parent collection ID
  metadata: {
    usageNotes: string,        // Usage instructions
    dependencies: string,      // Required dependencies
    author: string             // Author name
  },
  sharing: {
    isShared: boolean,         // Whether snippet is shared
    sharedWith: array<string>  // User IDs with access
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastEditedBy: string         // Last editor's user ID
}
```

### 3. Collections Collection (`collections/{collectionId}`)

Stores hierarchical collections for organizing snippets.

```javascript
{
  userId: string,              // Owner's user ID
  name: string,                // Collection name
  parentId: string | null,     // Parent collection ID
  path: array<string>,         // Hierarchy path
  isTeamCollection: boolean,   // Whether it's a team collection
  teamMembers: array<string>,  // Team member user IDs
  createdAt: timestamp,
  order: number                // Display order
}
```

### 4. Tags Collection (`tags/{tagId}`)

Stores user-specific tags with usage statistics.

```javascript
{
  userId: string,              // Owner's user ID
  name: string,                // Tag name
  usageCount: number,          // Number of times used
  lastUsed: timestamp          // Last usage timestamp
}
```

## Security Rules

The Firestore security rules enforce the following access controls:

### Users Collection

- ✅ Users can read/write their own user document
- ❌ Users cannot access other users' documents
- ❌ Unauthenticated users have no access

### Snippets Collection

- ✅ Users can read their own snippets
- ✅ Users can read snippets shared with them
- ✅ Users can create snippets (must set userId to their own)
- ✅ Users can update their own snippets
- ✅ Users with write permission can update shared snippets
- ✅ Only owners can delete snippets
- ❌ Users cannot read non-shared snippets from other users

### Collections

- ✅ Users can read their own collections
- ✅ Team members can read team collections
- ✅ Users can create/update collections
- ✅ Team members can update team collections
- ✅ Only owners can delete collections

### Tags

- ✅ Users can only access their own tags
- ❌ Users cannot access other users' tags

## Composite Indexes

The following composite indexes are configured for optimal query performance:

1. **Snippets by User and Language**

   - Fields: `userId` (ASC), `language` (ASC), `createdAt` (DESC)
   - Purpose: Filter snippets by programming language

2. **Snippets by User and Tags**

   - Fields: `userId` (ASC), `tags` (ARRAY_CONTAINS), `createdAt` (DESC)
   - Purpose: Filter snippets by tags

3. **Snippets by User and Collection**

   - Fields: `userId` (ASC), `collectionId` (ASC), `createdAt` (DESC)
   - Purpose: Get snippets in a specific collection

4. **Snippets by User and Update Time**

   - Fields: `userId` (ASC), `updatedAt` (DESC)
   - Purpose: Get recently updated snippets

5. **Shared Snippets**

   - Fields: `sharing.isShared` (ASC), `sharing.sharedWith` (ARRAY_CONTAINS), `updatedAt` (DESC)
   - Purpose: Query shared snippets efficiently

6. **Collections by User and Parent**

   - Fields: `userId` (ASC), `parentId` (ASC), `order` (ASC)
   - Purpose: Get child collections in order

7. **Tags by User and Usage**
   - Fields: `userId` (ASC), `usageCount` (DESC)
   - Purpose: Get most used tags

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select a location

### 2. Deploy Security Rules

Deploy the security rules to your Firebase project:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### 3. Deploy Indexes

Deploy the composite indexes:

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

This will create all the necessary composite indexes for optimal query performance.

### 4. Update Environment Variables

Make sure your `.env` file has the correct Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Testing with Firebase Emulator

The Firebase Emulator Suite allows you to test Firestore security rules locally without affecting production data.

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Start the Emulator

```bash
firebase emulators:start
```

This will start:

- Firestore Emulator on `http://localhost:8080`
- Auth Emulator on `http://localhost:9099`
- Emulator UI on `http://localhost:4000`

### 3. Access Emulator UI

Open `http://localhost:4000` in your browser to:

- View Firestore data
- Test security rules
- Monitor Auth users
- View logs

### 4. Run Tests

Run the Firestore service tests:

```bash
npm test src/services/firestoreService.test.js
```

Run the security rules documentation tests:

```bash
npm test tests/firestore-rules.test.js
```

### 5. Manual Testing Scenarios

Use the Emulator UI to test these scenarios:

#### Test User Access

1. Create a user document in the `users` collection
2. Try to read it with the same user ID (should succeed)
3. Try to read it with a different user ID (should fail)

#### Test Snippet Access

1. Create a snippet with `userId: "user123"`
2. Try to read it as `user123` (should succeed)
3. Try to read it as `user456` (should fail)
4. Update the snippet to set `sharing.isShared: true` and `sharing.sharedWith: ["user456"]`
5. Try to read it as `user456` (should succeed)

#### Test Collection Access

1. Create a collection with `userId: "user123"`
2. Try to read it as `user123` (should succeed)
3. Try to read it as `user456` (should fail)
4. Update to set `isTeamCollection: true` and `teamMembers: ["user456"]`
5. Try to read it as `user456` (should succeed)

## Using Firestore Service

The `firestoreService.js` provides utility functions for working with Firestore:

```javascript
import {
  initializeUserDocument,
  createSnippetDocument,
  createCollectionDocument,
  validateSnippetData,
  COLLECTIONS,
} from "./services/firestoreService";

// Initialize user document when user signs up
await initializeUserDocument(userId, {
  email: "user@example.com",
  displayName: "John Doe",
});

// Create a snippet document
const snippetData = createSnippetDocument(userId, {
  title: "My Snippet",
  code: 'console.log("Hello");',
  language: "javascript",
  tags: ["javascript", "console"],
});

// Validate snippet data before saving
const validation = validateSnippetData(snippetData);
if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
}
```

## Troubleshooting

### Security Rules Not Working

1. Make sure you've deployed the rules:

   ```bash
   firebase deploy --only firestore:rules
   ```

2. Check the Firebase Console for rule errors:
   - Go to Firestore Database → Rules
   - Look for syntax errors or warnings

### Indexes Not Created

1. Deploy indexes manually:

   ```bash
   firebase deploy --only firestore:indexes
   ```

2. Check index creation status in Firebase Console:
   - Go to Firestore Database → Indexes
   - Wait for indexes to finish building (can take several minutes)

### Emulator Connection Issues

1. Make sure the emulator is running:

   ```bash
   firebase emulators:start
   ```

2. Check that your app is configured to use the emulator (for development):

   ```javascript
   import { connectFirestoreEmulator } from "firebase/firestore";

   if (import.meta.env.DEV) {
     connectFirestoreEmulator(db, "localhost", 8080);
   }
   ```

### Permission Denied Errors

1. Check that the user is authenticated
2. Verify the user ID matches the document owner
3. For shared snippets, verify the user ID is in the `sharedWith` array
4. Check the Firestore rules in the Firebase Console

## Next Steps

After setting up Firestore:

1. ✅ Security rules deployed
2. ✅ Composite indexes created
3. ✅ Emulator tested
4. ⏭️ Implement snippet service layer (Task 5)
5. ⏭️ Create snippet state management (Task 6)
6. ⏭️ Build UI components (Tasks 7-10)

## Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Composite Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
