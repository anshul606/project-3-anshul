# Collection Management System

This directory contains components for managing hierarchical collections of code snippets.

## Components

### CollectionTree

The main component that displays collections in a hierarchical tree structure with expand/collapse functionality.

**Features:**

- Expandable/collapsible tree structure
- Support for nested collections (up to 5 levels deep)
- Drag-and-drop snippet organization between collections
- Context menu for collection operations (rename, delete, create subcollection)
- Real-time updates via Firestore listeners
- Automatic expansion of parent collections when selecting a child

**Props:**

- `collections` - Array of collection objects
- `selectedId` - ID of the currently selected collection
- `onSelect` - Callback when a collection is selected
- `onCreateCollection` - Callback to create a new collection
- `onUpdateCollection` - Callback to update a collection
- `onDeleteCollection` - Callback to delete a collection
- `onMoveSnippet` - Callback to move a snippet to a collection

### CollectionItem

Displays an individual collection with its icon, name, and actions.

**Features:**

- Folder icon (open/closed based on expand state)
- Team collection badge
- Context menu with operations
- Drag-and-drop support
- Indentation based on nesting level

**Props:**

- `collection` - The collection object
- `isSelected` - Whether this collection is selected
- `isExpanded` - Whether this collection is expanded
- `level` - Nesting level (0 for root)
- `hasChildren` - Whether this collection has subcollections
- `onSelect` - Callback when selected
- `onToggleExpand` - Callback to expand/collapse
- `onRename` - Callback to rename
- `onDelete` - Callback to delete
- `onCreateSubcollection` - Callback to create subcollection
- `onDragStart` - Drag start handler
- `onDragOver` - Drag over handler
- `onDrop` - Drop handler

## Service Layer

### collectionService.js

Handles all collection-related operations with Firestore.

**Functions:**

- `createCollection(userId, collectionData)` - Create a new collection
- `updateCollection(collectionId, updates)` - Update a collection
- `deleteCollection(collectionId, deleteSubcollections)` - Delete a collection
- `getCollection(collectionId)` - Get a single collection
- `getUserCollections(userId)` - Get all collections for a user
- `getSubcollections(parentId)` - Get subcollections of a parent
- `moveCollection(collectionId, newParentId)` - Move a collection to a new parent
- `reorderCollections(collectionOrders)` - Reorder collections

**Features:**

- Automatic path management for hierarchy
- Validation of nesting depth (max 5 levels)
- Recursive subcollection updates when moving
- Retry logic for network failures
- Error categorization and handling

## Context & Hooks

### CollectionContext

Provides global state management for collections with real-time Firestore listeners.

**State:**

- `collections` - Array of all collections
- `loading` - Loading state
- `error` - Error message if any

**Actions:**

- `addCollection(collectionData)` - Create a new collection
- `updateCollection(collectionId, updates)` - Update a collection
- `deleteCollection(collectionId, deleteSubcollections)` - Delete a collection
- `moveCollection(collectionId, newParentId)` - Move a collection
- `reorderCollections(collectionOrders)` - Reorder collections
- `clearError()` - Clear error state

**Selectors:**

- `getCollectionById(collectionId)` - Get a collection by ID
- `getRootCollections()` - Get all root-level collections
- `getSubcollections(parentId)` - Get subcollections of a parent
- `getCollectionPath(collectionId)` - Get the full path to a collection

### useCollections Hook

Custom hook to access the CollectionContext.

```javascript
import useCollections from "../hooks/useCollections";

const MyComponent = () => {
  const { collections, addCollection, updateCollection } = useCollections();
  // Use collections and actions
};
```

## Data Model

### Collection Document Structure

```javascript
{
  id: string,              // Auto-generated document ID
  userId: string,          // Owner's user ID
  name: string,            // Collection name
  parentId: string | null, // Parent collection ID (null for root)
  path: string[],          // Array of ancestor IDs for hierarchy
  isTeamCollection: boolean, // Whether this is a team collection
  teamMembers: string[],   // Array of user IDs with access
  order: number,           // Sort order within parent
  createdAt: Timestamp,    // Creation timestamp
  updatedAt: Timestamp     // Last update timestamp
}
```

## Usage Example

```javascript
import { CollectionProvider } from "../contexts/CollectionContext";
import { CollectionTree } from "../components/collections";
import useCollections from "../hooks/useCollections";

const MyApp = () => {
  const userId = "user-123";

  return (
    <CollectionProvider userId={userId}>
      <CollectionTreeWrapper />
    </CollectionProvider>
  );
};

const CollectionTreeWrapper = () => {
  const { collections, addCollection, updateCollection, deleteCollection } =
    useCollections();

  const [selectedId, setSelectedId] = useState(null);

  return (
    <CollectionTree
      collections={collections}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onCreateCollection={addCollection}
      onUpdateCollection={updateCollection}
      onDeleteCollection={deleteCollection}
    />
  );
};
```

## Demo

Visit `/demo/collections` to see the collection management system in action with:

- Creating root and nested collections
- Renaming collections
- Deleting collections (with subcollections)
- Expanding/collapsing tree nodes
- Drag-and-drop organization
- Real-time updates

## Security Rules

Collections are protected by Firestore security rules:

- Users can only read/write their own collections
- Team collections can be accessed by team members
- Only the owner can delete collections

## Firestore Indexes

Required composite index for efficient queries:

```json
{
  "collectionGroup": "collections",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "parentId", "order": "ASCENDING" },
    { "fieldPath": "order", "order": "ASCENDING" }
  ]
}
```

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **Requirement 4.1**: Collections can be created and stored in Firestore
- **Requirement 4.2**: Nested collections are supported up to 5 levels deep
- **Requirement 4.5**: Collections can be moved and reorganized with drag-and-drop

## Future Enhancements

- Bulk operations (move multiple collections at once)
- Collection templates
- Collection sharing with granular permissions
- Collection search and filtering
- Collection statistics (snippet count, last modified)
- Keyboard shortcuts for collection navigation
