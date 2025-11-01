import { useState } from "react";
import {
  Button,
  Modal,
  Toast,
  LoadingSpinner,
  FullPageLoader,
  InlineLoader,
  ConfirmDialog,
  DeleteConfirmDialog,
  SnippetDeleteConfirmDialog,
  CollectionDeleteConfirmDialog,
} from "../components/shared";

/**
 * UIComponentsDemo page
 * Demonstrates all UI components and feedback mechanisms
 */
const UIComponentsDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSnippetDeleteDialog, setShowSnippetDeleteDialog] = useState(false);
  const [showCollectionDeleteDialog, setShowCollectionDeleteDialog] =
    useState(false);

  const handleShowToast = (type) => {
    setToastType(type);
    setShowToast(true);
  };

  const handleShowFullPageLoader = () => {
    setShowFullPageLoader(true);
    setTimeout(() => setShowFullPageLoader(false), 3000);
  };

  const handleConfirm = () => {
    console.log("Action confirmed!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          UI Components Demo
        </h1>

        {/* Button Variants */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" disabled>
              Disabled Button
            </Button>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            Button Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        {/* Modal */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Modal</h2>
          <Button onClick={() => setShowModal(true)}>Open Modal</Button>

          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Example Modal"
            footer={
              <>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setShowModal(false)}>
                  Save
                </Button>
              </>
            }
          >
            <p className="text-gray-700">
              This is an example modal dialog. You can put any content here.
              Press ESC or click outside to close.
            </p>
          </Modal>
        </section>

        {/* Toast Notifications */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Toast Notifications
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleShowToast("success")}>
              Success Toast
            </Button>
            <Button onClick={() => handleShowToast("error")}>
              Error Toast
            </Button>
            <Button onClick={() => handleShowToast("info")}>Info Toast</Button>
            <Button onClick={() => handleShowToast("warning")}>
              Warning Toast
            </Button>
          </div>

          {showToast && (
            <Toast
              message={`This is a ${toastType} notification!`}
              type={toastType}
              duration={2000}
              isVisible={showToast}
              onClose={() => setShowToast(false)}
            />
          )}
        </section>

        {/* Loading Spinners */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Loading Spinners
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sizes</h3>
          <div className="flex flex-wrap items-center gap-8 mb-6">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
            <LoadingSpinner size="xl" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            With Text
          </h3>
          <div className="mb-6">
            <LoadingSpinner size="md" text="Loading data..." />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Inline Loader
          </h3>
          <div className="mb-6">
            <p className="text-gray-700">
              Processing your request <InlineLoader />
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Full Page Loader
          </h3>
          <Button onClick={handleShowFullPageLoader}>
            Show Full Page Loader (3s)
          </Button>

          {showFullPageLoader && (
            <FullPageLoader text="Loading application..." />
          )}
        </section>

        {/* Confirmation Dialogs */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Confirmation Dialogs
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowConfirmDialog(true)}>
              Generic Confirm Dialog
            </Button>
            <Button onClick={() => setShowDeleteDialog(true)}>
              Delete Confirm Dialog
            </Button>
            <Button onClick={() => setShowSnippetDeleteDialog(true)}>
              Delete Snippet Dialog
            </Button>
            <Button onClick={() => setShowCollectionDeleteDialog(true)}>
              Delete Collection Dialog
            </Button>
          </div>

          <ConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleConfirm}
            title="Confirm Action"
            message="Are you sure you want to proceed with this action?"
            confirmText="Yes, Continue"
            cancelText="Cancel"
            variant="primary"
          />

          <DeleteConfirmDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleConfirm}
            itemName="example-file.txt"
            itemType="file"
          />

          <SnippetDeleteConfirmDialog
            isOpen={showSnippetDeleteDialog}
            onClose={() => setShowSnippetDeleteDialog(false)}
            onConfirm={handleConfirm}
            snippetTitle="My Awesome Snippet"
          />

          <CollectionDeleteConfirmDialog
            isOpen={showCollectionDeleteDialog}
            onClose={() => setShowCollectionDeleteDialog(false)}
            onConfirm={handleConfirm}
            collectionName="Work Projects"
            hasSnippets={true}
          />
        </section>

        {/* Error Boundary Note */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Error Boundary
          </h2>
          <p className="text-gray-700 mb-3">
            The ErrorBoundary component is already integrated at the app level
            in App.jsx. It will catch any JavaScript errors in the component
            tree and display a fallback UI.
          </p>
          <p className="text-gray-600 text-sm">
            To test it, you would need to intentionally throw an error in a
            component. In development mode, it shows detailed error information.
          </p>
        </section>
      </div>
    </div>
  );
};

export default UIComponentsDemo;
