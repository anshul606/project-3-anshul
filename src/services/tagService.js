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
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./firestoreService";

/**
 * Tag Service
 * Handles tag-related operations including creation, retrieval, and usage tracking
 */

/**
 * Validate tag format
 * Tags can only contain alphanumeric characters and hyphens
 * @param {string} tag - The tag to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateTag = (tag) => {
  if (!tag || typeof tag !== "string") {
    return {
      isValid: false,
      error: "Tag must be a non-empty string",
    };
  }

  const trimmedTag = tag.trim();

  if (trimmedTag.length === 0) {
    return {
      isValid: false,
      error: "Tag cannot be empty",
    };
  }

  if (trimmedTag.length > 50) {
    return {
      isValid: false,
      error: "Tag must be less than 50 characters",
    };
  }

  // Validate format: alphanumeric and hyphens only
  const tagRegex = /^[a-zA-Z0-9-]+$/;
  if (!tagRegex.test(trimmedTag)) {
    return {
      isValid: false,
      error: "Tags can only contain letters, numbers, and hyphens",
    };
  }

  return {
    isValid: true,
    tag: trimmedTag.toLowerCase(), // Normalize to lowercase
  };
};

/**
 * Create or update a tag in Firestore
 * @param {string} userId - The ID of the user creating/using the tag
 * @param {string} tagName - The tag name
 * @returns {Promise<Object>} The created/updated tag
 */
export const createOrUpdateTag = async (userId, tagName) => {
  try {
    // Validate tag
    const validation = validateTag(tagName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const normalizedTag = validation.tag;

    // Create tag document ID from userId and tag name
    const tagId = `${userId}_${normalizedTag}`;
    const tagRef = doc(db, COLLECTIONS.TAGS, tagId);

    // Check if tag exists
    const tagDoc = await getDoc(tagRef);

    if (tagDoc.exists()) {
      // Update usage count and last used timestamp
      await updateDoc(tagRef, {
        usageCount: increment(1),
        lastUsed: serverTimestamp(),
      });

      return {
        id: tagDoc.id,
        ...tagDoc.data(),
        usageCount: (tagDoc.data().usageCount || 0) + 1,
      };
    } else {
      // Create new tag
      const newTag = {
        name: normalizedTag,
        userId,
        usageCount: 1,
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp(),
      };

      await setDoc(tagRef, newTag);

      return {
        id: tagId,
        ...newTag,
      };
    }
  } catch (error) {
    console.error("Error creating/updating tag:", error);
    throw error;
  }
};

/**
 * Get all tags for a user
 * @param {string} userId - The ID of the user
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of tags
 */
export const getUserTags = async (userId, options = {}) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const {
      sortBy = "usageCount",
      sortDirection = "desc",
      limitCount = 100,
    } = options;

    const tagsRef = collection(db, COLLECTIONS.TAGS);

    // Build query
    const constraints = [
      where("userId", "==", userId),
      orderBy(sortBy, sortDirection),
    ];

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(tagsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const tags = [];
    querySnapshot.forEach((doc) => {
      tags.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return tags;
  } catch (error) {
    console.error("Error getting user tags:", error);
    throw error;
  }
};

/**
 * Search tags by name prefix
 * @param {string} userId - The ID of the user
 * @param {string} searchQuery - The search query
 * @param {number} limitCount - Maximum number of results
 * @returns {Promise<Array>} Array of matching tags
 */
export const searchTags = async (userId, searchQuery, limitCount = 10) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get all user tags (we'll filter client-side for better search)
    const allTags = await getUserTags(userId, {
      sortBy: "usageCount",
      sortDirection: "desc",
      limitCount: 100,
    });

    if (!searchQuery || searchQuery.trim() === "") {
      return allTags.slice(0, limitCount);
    }

    const lowerQuery = searchQuery.toLowerCase().trim();

    // Filter tags that match the search query
    const matchingTags = allTags
      .filter((tag) => tag.name.toLowerCase().includes(lowerQuery))
      .slice(0, limitCount);

    return matchingTags;
  } catch (error) {
    console.error("Error searching tags:", error);
    throw error;
  }
};

/**
 * Update tag usage when a snippet is saved
 * @param {string} userId - The ID of the user
 * @param {Array} tags - Array of tag names
 * @returns {Promise<void>}
 */
export const updateTagUsage = async (userId, tags) => {
  try {
    if (!userId || !Array.isArray(tags)) {
      return;
    }

    // Update each tag
    const updatePromises = tags.map((tagName) =>
      createOrUpdateTag(userId, tagName)
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating tag usage:", error);
    // Don't throw - tag usage tracking is not critical
  }
};

/**
 * Get tag suggestions based on usage and recency
 * @param {string} userId - The ID of the user
 * @param {number} limitCount - Maximum number of suggestions
 * @returns {Promise<Array>} Array of suggested tag names
 */
export const getTagSuggestions = async (userId, limitCount = 20) => {
  try {
    const tags = await getUserTags(userId, {
      sortBy: "lastUsed",
      sortDirection: "desc",
      limitCount,
    });

    return tags.map((tag) => tag.name);
  } catch (error) {
    console.error("Error getting tag suggestions:", error);
    return [];
  }
};

export default {
  validateTag,
  createOrUpdateTag,
  getUserTags,
  searchTags,
  updateTagUsage,
  getTagSuggestions,
};
