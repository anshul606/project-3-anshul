import { useContext } from "react";
import { CollectionContext } from "../contexts/CollectionContext";

/**
 * Custom hook to use the CollectionContext
 * Provides access to collections state and actions
 */
const useCollections = () => {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error("useCollections must be used within a CollectionProvider");
  }

  return context;
};

export default useCollections;
