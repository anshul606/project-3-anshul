/**
 * Search Service
 * Provides client-side search logic for snippets with caching
 */

// Cache configuration
const CACHE_KEY = "snippet_search_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cache service for search results
 */
class SearchCache {
  static set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to cache search results:", error);
    }
  }

  static get(key) {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn("Failed to retrieve cached search results:", error);
      return null;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(`${CACHE_KEY}_${key}`);
    } catch (error) {
      console.warn("Failed to remove cached search results:", error);
    }
  }

  static clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear search cache:", error);
    }
  }
}

/**
 * Generate cache key from search query and filters
 */
const generateCacheKey = (query, filters) => {
  const filterString = JSON.stringify({
    languages: filters.languages?.sort() || [],
    tags: filters.tags?.sort() || [],
    collections: filters.collections?.sort() || [],
    dateRange: filters.dateRange || {},
  });
  return `${query}_${filterString}`;
};

/**
 * Highlight matched text in a string
 * @param {string} text - The text to highlight
 * @param {string} query - The search query
 * @returns {Array} Array of text segments with highlight flags
 */
export const highlightMatches = (text, query) => {
  if (!query || !text) {
    return [{ text, highlighted: false }];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const segments = [];
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerQuery);
  while (index !== -1) {
    // Add non-highlighted text before match
    if (index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, index),
        highlighted: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: text.substring(index, index + query.length),
      highlighted: true,
    });

    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      highlighted: false,
    });
  }

  return segments;
};

/**
 * Search snippets by query string
 * Searches in title, description, code, and tags
 * @param {Array} snippets - Array of snippets to search
 * @param {string} query - Search query string
 * @returns {Array} Filtered snippets with match information
 */
export const searchByQuery = (snippets, query) => {
  if (!query || query.trim() === "") {
    return snippets.map((snippet) => ({
      ...snippet,
      matchedFields: [],
    }));
  }

  const lowerQuery = query.toLowerCase().trim();

  return snippets
    .map((snippet) => {
      const matchedFields = [];
      let matchScore = 0;

      // Search in title (highest priority)
      if (snippet.title.toLowerCase().includes(lowerQuery)) {
        matchedFields.push("title");
        matchScore += 10;
      }

      // Search in description
      if (snippet.description.toLowerCase().includes(lowerQuery)) {
        matchedFields.push("description");
        matchScore += 5;
      }

      // Search in code
      if (snippet.code.toLowerCase().includes(lowerQuery)) {
        matchedFields.push("code");
        matchScore += 3;
      }

      // Search in tags
      const matchingTags = snippet.tags.filter((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );
      if (matchingTags.length > 0) {
        matchedFields.push("tags");
        matchScore += 7 * matchingTags.length;
      }

      // Return snippet with match info if any field matched
      if (matchedFields.length > 0) {
        return {
          ...snippet,
          matchedFields,
          matchScore,
        };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by relevance
};

/**
 * Filter snippets by language
 * @param {Array} snippets - Array of snippets to filter
 * @param {Array} languages - Array of language names to filter by
 * @returns {Array} Filtered snippets
 */
export const filterByLanguage = (snippets, languages) => {
  if (!languages || languages.length === 0) {
    return snippets;
  }

  return snippets.filter((snippet) => languages.includes(snippet.language));
};

/**
 * Filter snippets by tags
 * @param {Array} snippets - Array of snippets to filter
 * @param {Array} tags - Array of tags to filter by
 * @returns {Array} Filtered snippets
 */
export const filterByTags = (snippets, tags) => {
  if (!tags || tags.length === 0) {
    return snippets;
  }

  return snippets.filter((snippet) =>
    tags.some((tag) => snippet.tags.includes(tag))
  );
};

/**
 * Filter snippets by date range
 * @param {Array} snippets - Array of snippets to filter
 * @param {Object} dateRange - Date range with start and end dates
 * @returns {Array} Filtered snippets
 */
export const filterByDateRange = (snippets, dateRange) => {
  if (!dateRange || (!dateRange.start && !dateRange.end)) {
    return snippets;
  }

  return snippets.filter((snippet) => {
    const createdAt = snippet.createdAt?.toDate
      ? snippet.createdAt.toDate()
      : new Date(snippet.createdAt);

    if (dateRange.start && createdAt < new Date(dateRange.start)) {
      return false;
    }

    if (dateRange.end && createdAt > new Date(dateRange.end)) {
      return false;
    }

    return true;
  });
};

/**
 * Apply all filters to snippets
 * @param {Array} snippets - Array of snippets to filter
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered snippets
 */
export const applyFilters = (snippets, filters = {}) => {
  let filtered = [...snippets];

  // Apply language filter
  if (filters.languages && filters.languages.length > 0) {
    filtered = filterByLanguage(filtered, filters.languages);
  }

  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filterByTags(filtered, filters.tags);
  }

  // Apply date range filter
  if (filters.dateRange) {
    filtered = filterByDateRange(filtered, filters.dateRange);
  }

  return filtered;
};

/**
 * Main search function with caching
 * @param {Array} snippets - Array of snippets to search
 * @param {string} query - Search query string
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered and searched snippets
 */
export const searchSnippets = (snippets, query = "", filters = {}) => {
  // Generate cache key
  const cacheKey = generateCacheKey(query, filters);

  // Check cache
  const cached = SearchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Apply filters first
  let results = applyFilters(snippets, filters);

  // Then apply search query
  results = searchByQuery(results, query);

  // Cache results
  SearchCache.set(cacheKey, results);

  return results;
};

/**
 * Clear search cache
 */
export const clearSearchCache = () => {
  SearchCache.clear();
};

export default {
  searchSnippets,
  searchByQuery,
  applyFilters,
  filterByLanguage,
  filterByTags,
  filterByDateRange,
  highlightMatches,
  clearSearchCache,
};
