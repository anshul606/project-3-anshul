# Snippet List Components

This directory contains components for displaying and managing code snippets in list and grid views.

## Components

### SnippetCard

A card component that displays a single snippet with its metadata and quick action buttons.

**Features:**

- Displays snippet title, language, description, tags, and code preview
- Quick action buttons: copy, edit, delete
- Delete confirmation (requires two clicks)
- Supports both grid and list view modes
- Responsive design with Tailwind CSS
- Language-specific badge colors
- Formatted dates

**Props:**

```jsx
{
  snippet: Object,        // Snippet object with id, title, code, language, tags, etc.
  onCopy: Function,       // Callback when copy button is clicked
  onEdit: Function,       // Callback when edit button is clicked
  onDelete: Function,     // Callback when delete button is clicked
  viewMode: String        // 'grid' or 'list' (default: 'grid')
}
```

**Usage:**

```jsx
import { SnippetCard } from "./components/snippets";

<SnippetCard
  snippet={snippet}
  onCopy={handleCopy}
  onEdit={handleEdit}
  onDelete={handleDelete}
  viewMode="grid"
/>;
```

### SnippetList

A list component that displays multiple snippets with virtual scrolling for performance.

**Features:**

- Grid and list view modes
- Virtual scrolling for large collections (>50 items)
- Loading skeletons for better UX
- Empty state with custom message
- Responsive grid layout
- Automatic column calculation based on container width

**Props:**

```jsx
{
  snippets: Array,        // Array of snippet objects
  onCopy: Function,       // Callback when copy button is clicked
  onEdit: Function,       // Callback when edit button is clicked
  onDelete: Function,     // Callback when delete button is clicked
  loading: Boolean,       // Whether snippets are loading
  viewMode: String,       // 'grid' or 'list' (default: 'grid')
  emptyMessage: String    // Message to display when no snippets
}
```

**Usage:**

```jsx
import { SnippetList } from "./components/snippets";

<SnippetList
  snippets={snippets}
  onCopy={handleCopy}
  onEdit={handleEdit}
  onDelete={handleDelete}
  loading={loading}
  viewMode="grid"
  emptyMessage="No snippets found"
/>;
```

### SnippetCardSkeleton

A loading skeleton component that matches the SnippetCard layout.

**Props:**

```jsx
{
  viewMode: String; // 'grid' or 'list' (default: 'grid')
}
```

**Usage:**

```jsx
import { SnippetCardSkeleton } from "./components/snippets";

<SnippetCardSkeleton viewMode="grid" />;
```

## Virtual Scrolling

The SnippetList component automatically enables virtual scrolling when displaying more than 50 snippets. This significantly improves performance by only rendering visible items.

**Benefits:**

- Handles thousands of snippets without performance degradation
- Smooth scrolling experience
- Reduced memory usage
- Automatic optimization

**Implementation:**

- Uses `react-window` library
- Grid view: `FixedSizeGrid` component
- List view: `FixedSizeList` component
- Configurable item sizes and gaps

## View Modes

### Grid View

- Responsive grid layout (1-3 columns based on screen size)
- Card-style display with code preview
- Compact information display
- Best for browsing and visual scanning

### List View

- Single column layout
- More detailed information display
- Horizontal layout with actions on the right
- Best for detailed review and quick actions

## Styling

All components use Tailwind CSS for styling with:

- Responsive breakpoints (mobile, tablet, desktop)
- Hover effects and transitions
- Color-coded language badges
- Custom animations (loading, toast)
- Dark code preview backgrounds

## Performance Optimizations

1. **Virtual Scrolling**: Only renders visible items
2. **Lazy Loading**: Code content loaded on demand
3. **Memoization**: Prevents unnecessary re-renders
4. **Skeleton Loading**: Improves perceived performance
5. **Responsive Images**: Optimized for different screen sizes

## Accessibility

- Keyboard navigation support
- ARIA labels on buttons
- Focus indicators
- Touch-friendly button sizes (44x44px minimum)
- Color contrast compliance

## Testing

Tests are included for both SnippetCard and SnippetList components:

```bash
npm test -- src/components/snippets/SnippetCard.test.jsx
npm test -- src/components/snippets/SnippetList.test.jsx
```

**Test Coverage:**

- Component rendering
- User interactions (copy, edit, delete)
- View mode switching
- Loading states
- Empty states
- Delete confirmation flow

## Example Implementation

See `src/pages/SnippetListDemo.jsx` for a complete example of using these components with the SnippetContext.

## Dependencies

- `react-window`: Virtual scrolling
- `react-router-dom`: Navigation
- `tailwindcss`: Styling
- Snippet context and hooks

## Future Enhancements

- Drag and drop reordering
- Bulk selection and actions
- Advanced filtering UI
- Sorting options
- Export selected snippets
- Keyboard shortcuts for actions
