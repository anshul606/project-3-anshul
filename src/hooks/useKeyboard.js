import { useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for keyboard event handling
 * Provides a centralized way to register and manage keyboard shortcuts
 *
 * @param {Object} shortcuts - Object mapping key combinations to handler functions
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether shortcuts are enabled (default: true)
 * @param {Array<string>} options.excludeElements - Element types to exclude (default: ['INPUT', 'TEXTAREA', 'SELECT'])
 *
 * @example
 * useKeyboard({
 *   'ctrl+k': () => console.log('Search'),
 *   'ctrl+n': () => console.log('New'),
 *   'escape': () => console.log('Close'),
 * });
 */
const useKeyboard = (shortcuts = {}, options = {}) => {
  const { enabled = true, excludeElements = ["INPUT", "TEXTAREA", "SELECT"] } =
    options;

  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  /**
   * Parse key combination string into normalized format
   * @param {string} combo - Key combination (e.g., 'ctrl+k', 'shift+alt+n')
   * @returns {Object} Parsed key combination
   */
  const parseKeyCombination = useCallback((combo) => {
    const parts = combo.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);

    return {
      key,
      ctrl: modifiers.includes("ctrl") || modifiers.includes("control"),
      meta: modifiers.includes("meta") || modifiers.includes("cmd"),
      shift: modifiers.includes("shift"),
      alt: modifiers.includes("alt"),
    };
  }, []);

  /**
   * Check if event matches key combination
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Object} combo - Parsed key combination
   * @returns {boolean} Whether event matches combination
   */
  const matchesKeyCombination = useCallback((event, combo) => {
    const eventKey = event.key.toLowerCase();
    const keyMatches =
      eventKey === combo.key ||
      event.code.toLowerCase() === combo.key.toLowerCase();

    // Check modifiers
    const ctrlMatches = combo.ctrl
      ? event.ctrlKey || event.metaKey
      : !event.ctrlKey;
    const metaMatches = combo.meta
      ? event.metaKey || event.ctrlKey
      : !event.metaKey;
    const shiftMatches = combo.shift ? event.shiftKey : !event.shiftKey;
    const altMatches = combo.alt ? event.altKey : !event.altKey;

    // For ctrl/meta shortcuts, we accept either ctrl or meta
    if (combo.ctrl || combo.meta) {
      return (
        keyMatches &&
        (event.ctrlKey || event.metaKey) &&
        shiftMatches &&
        altMatches
      );
    }

    return (
      keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches
    );
  }, []);

  /**
   * Handle keyboard event
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      // Skip if focus is on excluded elements (unless explicitly allowed)
      const activeElement = document.activeElement;
      const isExcludedElement = excludeElements.includes(
        activeElement?.tagName
      );

      // Check each registered shortcut
      Object.entries(shortcutsRef.current).forEach(([combo, handler]) => {
        const parsedCombo = parseKeyCombination(combo);

        // Special handling for certain shortcuts that should work everywhere
        const globalShortcuts = [
          "ctrl+k",
          "cmd+k",
          "ctrl+/",
          "cmd+/",
          "escape",
        ];
        const isGlobalShortcut = globalShortcuts.some(
          (s) => combo.toLowerCase() === s
        );

        // Skip if on excluded element and not a global shortcut
        if (isExcludedElement && !isGlobalShortcut) {
          return;
        }

        if (matchesKeyCombination(event, parsedCombo)) {
          event.preventDefault();
          handler(event);
        }
      });
    },
    [enabled, excludeElements, parseKeyCombination, matchesKeyCombination]
  );

  // Register keyboard event listener
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    parseKeyCombination,
    matchesKeyCombination,
  };
};

/**
 * Hook for handling arrow key navigation in lists
 * @param {Array} items - Array of items to navigate
 * @param {Function} onSelect - Callback when item is selected
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation state and handlers
 */
export const useArrowKeyNavigation = (items = [], onSelect, options = {}) => {
  const { enabled = true, loop = true } = options;
  const selectedIndexRef = useRef(-1);

  const handleArrowKey = useCallback(
    (direction) => {
      if (!items.length) return;

      let newIndex = selectedIndexRef.current;

      if (direction === "up") {
        newIndex = newIndex <= 0 ? (loop ? items.length - 1 : 0) : newIndex - 1;
      } else if (direction === "down") {
        newIndex =
          newIndex >= items.length - 1
            ? loop
              ? 0
              : items.length - 1
            : newIndex + 1;
      } else if (direction === "home") {
        newIndex = 0;
      } else if (direction === "end") {
        newIndex = items.length - 1;
      }

      selectedIndexRef.current = newIndex;

      if (onSelect && items[newIndex]) {
        onSelect(items[newIndex], newIndex);
      }
    },
    [items, onSelect, loop]
  );

  useKeyboard(
    {
      arrowup: () => handleArrowKey("up"),
      arrowdown: () => handleArrowKey("down"),
      home: () => handleArrowKey("home"),
      end: () => handleArrowKey("end"),
    },
    { enabled }
  );

  return {
    selectedIndex: selectedIndexRef.current,
    setSelectedIndex: (index) => {
      selectedIndexRef.current = index;
    },
    reset: () => {
      selectedIndexRef.current = -1;
    },
  };
};

export default useKeyboard;
