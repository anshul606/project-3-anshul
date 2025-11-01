import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  or,
  and,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  COLLECTIONS,
  createSnippetDocument,
  validateSnippetData,
} from "./firestoreService";

/**
 * Snippet Service
 * Handles all snippet-related operations including CRUD, search, and sharing
 */

// Error types for better error handling
export const ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  PERMISSION: "PERMISSION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * Categorize Firebase errors
 */
const categorizeError = (error) => {
  if (error.code === "permission-denied") {
    return ERROR_TYPES.PERMISSION;
  }
  if (error.code === "not-found") {
    return ERROR_TYPES.NOT_FOUND;
  }
  if (error.code === "unavailable" || error.code === "deadline-exceeded") {
    return ERROR_TYPES.NETWORK;
  }
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Retry logic for network failures
 * Retries the operation up to maxRetries times with exponential backoff
 */
const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorType = categorizeError(error);

      // Only retry network errors
      if (errorType !== ERROR_TYPES.NETWORK || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: wait longer between each retry
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Create a new snippet
 * @param {string} userId - The ID of the user creating the snippet
 * @param {Object} snippetData - The snippet data
 * @returns {Promise<Object>} The created snippet with ID
 */
export const createSnippet = async (userId, snippetData) => {
  try {
    // Validate userId
    if (!userId) {
      const error = new Error("User ID is required to create a snippet");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    // Validate snippet data
    const validation = validateSnippetData(snippetData);
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(", "));
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    // Create snippet document
    const snippetDoc = createSnippetDocument(userId, snippetData);

    // Generate new document reference
    const snippetRef = doc(collection(db, COLLECTIONS.SNIPPETS));

    // Save to Firestore with retry logic
    await retryOperation(async () => {
      await setDoc(snippetRef, snippetDoc);
    });

    return {
      id: snippetRef.id,
      ...snippetDoc,
    };
  } catch (error) {
    console.error("Error creating snippet:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Update an existing snippet
 * @param {string} snippetId - The ID of the snippet to update
 * @param {Object} updates - The fields to update
 * @param {string} userId - The ID of the user making the update
 * @returns {Promise<Object>} The updated snippet
 */
export const updateSnippet = async (snippetId, updates, userId) => {
  try {
    if (!snippetId) {
      const error = new Error("Snippet ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const snippetRef = doc(db, COLLECTIONS.SNIPPETS, snippetId);

    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
      lastEditedBy: userId,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Update with retry logic
    await retryOperation(async () => {
      await updateDoc(snippetRef, updateData);
    });

    // Fetch and return updated snippet
    const updatedDoc = await getDoc(snippetRef);
    if (!updatedDoc.exists()) {
      const error = new Error("Snippet not found after update");
      error.type = ERROR_TYPES.NOT_FOUND;
      throw error;
    }

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error("Error updating snippet:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Delete a snippet
 * @param {string} snippetId - The ID of the snippet to delete
 * @returns {Promise<void>}
 */
export const deleteSnippet = async (snippetId) => {
  try {
    if (!snippetId) {
      const error = new Error("Snippet ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const snippetRef = doc(db, COLLECTIONS.SNIPPETS, snippetId);

    // Delete with retry logic
    await retryOperation(async () => {
      await deleteDoc(snippetRef);
    });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Get a single snippet by ID
 * @param {string} snippetId - The ID of the snippet to retrieve
 * @returns {Promise<Object|null>} The snippet or null if not found
 */
export const getSnippet = async (snippetId) => {
  try {
    if (!snippetId) {
      const error = new Error("Snippet ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const snippetRef = doc(db, COLLECTIONS.SNIPPETS, snippetId);

    // Fetch with retry logic
    const snippetDoc = await retryOperation(async () => {
      return await getDoc(snippetRef);
    });

    if (!snippetDoc.exists()) {
      return null;
    }

    return {
      id: snippetDoc.id,
      ...snippetDoc.data(),
    };
  } catch (error) {
    console.error("Error getting snippet:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Get all snippets for a user with pagination support
 * @param {string} userId - The ID of the user
 * @param {Object} options - Pagination and filtering options
 * @returns {Promise<Object>} Object containing snippets array and pagination info
 */
export const getUserSnippets = async (userId, options = {}) => {
  try {
    if (!userId) {
      const error = new Error("User ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const {
      pageSize = 25,
      lastDoc = null,
      orderByField = "updatedAt",
      orderDirection = "desc",
      collectionId = null,
    } = options;

    const snippetsRef = collection(db, COLLECTIONS.SNIPPETS);

    // Build query
    let constraints = [where("userId", "==", userId)];

    // Filter by collection if specified
    if (collectionId) {
      constraints.push(where("collectionId", "==", collectionId));
    }

    // Add ordering
    constraints.push(orderBy(orderByField, orderDirection));

    // Add pagination
    constraints.push(limit(pageSize));

    // If lastDoc is provided, start after it
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(snippetsRef, ...constraints);

    // Execute query with retry logic
    const querySnapshot = await retryOperation(async () => {
      return await getDocs(q);
    });

    const snippets = [];
    let lastDocument = null;

    querySnapshot.forEach((doc) => {
      snippets.push({
        id: doc.id,
        ...doc.data(),
      });
      lastDocument = doc;
    });

    return {
      snippets,
      lastDoc: lastDocument,
      hasMore: snippets.length === pageSize,
      total: snippets.length,
    };
  } catch (error) {
    console.error("Error getting user snippets:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Search snippets with query and filter parameters
 * @param {string} userId - The ID of the user
 * @param {string} searchQuery - The search query string
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} Array of matching snippets
 */
export const searchSnippets = async (
  userId,
  searchQuery = "",
  filters = {}
) => {
  try {
    if (!userId) {
      const error = new Error("User ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const {
      languages = [],
      tags = [],
      collections = [],
      dateRange = { start: null, end: null },
    } = filters;

    const snippetsRef = collection(db, COLLECTIONS.SNIPPETS);

    // Build base query - get all user snippets
    let constraints = [where("userId", "==", userId)];

    // Apply language filter
    if (languages.length > 0) {
      constraints.push(where("language", "in", languages));
    }

    // Apply collection filter
    if (collections.length > 0) {
      constraints.push(where("collectionId", "in", collections));
    }

    // Apply date range filter
    if (dateRange.start) {
      constraints.push(where("createdAt", ">=", dateRange.start));
    }
    if (dateRange.end) {
      constraints.push(where("createdAt", "<=", dateRange.end));
    }

    // Add ordering
    constraints.push(orderBy("updatedAt", "desc"));

    const q = query(snippetsRef, ...constraints);

    // Execute query with retry logic
    const querySnapshot = await retryOperation(async () => {
      return await getDocs(q);
    });

    let snippets = [];
    querySnapshot.forEach((doc) => {
      snippets.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side filtering for tags (Firestore doesn't support array-contains-any with other filters)
    if (tags.length > 0) {
      snippets = snippets.filter((snippet) =>
        tags.some((tag) => snippet.tags.includes(tag))
      );
    }

    // Client-side search for query string
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      snippets = snippets.filter((snippet) => {
        const titleMatch = snippet.title.toLowerCase().includes(query);
        const descriptionMatch = snippet.description
          .toLowerCase()
          .includes(query);
        const codeMatch = snippet.code.toLowerCase().includes(query);
        const tagsMatch = snippet.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

        return titleMatch || descriptionMatch || codeMatch || tagsMatch;
      });
    }

    return snippets;
  } catch (error) {
    console.error("Error searching snippets:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Share a snippet with other users
 * @param {string} snippetId - The ID of the snippet to share
 * @param {Array} sharedUsers - Array of objects with email and permission {email: string, permission: 'read'|'write'}
 * @returns {Promise<Object>} The updated snippet
 */
export const shareSnippet = async (snippetId, sharedUsers) => {
  try {
    if (!snippetId) {
      const error = new Error("Snippet ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    if (!Array.isArray(sharedUsers) || sharedUsers.length === 0) {
      const error = new Error("At least one user is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    // Validate each shared user
    for (const user of sharedUsers) {
      if (!user.email || !user.permission) {
        const error = new Error("Each user must have email and permission");
        error.type = ERROR_TYPES.VALIDATION;
        throw error;
      }
      if (!["read", "write"].includes(user.permission)) {
        const error = new Error("Permission must be 'read' or 'write'");
        error.type = ERROR_TYPES.VALIDATION;
        throw error;
      }
    }

    const snippetRef = doc(db, COLLECTIONS.SNIPPETS, snippetId);

    // Get current snippet
    const snippetDoc = await retryOperation(async () => {
      return await getDoc(snippetRef);
    });

    if (!snippetDoc.exists()) {
      const error = new Error("Snippet not found");
      error.type = ERROR_TYPES.NOT_FOUND;
      throw error;
    }

    const currentData = snippetDoc.data();
    const currentSharedWith = currentData.sharing?.sharedWith || [];

    // Create new shared users list
    const newSharedWith = [...currentSharedWith];

    sharedUsers.forEach((user) => {
      // Check if user is already in the list
      const existingIndex = newSharedWith.findIndex(
        (share) => share.email === user.email
      );

      if (existingIndex >= 0) {
        // Update existing permission
        newSharedWith[existingIndex].permission = user.permission;
      } else {
        // Add new user
        newSharedWith.push({ email: user.email, permission: user.permission });
      }
    });

    // Update snippet with sharing information
    const updateData = {
      sharing: {
        isShared: true,
        sharedWith: newSharedWith,
      },
      updatedAt: serverTimestamp(),
    };

    await retryOperation(async () => {
      await updateDoc(snippetRef, updateData);
    });

    // Return updated snippet
    const updatedDoc = await getDoc(snippetRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error("Error sharing snippet:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

export default {
  createSnippet,
  updateSnippet,
  deleteSnippet,
  getSnippet,
  getUserSnippets,
  searchSnippets,
  shareSnippet,
  ERROR_TYPES,
};
