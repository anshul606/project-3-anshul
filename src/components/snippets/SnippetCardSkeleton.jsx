/**
 * SnippetCardSkeleton Component
 * Loading skeleton for snippet cards to improve UX during data fetching
 *
 * @param {Object} props
 * @param {string} props.viewMode - Display mode: 'grid' or 'list'
 */
const SnippetCardSkeleton = ({ viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-2 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="flex gap-1 mb-2">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gray-200 rounded"></div>
            <div className="w-9 h-9 bg-gray-200 rounded"></div>
            <div className="w-9 h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view skeleton
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>

      {/* Code Preview */}
      <div className="bg-gray-200 rounded p-3 mb-3 flex-1">
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          <div className="h-3 bg-gray-300 rounded w-4/6"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1 mb-3">
        <div className="h-5 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="flex gap-1">
          <div className="w-7 h-7 bg-gray-200 rounded"></div>
          <div className="w-7 h-7 bg-gray-200 rounded"></div>
          <div className="w-7 h-7 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default SnippetCardSkeleton;
