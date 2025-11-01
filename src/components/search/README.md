# Search and Filter Components

This directory contains the search and filter functionality for the Code Snippet Manager application.

## Components

### SearchBar

A debounced search input component with keyboard shortcut support.

**Features:**

- Debounced input (300ms delay) for better performance
- Keyboard shortcut support (Ctrl/Cmd + K to focus)
- Clear button when text is present
- Search suggestions when focused
- Escape key to clear and blur

**Usage:**

```jsx
import { SearchBar } from "../components/search";

<SearchBar
  onSearch={(query) => console.log("Search:", query)}
  placeholder="Search snippets..."
  debounceDelay={300}
  initialValue=""
/>;
```

**Props:**

- `onSearch` (Function, required): Callback when search query changes (debounced)
- `placeholder` (String): Placeholder text for search input
- `debounceDelay` (Number): Debounce delay in milliseconds (default: 300)
- `initialValue` (String): Initial search value

### FilterPanel

A collapsible filter panel with language, tags, and date range filters.

**Features:**

- Expandable/collapsible interface
- Multiple filter types: languages, tags, date range
- Active filter count badge
- Quick filter removal from collapsed view
- Clear all filters button

**Usage:**

```jsx
import { FilterPanel } from "../components/search";

<FilterPanel
  onFilterChange={(filters) => console.log("Filters:", filters)}
  availableLanguages={["javascript", "python", "java"]}
  availableTags={["react", "api", "hooks"]}
  initialFilters={{
    languages: [],
    tags: [],
    dateRange: { start: null, end: null },
  }}
/>;
```

**Props:**

- `onFilterChange` (Function, required): Callback when filters change
- `availableLanguages` (Array): List of available programming languages
- `availableTags` (Array): List of available tags
- `initialFilters` (Object): Initial filter values

### SearchResults

Displays search results with highlighted matches and "no results" message.

**Features:**

- Result highlighting for matched text
- Shows matched fields (title, description, code, tags)
- Code preview for code matches
- Loading state
- Empty state with helpful suggestions
- Result count display

**Usage:**

```jsx
import { SearchResults } from "../components/search";

<SearchResults
  results={searchResults}
  query="react"
  loading={false}
  onSnippetClick={(snippet) => console.log("Clicked:", snippet)}
  emptyMessage="No snippets found"
/>;
```

**Props:**

- `results` (Array): Array of search result snippets
- `query` (String): Search query for highlighting
- `loading` (Boolean): Whether search is in progress
- `onSnippetClick` (Function): Callback when snippet is clicked
- `emptyMessage` (String): Custom message for no results

## Services

### searchService.js

Provides client-side search logic with caching for performance optimization.

**Functions:**

#### `searchSnippets(snippets, query, filters)`

Main search function that applies filters and search query.

**Parameters:**

- `snippets` (Array): Array of snippets to search
- `query` (String): Search query string
- `filters` (Object): Filter options (languages, tags, dateRange)

**Returns:** Array of filtered and searched snippets

**Example:**

```javascript
import { searchSnippets } from "../services/searchService";

const results = searchSnippets(allSnippets, "react hooks", {
  languages: ["javascript"],
  tags: ["react"],
  dateRange: { start: "2024-01-01", end: null },
});
```

#### `highlightMatches(text, query)`

Highlights matched text in a string.

**Parameters:**

- `text` (String): The text to highlight
- `query` (String): The search query

**Returns:** Array of text segments with highlight flags

**Example:**

```javascript
import { highlightMatches } from "../services/searchService";

const segments = highlightMatches("React useState Hook", "state");
// Returns: [
//   { text: 'React u', highlighted: false },
//   { text: 'state', highlighted: true },
//   { text: 'Use Hook', highlighted: false }
// ]
```

#### `applyFilters(snippets, filters)`

Applies all filters to snippets.

#### `searchByQuery(snippets, query)`

Searches snippets by query string across multiple fields.

#### `filterByLanguage(snippets, languages)`

Filters snippets by programming language.

#### `filterByTags(snippets, tags)`

Filters snippets by tags.

#### `filterByDateRange(snippets, dateRange)`

Filters snippets by date range.

#### `clearSearchCache()`

Clears the search result cache.

## Caching

Search results are automatically cached in localStorage for 5 minutes to improve performance. The cache is automatically invalidated when:

- 5 minutes have passed since the cache was created
- The search query or filters change

To manually clear the cache:

```javascript
import { clearSearchCache } from "../services/searchService";

clearSearchCache();
```

## Demo

A complete demo of the search and filter functionality is available at `/demo/search`. The demo includes:

- Sample snippet data
- Interactive search bar
- Filter panel with multiple filter types
- Search results with highlighting
- Feature documentation

## Requirements Covered

This implementation covers the following requirements from the specification:

- **Requirement 2.1**: Search returns matching snippets based on title, description, code content, and tags within 1 second
- **Requirement 2.2**: Filter options for programming language, tags, creation date, and last modified date
- **Requirement 2.3**: Multiple filters can be applied simultaneously
- **Requirement 2.4**: Search results display highlighted matching text
- **Requirement 2.5**: Clear "no results found" message when no snippets match
- **Requirement 12.3**: Search results are cached for performance optimization

## Performance

- **Debounced Input**: 300ms delay reduces unnecessary search operations
- **Result Caching**: 5-minute cache reduces redundant searches
- **Client-side Search**: Fast search without server round-trips
- **Efficient Filtering**: Optimized filter algorithms for large datasets

## Accessibility

- Keyboard navigation support (Ctrl/Cmd + K, Escape)
- ARIA labels for screen readers
- Focus management
- Clear visual feedback
- Touch-friendly controls (44x44px minimum)
