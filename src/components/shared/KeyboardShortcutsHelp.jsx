import Modal from "./Modal";

/**
 * KeyboardShortcutsHelp Component
 * Displays a modal with all available keyboard shortcuts
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 */
const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  const shortcuts = [
    {
      category: "Navigation",
      items: [
        {
          keys: ["⌘", "K"],
          description: "Focus search bar",
          windows: ["Ctrl", "K"],
        },
        {
          keys: ["⌘", "N"],
          description: "Create new snippet",
          windows: ["Ctrl", "N"],
        },
        {
          keys: ["↑", "↓"],
          description: "Navigate snippet list",
        },
        {
          keys: ["Esc"],
          description: "Close modal or clear search",
        },
      ],
    },
    {
      category: "Actions",
      items: [
        {
          keys: ["⌘", "C"],
          description: "Copy current snippet",
          windows: ["Ctrl", "C"],
        },
        {
          keys: ["⌘", "/"],
          description: "Show keyboard shortcuts",
          windows: ["Ctrl", "/"],
        },
      ],
    },
  ];

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const renderKey = (key) => (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
      {key}
    </kbd>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="md"
    >
      <div className="space-y-6">
        {shortcuts.map((section) => (
          <div key={section.category}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, index) => {
                // Use Windows keys if not on Mac and Windows keys are provided
                const keysToShow =
                  !isMac && item.windows ? item.windows : item.keys;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {keysToShow.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          {keyIndex > 0 && (
                            <span className="mx-1 text-gray-400">+</span>
                          )}
                          {renderKey(key)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {isMac ? "⌘ = Command key" : "Ctrl = Control key, ⌘ = Windows key"}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsHelp;
