/**
 * LoadingSpinner component
 * Displays a loading indicator with optional text
 */
const LoadingSpinner = ({ size = "md", text = "", className = "" }) => {
  const sizeStyles = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`${sizeStyles[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

/**
 * FullPageLoader component
 * Displays a centered loading spinner that covers the entire page
 */
export const FullPageLoader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

/**
 * InlineLoader component
 * Displays a small inline loading spinner
 */
export const InlineLoader = ({ text = "" }) => {
  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
