import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Firestore Service
 * Provides utilities for interacting with Firestore collections
 */

// Collection references
export const COLLECTIONS = {
  USERS: "users",
  SNIPPETS: "snippets",
  COLLECTIONS: "collections",
  TAGS: "tags",
};

/**
 * Initialize user document in Firestore
 * Creates a user document with default preferences when a new user signs up
 */
export const initializeUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const defaultUserData = {
        email: userData.email || "",
        displayName: userData.displayName || "",
        photoURL: userData.photoURL || "",
        createdAt: serverTimestamp(),
        preferences: {
          theme: "light",
          defaultLanguage: "javascript",
          keyboardShortcuts: {
            search: "ctrl+k",
            newSnippet: "ctrl+n",
            copy: "ctrl+c",
            help: "ctrl+/",
          },
        },
      };

      await setDoc(userRef, defaultUserData);
      return defaultUserData;
    }

    return userDoc.data();
  } catch (error) {
    console.error("Error initializing user document:", error);
    throw error;
  }
};

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }

    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, { preferences }, { merge: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

/**
 * Verify Firestore connection and collections
 * Useful for testing and debugging
 */
export const verifyFirestoreConnection = async () => {
  try {
    // Try to read from a collection (will fail if Firestore is not configured)
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, limit(1));
    await getDocs(q);

    return {
      connected: true,
      collections: Object.values(COLLECTIONS),
    };
  } catch (error) {
    console.error("Firestore connection error:", error);
    return {
      connected: false,
      error: error.message,
    };
  }
};

/**
 * Create a new snippet document structure
 * Returns a properly formatted snippet object
 */
export const createSnippetDocument = (userId, snippetData) => {
  return {
    userId,
    title: snippetData.title || "Untitled Snippet",
    description: snippetData.description || "",
    code: snippetData.code || "",
    language: snippetData.language || "javascript",
    tags: snippetData.tags || [],
    collectionId: snippetData.collectionId || null,
    metadata: {
      usageNotes: snippetData.metadata?.usageNotes || "",
      dependencies: snippetData.metadata?.dependencies || "",
      author: snippetData.metadata?.author || "",
    },
    sharing: {
      isShared: false,
      sharedWith: [],
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastEditedBy: userId,
  };
};

/**
 * Create a new collection document structure
 */
export const createCollectionDocument = (userId, collectionData) => {
  return {
    userId,
    name: collectionData.name || "New Collection",
    parentId: collectionData.parentId || null,
    path: collectionData.path || [],
    isTeamCollection: collectionData.isTeamCollection || false,
    teamMembers: collectionData.teamMembers || [],
    createdAt: serverTimestamp(),
    order: collectionData.order || 0,
  };
};

/**
 * Create a new tag document structure
 */
export const createTagDocument = (userId, tagName) => {
  return {
    userId,
    name: tagName,
    usageCount: 1,
    lastUsed: serverTimestamp(),
  };
};

/**
 * Validate snippet data structure
 */
export const validateSnippetData = (snippetData) => {
  const errors = [];

  if (!snippetData.title || snippetData.title.trim() === "") {
    errors.push("Title is required");
  }

  if (snippetData.title && snippetData.title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  if (snippetData.description && snippetData.description.length > 2000) {
    errors.push("Description must be less than 2000 characters");
  }

  if (!snippetData.code || snippetData.code.trim() === "") {
    errors.push("Code content is required");
  }

  if (!snippetData.language) {
    errors.push("Programming language is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate collection data structure
 */
export const validateCollectionData = (collectionData) => {
  const errors = [];

  if (!collectionData.name || collectionData.name.trim() === "") {
    errors.push("Collection name is required");
  }

  if (collectionData.name && collectionData.name.length > 100) {
    errors.push("Collection name must be less than 100 characters");
  }

  if (collectionData.path && collectionData.path.length > 5) {
    errors.push("Collection nesting cannot exceed 5 levels");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  COLLECTIONS,
  initializeUserDocument,
  getUserDocument,
  updateUserPreferences,
  verifyFirestoreConnection,
  createSnippetDocument,
  createCollectionDocument,
  createTagDocument,
  validateSnippetData,
  validateCollectionData,
};
