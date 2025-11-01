import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SnippetDetail from "./SnippetDetail";

describe("SnippetDetail", () => {
  const mockSnippet = {
    id: "test-1",
    userId: "user123",
    title: "Test Snippet",
    description: "A test snippet description",
    code: "console.log('Hello World');",
    language: "javascript",
    tags: ["test", "demo"],
    metadata: {
      usageNotes: "Test usage notes",
      dependencies: "None",
      author: "Test Author",
    },
    sharing: {
      isShared: false,
      sharedWith: [],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    lastEditedBy: "user123",
  };

  it("renders snippet title and description", () => {
    render(<SnippetDetail snippet={mockSnippet} />);

    expect(screen.getByText("Test Snippet")).toBeInTheDocument();
    expect(screen.getByText("A test snippet description")).toBeInTheDocument();
  });

  it("displays code with syntax highlighting", () => {
    render(<SnippetDetail snippet={mockSnippet} />);

    // Check that the code is displayed (text is split by syntax highlighting)
    expect(screen.getByText("console")).toBeInTheDocument();
    expect(screen.getByText("log")).toBeInTheDocument();
  });

  it("shows metadata fields", () => {
    render(<SnippetDetail snippet={mockSnippet} />);

    expect(screen.getByText("Test usage notes")).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("displays tags", () => {
    render(<SnippetDetail snippet={mockSnippet} />);

    expect(screen.getByText("#test")).toBeInTheDocument();
    expect(screen.getByText("#demo")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    render(<SnippetDetail snippet={mockSnippet} onEdit={onEdit} />);

    const editButton = screen.getByTitle("Edit snippet");
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockSnippet);
  });

  it("shows delete confirmation modal when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(<SnippetDetail snippet={mockSnippet} onDelete={onDelete} />);

    const deleteButton = screen.getByTitle("Delete snippet");
    fireEvent.click(deleteButton);

    expect(
      screen.getByText(/Are you sure you want to delete/)
    ).toBeInTheDocument();
  });

  it("calls onDelete when confirmed in modal", async () => {
    const onDelete = vi.fn().mockResolvedValue();
    render(<SnippetDetail snippet={mockSnippet} onDelete={onDelete} />);

    // Open delete modal
    const deleteButton = screen.getByTitle("Delete snippet");
    fireEvent.click(deleteButton);

    // Confirm deletion - get all delete buttons and click the one in the modal (second one)
    const deleteButtons = screen.getAllByRole("button", { name: /Delete/ });
    const confirmButton = deleteButtons.find(
      (btn) => btn.textContent === "Delete" && !btn.querySelector("svg")
    );
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockSnippet.id);
    });
  });

  it("displays shared status when snippet is shared", () => {
    const sharedSnippet = {
      ...mockSnippet,
      sharing: {
        isShared: true,
        sharedWith: [
          { userId: "user456", permission: "read" },
          { userId: "user789", permission: "write" },
        ],
      },
    };

    render(<SnippetDetail snippet={sharedSnippet} />);

    expect(screen.getByText("Shared")).toBeInTheDocument();
    expect(screen.getByText("Shared With")).toBeInTheDocument();
    expect(screen.getByText("user456")).toBeInTheDocument();
    expect(screen.getByText("user789")).toBeInTheDocument();
  });

  it("renders empty state when no snippet is provided", () => {
    render(<SnippetDetail snippet={null} />);

    expect(screen.getByText("No snippet selected")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<SnippetDetail snippet={mockSnippet} onClose={onClose} />);

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
