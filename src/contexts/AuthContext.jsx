import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

/**
 * Custom hook to use the AuthContext
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider component to manage authentication state globally
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Sign up a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const signUp = async (email, password) => {
    try {
      setError(null);
      const userCredential = await authService.signUp(email, password);
      setUser(userCredential.user);
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const signIn = async (email, password) => {
    try {
      setError(null);
      const userCredential = await authService.signIn(email, password);
      setUser(userCredential.user);
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const userCredential = await authService.signInWithGoogle();
      setUser(userCredential.user);
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Send password reset email
   * @param {string} email - User's email
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
