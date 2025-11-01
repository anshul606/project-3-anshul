import Modal from "./Modal";
import Button from "./Button";

/**
 * ConfirmDialog component
 * Displays a confirmation dialog for destructive or important actions
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={handleConfirm} disabled={isLoading}>
        {isLoading ? "Processing..." : confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      closeOnBackdrop={!isLoading}
    >
      <div className="py-2">
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  );
};

/**
 * DeleteConfirmDialog component
 * Pre-configured confirmation dialog for delete actions
 */
export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "item",
  itemType = "item",
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  );
};

/**
 * SnippetDeleteConfirmDialog component
 * Specialized confirmation dialog for deleting snippets
 */
export const SnippetDeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  snippetTitle,
}) => {
  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      itemName={snippetTitle}
      itemType="Snippet"
    />
  );
};

/**
 * CollectionDeleteConfirmDialog component
 * Specialized confirmation dialog for deleting collections
 */
export const CollectionDeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  collectionName,
  hasSnippets = false,
}) => {
  const message = hasSnippets
    ? `Are you sure you want to delete the collection "${collectionName}"? This will also remove all snippets in this collection. This action cannot be undone.`
    : `Are you sure you want to delete the collection "${collectionName}"? This action cannot be undone.`;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Collection"
      message={message}
      confirmText="Delete Collection"
      cancelText="Cancel"
      variant="danger"
    />
  );
};

export default ConfirmDialog;
