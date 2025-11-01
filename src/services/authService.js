import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

class AuthService {
  /**
   * Sign up a new user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<UserCredential>} Firebase user credential
   */
  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in an existing user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<UserCredential>} Firebase user credential
   */
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google OAuth provider
   * @returns {Promise<UserCredential>} Firebase user credential
   */
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email to user
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Subscribe to authentication state changes
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Handle Firebase authentication errors and return user-friendly messages
   * @param {Error} error - Firebase error object
   * @returns {Error} Error with user-friendly message
   */
  handleAuthError(error) {
    let message = "An error occurred during authentication";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "This email is already registered";
        break;
      case "auth/invalid-email":
        message = "Invalid email address";
        break;
      case "auth/operation-not-allowed":
        message = "Operation not allowed";
        break;
      case "auth/weak-password":
        message = "Password is too weak. Use at least 6 characters";
        break;
      case "auth/user-disabled":
        message = "This account has been disabled";
        break;
      case "auth/user-not-found":
        message = "No account found with this email";
        break;
      case "auth/wrong-password":
        message = "Incorrect password";
        break;
      case "auth/invalid-credential":
        message = "Invalid email or password";
        break;
      case "auth/popup-closed-by-user":
        message = "Sign-in popup was closed";
        break;
      case "auth/cancelled-popup-request":
        message = "Sign-in was cancelled";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your connection";
        break;
      default:
        message = error.message || message;
    }

    const customError = new Error(message);
    customError.code = error.code;
    return customError;
  }
}

// Export a singleton instance
export default new AuthService();
