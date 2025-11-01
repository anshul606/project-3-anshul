import { useState, useMemo } from "react";
import { Grid, List } from "react-window";
import SnippetCard from "./SnippetCard";
import SnippetCardSkeleton from "./SnippetCardSkeleton";

/**
 * SnippetList Component
 * Displays a list of snippets with grid and list view modes
 * Implements virtual scrolling for performance with large collections
 *
 * @param {Object} props
 * @param {Array} props.snippets - Array of snippet objects to display
 * @param {Function} props.onCopy - Callback when copy button is clicked
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {boolean} props.loading - Whether snippets are loading
 * @param {string} props.viewMode - Display mode: 'grid' or 'list' (default: 'grid')
 * @param {string} props.emptyMessage - Message to display when no snippets
 */
const SnippetList = ({
  snippets = [],
  onCopy,
  onEdit,
  onDelete,
  loading = false,
  viewMode = "grid",
  emptyMessage = "No snippets found",
}) => {
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth - 300 : 1000
  );

  // Calculate grid dimensions based on container width
  const gridConfig = useMemo(() => {
    const minCardWidth = 320;
    const gap = 16;
    const columns = Math.max(
      1,
      Math.floor((containerWidth + gap) / (minCardWidth + gap))
    );
    const cardWidth = Math.floor(
      (containerWidth - gap * (columns - 1)) / columns
    );

    return {
      columns,
      cardWidth,
      cardHeight: 280,
      gap,
    };
  }, [containerWidth]);

  // List configuration
  const listConfig = {
    itemHeight: 140,
  };

  // Handle window resize
  useMemo(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const sidebar = 280;
      const padding = 64;
      setContainerWidth(window.innerWidth - sidebar - padding);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading skeletons
  if (loading) {
    const skeletonCount = viewMode === "grid" ? 6 : 5;
    return (
      <div
        className={
          viewMode === "grid"
            ? `grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
            : "space-y-2"
        }
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SnippetCardSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!snippets || snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Start by creating your first code snippet to build your collection.
        </p>
      </div>
    );
  }

  // Use virtual scrolling for large lists (>50 items)
  const useVirtualScrolling = snippets.length > 50;

  // Grid view with virtual scrolling
  if (viewMode === "grid" && useVirtualScrolling) {
    const rowCount = Math.ceil(snippets.length / gridConfig.columns);

    const GridCell = ({ columnIndex, rowIndex, style }) => {
      const index = rowIndex * gridConfig.columns + columnIndex;
      if (index >= snippets.length) return null;

      const snippet = snippets[index];

      return (
        <div
          style={{
            ...style,
            left: style.left + gridConfig.gap / 2,
            top: style.top + gridConfig.gap / 2,
            width: style.width - gridConfig.gap,
            height: style.height - gridConfig.gap,
          }}
        >
          <SnippetCard
            snippet={snippet}
            onCopy={onCopy}
            onEdit={onEdit}
            onDelete={onDelete}
            viewMode="grid"
          />
        </div>
      );
    };

    return (
      <Grid
        columnCount={gridConfig.columns}
        columnWidth={gridConfig.cardWidth + gridConfig.gap}
        height={Math.min(800, window.innerHeight - 200)}
        rowCount={rowCount}
        rowHeight={gridConfig.cardHeight + gridConfig.gap}
        width={containerWidth}
        className="scrollbar-thin"
      >
        {GridCell}
      </Grid>
    );
  }

  // List view with virtual scrolling
  if (viewMode === "list" && useVirtualScrolling) {
    const ListRow = ({ index, style }) => {
      const snippet = snippets[index];

      return (
        <div style={style}>
          <SnippetCard
            snippet={snippet}
            onCopy={onCopy}
            onEdit={onEdit}
            onDelete={onDelete}
            viewMode="list"
          />
        </div>
      );
    };

    return (
      <List
        height={Math.min(800, window.innerHeight - 200)}
        itemCount={snippets.length}
        itemSize={listConfig.itemHeight}
        width="100%"
        className="scrollbar-thin"
      >
        {ListRow}
      </List>
    );
  }

  // Regular grid view (without virtual scrolling)
  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            onCopy={onCopy}
            onEdit={onEdit}
            onDelete={onDelete}
            viewMode="grid"
          />
        ))}
      </div>
    );
  }

  // Regular list view (without virtual scrolling)
  return (
    <div className="space-y-2">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
          viewMode="list"
        />
      ))}
    </div>
  );
};

export default SnippetList;
