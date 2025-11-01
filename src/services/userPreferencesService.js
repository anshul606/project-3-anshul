import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Service for managing user preferences in Firestore
 */
class UserPreferencesService {
  /**
   * Get user preferences from Firestore
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} User preferences object
   */
  async getUserPreferences(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data().preferences || this.getDefaultPreferences();
      }

      // If user document doesn't exist, create it with default preferences
      const defaultPreferences = this.getDefaultPreferences();
      await this.createUserDocument(userId, defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error("Error getting user preferences:", error);
      throw new Error("Failed to load user preferences");
    }
  }

  /**
   * Update user preferences in Firestore
   * @param {string} userId - User's ID
   * @param {Object} preferences - Preferences object to update
   * @returns {Promise<void>}
   */
  async updateUserPreferences(userId, preferences) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          preferences: preferences,
          updatedAt: new Date(),
        });
      } else {
        await this.createUserDocument(userId, preferences);
      }
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw new Error("Failed to save user preferences");
    }
  }

  /**
   * Create user document with initial preferences
   * @param {string} userId - User's ID
   * @param {Object} preferences - Initial preferences
   * @returns {Promise<void>}
   */
  async createUserDocument(userId, preferences) {
    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        preferences: preferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating user document:", error);
      throw new Error("Failed to create user preferences");
    }
  }

  /**
   * Get default preferences
   * @returns {Object} Default preferences object
   */
  getDefaultPreferences() {
    return {
      theme: "light",
      defaultLanguage: "javascript",
      keyboardShortcuts: {
        search: "ctrl+k",
        newSnippet: "ctrl+n",
        copySnippet: "ctrl+c",
        help: "ctrl+/",
      },
    };
  }
}

// Export a singleton instance
export default new UserPreferencesService();
