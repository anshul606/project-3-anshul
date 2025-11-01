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
import * as collectionService from "../services/collectionService";

// Action types
export const COLLECTION_ACTIONS = {
  ADD_COLLECTION: "ADD_COLLECTION",
  UPDATE_COLLECTION: "UPDATE_COLLECTION",
  DELETE_COLLECTION: "DELETE_COLLECTION",
  SET_COLLECTIONS: "SET_COLLECTIONS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

// Initial state
const initialState = {
  collections: [],
  loading: false,
  error: null,
};

// Reducer function
const collectionReducer = (state, action) => {
  switch (action.type) {
    case COLLECTION_ACTIONS.ADD_COLLECTION:
      return {
        ...state,
        collections: [...state.collections, action.payload],
        error: null,
      };

    case COLLECTION_ACTIONS.UPDATE_COLLECTION:
      return {
        ...state,
        collections: state.collections.map((collection) =>
          collection.id === action.payload.id ? action.payload : collection
        ),
        error: null,
      };

    case COLLECTION_ACTIONS.DELETE_COLLECTION:
      return {
        ...state,
        collections: state.collections.filter(
          (collection) => collection.id !== action.payload
        ),
        error: null,
      };

    case COLLECTION_ACTIONS.SET_COLLECTIONS:
      return {
        ...state,
        collections: action.payload,
        loading: false,
        error: null,
      };

    case COLLECTION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case COLLECTION_ACTIONS.SET_ERROR:
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
export const CollectionContext = createContext();

// Provider component
export const CollectionProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(collectionReducer, initialState);

  // Set up real-time Firestore listener
  useEffect(() => {
    if (!userId) {
      dispatch({ type: COLLECTION_ACTIONS.SET_COLLECTIONS, payload: [] });
      return;
    }

    dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: true });

    // Create query for user's collections
    const collectionsRef = collection(db, COLLECTIONS.COLLECTIONS);
    const q = query(
      collectionsRef,
      where("userId", "==", userId),
      orderBy("order", "asc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const collections = [];
        querySnapshot.forEach((doc) => {
          collections.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        dispatch({
          type: COLLECTION_ACTIONS.SET_COLLECTIONS,
          payload: collections,
        });
      },
      (error) => {
        console.error("Error listening to collections:", error);
        dispatch({
          type: COLLECTION_ACTIONS.SET_ERROR,
          payload: error.message,
        });
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId]);

  // Action creators
  const addCollection = useCallback(
    async (collectionData) => {
      try {
        if (!userId) {
          throw new Error("User must be authenticated to create collections");
        }
        dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: true });
        const newCollection = await collectionService.createCollection(
          userId,
          collectionData
        );
        // Real-time listener will handle adding to state
        dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: false });
        return newCollection;
      } catch (error) {
        dispatch({
          type: COLLECTION_ACTIONS.SET_ERROR,
          payload: error.message,
        });
        throw error;
      }
    },
    [userId]
  );

  const updateCollection = useCallback(async (collectionId, updates) => {
    try {
      dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: true });
      const updatedCollection = await collectionService.updateCollection(
        collectionId,
        updates
      );
      // Real-time listener will handle updating state
      dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: false });
      return updatedCollection;
    } catch (error) {
      dispatch({
        type: COLLECTION_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      throw error;
    }
  }, []);

  const deleteCollection = useCallback(
    async (collectionId, deleteSubcollections = false) => {
      try {
        dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: true });
        await collectionService.deleteCollection(
          collectionId,
          deleteSubcollections
        );
        // Real-time listener will handle removing from state
        dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: false });
      } catch (error) {
        dispatch({
          type: COLLECTION_ACTIONS.SET_ERROR,
          payload: error.message,
        });
        throw error;
      }
    },
    []
  );

  const moveCollection = useCallback(async (collectionId, newParentId) => {
    try {
      dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: true });
      const movedCollection = await collectionService.moveCollection(
        collectionId,
        newParentId
      );
      // Real-time listener will handle updating state
      dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: false });
      return movedCollection;
    } catch (error) {
      dispatch({
        type: COLLECTION_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      throw error;
    }
  }, []);

  const reorderCollections = useCallback(async (collectionOrders) => {
    try {
      dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: true });
      await collectionService.reorderCollections(collectionOrders);
      // Real-time listener will handle updating state
      dispatch({ type: COLLECTION_ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      dispatch({
        type: COLLECTION_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: COLLECTION_ACTIONS.SET_ERROR, payload: null });
  }, []);

  // Selectors
  const getCollectionById = useCallback(
    (collectionId) => {
      return state.collections.find(
        (collection) => collection.id === collectionId
      );
    },
    [state.collections]
  );

  const getRootCollections = useCallback(() => {
    return state.collections.filter(
      (collection) => !collection.parentId || collection.parentId === null
    );
  }, [state.collections]);

  const getSubcollections = useCallback(
    (parentId) => {
      return state.collections.filter(
        (collection) => collection.parentId === parentId
      );
    },
    [state.collections]
  );

  const getCollectionPath = useCallback(
    (collectionId) => {
      const collection = getCollectionById(collectionId);
      if (!collection) return [];

      const path = [];
      collection.path.forEach((id) => {
        const parent = getCollectionById(id);
        if (parent) {
          path.push(parent);
        }
      });
      path.push(collection);

      return path;
    },
    [state.collections, getCollectionById]
  );

  const value = {
    // State
    collections: state.collections,
    loading: state.loading,
    error: state.error,

    // Actions
    addCollection,
    updateCollection,
    deleteCollection,
    moveCollection,
    reorderCollections,
    clearError,

    // Selectors
    getCollectionById,
    getRootCollections,
    getSubcollections,
    getCollectionPath,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};
