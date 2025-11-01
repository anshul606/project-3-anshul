import { createContext, useReducer, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { COLLECTIONS } from "../services/firestoreService";
import * as snippetService from "../services/snippetService";

// Action types
export const SNIPPET_ACTIONS = {
  ADD_SNIPPET: "ADD_SNIPPET",
  UPDATE_SNIPPET: "UPDATE_SNIPPET",
  DELETE_SNIPPET: "DELETE_SNIPPET",
  SET_SNIPPETS: "SET_SNIPPETS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

// Initial state
const initialState = {
  snippets: [],
  loading: false,
  error: null,
};

// Reducer function
const snippetReducer = (state, action) => {
  switch (action.type) {
    case SNIPPET_ACTIONS.ADD_SNIPPET:
      return {
        ...state,
        snippets: [action.payload, ...state.snippets],
        error: null,
      };

    case SNIPPET_ACTIONS.UPDATE_SNIPPET:
      return {
        ...state,
        snippets: state.snippets.map((snippet) =>
          snippet.id === action.payload.id ? action.payload : snippet
        ),
        error: null,
      };

    case SNIPPET_ACTIONS.DELETE_SNIPPET:
      return {
        ...state,
        snippets: state.snippets.filter(
          (snippet) => snippet.id !== action.payload
        ),
        error: null,
      };

    case SNIPPET_ACTIONS.SET_SNIPPETS:
      return {
        ...state,
        snippets: action.payload,
        loading: false,
        error: null,
      };

    case SNIPPET_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SNIPPET_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

// Create context
export const SnippetContext = createContext();

// Provider component
export const SnippetProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(snippetReducer, initialState);

  // Set up real-time Firestore listener
  useEffect(() => {
    if (!userId) {
      dispatch({ type: SNIPPET_ACTIONS.SET_SNIPPETS, payload: [] });
      return;
    }

    dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: true });

    // Create query for user's snippets
    const snippetsRef = collection(db, COLLECTIONS.SNIPPETS);
    const q = query(
      snippetsRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const snippets = [];
        querySnapshot.forEach((doc) => {
          snippets.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        dispatch({ type: SNIPPET_ACTIONS.SET_SNIPPETS, payload: snippets });
      },
      (error) => {
        console.error("Error listening to snippets:", error);
        dispatch({
          type: SNIPPET_ACTIONS.SET_ERROR,
          payload: error.message,
        });
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId]);

  // Action creators
  const addSnippet = useCallback(
    async (snippetData) => {
      try {
        if (!userId) {
          throw new Error("User must be authenticated to create snippets");
        }
        dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: true });
        const newSnippet = await snippetService.createSnippet(
          userId,
          snippetData
        );
        // Real-time listener will handle adding to state
        dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: false });
        return newSnippet;
      } catch (error) {
        dispatch({
          type: SNIPPET_ACTIONS.SET_ERROR,
          payload: error.message,
        });
        throw error;
      }
    },
    [userId]
  );

  const updateSnippet = useCallback(
    async (snippetId, updates) => {
      try {
        dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: true });
        const updatedSnippet = await snippetService.updateSnippet(
          snippetId,
          updates,
          userId
        );
        // Real-time listener will handle updating state
        dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: false });
        return updatedSnippet;
      } catch (error) {
        dispatch({
          type: SNIPPET_ACTIONS.SET_ERROR,
          payload: error.message,
        });
        throw error;
      }
    },
    [userId]
  );

  const deleteSnippet = useCallback(async (snippetId) => {
    try {
      dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: true });
      await snippetService.deleteSnippet(snippetId);
      // Real-time listener will handle removing from state
      dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      dispatch({
        type: SNIPPET_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      throw error;
    }
  }, []);

  const searchSnippets = useCallback(
    async (searchQuery, filters) => {
      try {
        dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: true });
        const results = await snippetService.searchSnippets(
          userId,
          searchQuery,
          filters
        );
        dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: false });
        return results;
      } catch (error) {
        dispatch({
          type: SNIPPET_ACTIONS.SET_ERROR,
          payload: error.message,
        });
        throw error;
      }
    },
    [userId]
  );

  const shareSnippet = useCallback(async (snippetId, userIds, permission) => {
    try {
      dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: true });
      const sharedSnippet = await snippetService.shareSnippet(
        snippetId,
        userIds,
        permission
      );
      // Real-time listener will handle updating state
      dispatch({ type: SNIPPET_ACTIONS.SET_LOADING, payload: false });
      return sharedSnippet;
    } catch (error) {
      dispatch({
        type: SNIPPET_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: SNIPPET_ACTIONS.SET_ERROR, payload: null });
  }, []);

  // Selectors for filtering and sorting
  const getSnippetById = useCallback(
    (snippetId) => {
      return state.snippets.find((snippet) => snippet.id === snippetId);
    },
    [state.snippets]
  );

  const getSnippetsByLanguage = useCallback(
    (language) => {
      return state.snippets.filter((snippet) => snippet.language === language);
    },
    [state.snippets]
  );

  const getSnippetsByTag = useCallback(
    (tag) => {
      return state.snippets.filter((snippet) => snippet.tags.includes(tag));
    },
    [state.snippets]
  );

  const getSnippetsByCollection = useCallback(
    (collectionId) => {
      return state.snippets.filter(
        (snippet) => snippet.collectionId === collectionId
      );
    },
    [state.snippets]
  );

  const getSortedSnippets = useCallback(
    (sortBy = "updatedAt", direction = "desc") => {
      const sorted = [...state.snippets].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue instanceof Date && bValue instanceof Date) {
          return direction === "desc"
            ? bValue.getTime() - aValue.getTime()
            : aValue.getTime() - bValue.getTime();
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction === "desc"
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }

        return 0;
      });

      return sorted;
    },
    [state.snippets]
  );

  const getFilteredSnippets = useCallback(
    (filters) => {
      let filtered = [...state.snippets];

      if (filters.languages && filters.languages.length > 0) {
        filtered = filtered.filter((snippet) =>
          filters.languages.includes(snippet.language)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((snippet) =>
          filters.tags.some((tag) => snippet.tags.includes(tag))
        );
      }

      if (filters.collections && filters.collections.length > 0) {
        filtered = filtered.filter((snippet) =>
          filters.collections.includes(snippet.collectionId)
        );
      }

      if (filters.dateRange) {
        if (filters.dateRange.start) {
          filtered = filtered.filter(
            (snippet) =>
              new Date(snippet.createdAt) >= new Date(filters.dateRange.start)
          );
        }
        if (filters.dateRange.end) {
          filtered = filtered.filter(
            (snippet) =>
              new Date(snippet.createdAt) <= new Date(filters.dateRange.end)
          );
        }
      }

      return filtered;
    },
    [state.snippets]
  );

  const getAllLanguages = useCallback(() => {
    const languages = new Set();
    state.snippets.forEach((snippet) => {
      if (snippet.language) {
        languages.add(snippet.language);
      }
    });
    return Array.from(languages).sort();
  }, [state.snippets]);

  const getAllTags = useCallback(() => {
    const tags = new Set();
    state.snippets.forEach((snippet) => {
      snippet.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [state.snippets]);

  const value = {
    // State
    snippets: state.snippets,
    loading: state.loading,
    error: state.error,

    // Actions
    addSnippet,
    updateSnippet,
    deleteSnippet,
    searchSnippets,
    shareSnippet,
    clearError,

    // Selectors
    getSnippetById,
    getSnippetsByLanguage,
    getSnippetsByTag,
    getSnippetsByCollection,
    getSortedSnippets,
    getFilteredSnippets,
    getAllLanguages,
    getAllTags,
  };

  return (
    <SnippetContext.Provider value={value}>{children}</SnippetContext.Provider>
  );
};
