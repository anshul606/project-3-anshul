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
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./firestoreService";

/**
 * Collection Service
 * Handles all collection-related operations including CRUD and hierarchy management
 */

// Error types
export const ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  PERMISSION: "PERMISSION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

// Maximum nesting depth for collections
const MAX_DEPTH = 5;

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
 */
const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorType = categorizeError(error);

      if (errorType !== ERROR_TYPES.NETWORK || attempt === maxRetries - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Validate collection data
 */
const validateCollectionData = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("Collection name is required");
  }

  if (data.name && data.name.length > 100) {
    errors.push("Collection name must be 100 characters or less");
  }

  if (data.path && data.path.length >= MAX_DEPTH) {
    errors.push(
      `Collections cannot be nested more than ${MAX_DEPTH} levels deep`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Create a new collection
 * @param {string} userId - The ID of the user creating the collection
 * @param {Object} collectionData - The collection data
 * @returns {Promise<Object>} The created collection with ID
 */
export const createCollection = async (userId, collectionData) => {
  try {
    if (!userId) {
      const error = new Error("User ID is required to create a collection");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    // Validate collection data
    const validation = validateCollectionData(collectionData);
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(", "));
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    // Calculate path for hierarchy
    let path = [];
    if (collectionData.parentId) {
      const parentDoc = await getCollection(collectionData.parentId);
      if (!parentDoc) {
        const error = new Error("Parent collection not found");
        error.type = ERROR_TYPES.NOT_FOUND;
        throw error;
      }
      path = [...parentDoc.path, parentDoc.id];
    }

    // Create collection document
    const collectionDoc = {
      userId,
      name: collectionData.name.trim(),
      parentId: collectionData.parentId || null,
      path,
      isTeamCollection: collectionData.isTeamCollection || false,
      teamMembers: collectionData.teamMembers || [],
      order: collectionData.order || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Generate new document reference
    const collectionRef = doc(collection(db, COLLECTIONS.COLLECTIONS));

    // Save to Firestore with retry logic
    await retryOperation(async () => {
      await setDoc(collectionRef, collectionDoc);
    });

    return {
      id: collectionRef.id,
      ...collectionDoc,
    };
  } catch (error) {
    console.error("Error creating collection:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Update an existing collection
 * @param {string} collectionId - The ID of the collection to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} The updated collection
 */
export const updateCollection = async (collectionId, updates) => {
  try {
    if (!collectionId) {
      const error = new Error("Collection ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, collectionId);

    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Remove undefined values and protected fields
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.path; // Path is managed by the system
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Validate if name is being updated
    if (updateData.name) {
      const validation = validateCollectionData({ name: updateData.name });
      if (!validation.isValid) {
        const error = new Error(validation.errors.join(", "));
        error.type = ERROR_TYPES.VALIDATION;
        throw error;
      }
      updateData.name = updateData.name.trim();
    }

    // Update with retry logic
    await retryOperation(async () => {
      await updateDoc(collectionRef, updateData);
    });

    // Fetch and return updated collection
    const updatedDoc = await getDoc(collectionRef);
    if (!updatedDoc.exists()) {
      const error = new Error("Collection not found after update");
      error.type = ERROR_TYPES.NOT_FOUND;
      throw error;
    }

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error("Error updating collection:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Delete a collection and optionally its subcollections
 * @param {string} collectionId - The ID of the collection to delete
 * @param {boolean} deleteSubcollections - Whether to delete subcollections
 * @returns {Promise<void>}
 */
export const deleteCollection = async (
  collectionId,
  deleteSubcollections = false
) => {
  try {
    if (!collectionId) {
      const error = new Error("Collection ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    if (deleteSubcollections) {
      // Get all subcollections
      const subcollections = await getSubcollections(collectionId);

      // Delete all subcollections recursively
      for (const subcollection of subcollections) {
        await deleteCollection(subcollection.id, true);
      }
    } else {
      // Check if collection has subcollections
      const subcollections = await getSubcollections(collectionId);
      if (subcollections.length > 0) {
        const error = new Error(
          "Cannot delete collection with subcollections. Delete subcollections first or use deleteSubcollections option."
        );
        error.type = ERROR_TYPES.VALIDATION;
        throw error;
      }
    }

    const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, collectionId);

    // Delete with retry logic
    await retryOperation(async () => {
      await deleteDoc(collectionRef);
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Get a single collection by ID
 * @param {string} collectionId - The ID of the collection to retrieve
 * @returns {Promise<Object|null>} The collection or null if not found
 */
export const getCollection = async (collectionId) => {
  try {
    if (!collectionId) {
      const error = new Error("Collection ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, collectionId);

    // Fetch with retry logic
    const collectionDoc = await retryOperation(async () => {
      return await getDoc(collectionRef);
    });

    if (!collectionDoc.exists()) {
      return null;
    }

    return {
      id: collectionDoc.id,
      ...collectionDoc.data(),
    };
  } catch (error) {
    console.error("Error getting collection:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Get all collections for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of collections
 */
export const getUserCollections = async (userId) => {
  try {
    if (!userId) {
      const error = new Error("User ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const collectionsRef = collection(db, COLLECTIONS.COLLECTIONS);
    const q = query(
      collectionsRef,
      where("userId", "==", userId),
      orderBy("order", "asc")
    );

    // Execute query with retry logic
    const querySnapshot = await retryOperation(async () => {
      return await getDocs(q);
    });

    const collections = [];
    querySnapshot.forEach((doc) => {
      collections.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return collections;
  } catch (error) {
    console.error("Error getting user collections:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Get subcollections of a parent collection
 * @param {string} parentId - The ID of the parent collection
 * @returns {Promise<Array>} Array of subcollections
 */
export const getSubcollections = async (parentId) => {
  try {
    if (!parentId) {
      const error = new Error("Parent ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const collectionsRef = collection(db, COLLECTIONS.COLLECTIONS);
    const q = query(
      collectionsRef,
      where("parentId", "==", parentId),
      orderBy("order", "asc")
    );

    // Execute query with retry logic
    const querySnapshot = await retryOperation(async () => {
      return await getDocs(q);
    });

    const subcollections = [];
    querySnapshot.forEach((doc) => {
      subcollections.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return subcollections;
  } catch (error) {
    console.error("Error getting subcollections:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Move a collection to a new parent
 * @param {string} collectionId - The ID of the collection to move
 * @param {string|null} newParentId - The ID of the new parent (null for root)
 * @returns {Promise<Object>} The updated collection
 */
export const moveCollection = async (collectionId, newParentId) => {
  try {
    if (!collectionId) {
      const error = new Error("Collection ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    // Get the collection to move
    const collectionToMove = await getCollection(collectionId);
    if (!collectionToMove) {
      const error = new Error("Collection not found");
      error.type = ERROR_TYPES.NOT_FOUND;
      throw error;
    }

    // Calculate new path
    let newPath = [];
    if (newParentId) {
      const newParent = await getCollection(newParentId);
      if (!newParent) {
        const error = new Error("New parent collection not found");
        error.type = ERROR_TYPES.NOT_FOUND;
        throw error;
      }

      // Check if moving would exceed max depth
      if (newParent.path.length >= MAX_DEPTH - 1) {
        const error = new Error(
          `Cannot move collection: would exceed maximum depth of ${MAX_DEPTH} levels`
        );
        error.type = ERROR_TYPES.VALIDATION;
        throw error;
      }

      // Check if trying to move to its own descendant
      if (newParent.path.includes(collectionId)) {
        const error = new Error("Cannot move collection to its own descendant");
        error.type = ERROR_TYPES.VALIDATION;
        throw error;
      }

      newPath = [...newParent.path, newParent.id];
    }

    // Update the collection
    const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, collectionId);
    await retryOperation(async () => {
      await updateDoc(collectionRef, {
        parentId: newParentId,
        path: newPath,
        updatedAt: serverTimestamp(),
      });
    });

    // Update all subcollections recursively
    await updateSubcollectionPaths(collectionId, [...newPath, collectionId]);

    // Fetch and return updated collection
    const updatedDoc = await getDoc(collectionRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error("Error moving collection:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Update paths for all subcollections recursively
 * @param {string} parentId - The ID of the parent collection
 * @param {Array} newParentPath - The new path of the parent
 */
const updateSubcollectionPaths = async (parentId, newParentPath) => {
  const subcollections = await getSubcollections(parentId);

  for (const subcollection of subcollections) {
    const newPath = newParentPath;
    const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, subcollection.id);

    await retryOperation(async () => {
      await updateDoc(collectionRef, {
        path: newPath,
        updatedAt: serverTimestamp(),
      });
    });

    // Recursively update subcollections
    await updateSubcollectionPaths(subcollection.id, [
      ...newPath,
      subcollection.id,
    ]);
  }
};

/**
 * Reorder collections
 * @param {Array} collectionOrders - Array of {id, order} objects
 * @returns {Promise<void>}
 */
export const reorderCollections = async (collectionOrders) => {
  try {
    if (!Array.isArray(collectionOrders) || collectionOrders.length === 0) {
      return;
    }

    const batch = writeBatch(db);

    collectionOrders.forEach(({ id, order }) => {
      const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, id);
      batch.update(collectionRef, {
        order,
        updatedAt: serverTimestamp(),
      });
    });

    await retryOperation(async () => {
      await batch.commit();
    });
  } catch (error) {
    console.error("Error reordering collections:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Add team members to a collection
 * @param {string} collectionId - The ID of the collection
 * @param {Array} userIds - Array of user IDs to add as team members
 * @returns {Promise<Object>} The updated collection
 */
export const addTeamMembers = async (collectionId, userIds) => {
  try {
    if (!collectionId) {
      const error = new Error("Collection ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      const error = new Error("At least one user ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, collectionId);

    // Get current collection
    const collectionDoc = await retryOperation(async () => {
      return await getDoc(collectionRef);
    });

    if (!collectionDoc.exists()) {
      const error = new Error("Collection not found");
      error.type = ERROR_TYPES.NOT_FOUND;
      throw error;
    }

    const currentData = collectionDoc.data();
    const currentTeamMembers = currentData.teamMembers || [];

    // Add new team members (avoid duplicates)
    const newTeamMembers = [...new Set([...currentTeamMembers, ...userIds])];

    // Update collection
    const updateData = {
      isTeamCollection: true,
      teamMembers: newTeamMembers,
      updatedAt: serverTimestamp(),
    };

    await retryOperation(async () => {
      await updateDoc(collectionRef, updateData);
    });

    // Return updated collection
    const updatedDoc = await getDoc(collectionRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error("Error adding team members:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

/**
 * Remove team members from a collection
 * @param {string} collectionId - The ID of the collection
 * @param {Array} userIds - Array of user IDs to remove
 * @returns {Promise<Object>} The updated collection
 */
export const removeTeamMembers = async (collectionId, userIds) => {
  try {
    if (!collectionId) {
      const error = new Error("Collection ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      const error = new Error("At least one user ID is required");
      error.type = ERROR_TYPES.VALIDATION;
      throw error;
    }

    const collectionRef = doc(db, COLLECTIONS.COLLECTIONS, collectionId);

    // Get current collection
    const collectionDoc = await retryOperation(async () => {
      return await getDoc(collectionRef);
    });

    if (!collectionDoc.exists()) {
      const error = new Error("Collection not found");
      error.type = ERROR_TYPES.NOT_FOUND;
      throw error;
    }

    const currentData = collectionDoc.data();
    const currentTeamMembers = currentData.teamMembers || [];

    // Remove specified team members
    const newTeamMembers = currentTeamMembers.filter(
      (memberId) => !userIds.includes(memberId)
    );

    // Update collection
    const updateData = {
      teamMembers: newTeamMembers,
      isTeamCollection: newTeamMembers.length > 0,
      updatedAt: serverTimestamp(),
    };

    await retryOperation(async () => {
      await updateDoc(collectionRef, updateData);
    });

    // Return updated collection
    const updatedDoc = await getDoc(collectionRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error("Error removing team members:", error);
    error.type = error.type || categorizeError(error);
    throw error;
  }
};

export default {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollection,
  getUserCollections,
  getSubcollections,
  moveCollection,
  reorderCollections,
  addTeamMembers,
  removeTeamMembers,
  ERROR_TYPES,
  MAX_DEPTH,
};
