import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SnippetCard from "./SnippetCard";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SnippetCard", () => {
  const mockSnippet = {
    id: "test-123",
    title: "Test Snippet",
    description: "A test snippet description",
    code: "const x = 10;\nconsole.log(x);",
    language: "javascript",
    tags: ["test", "demo"],
    updatedAt: new Date("2024-01-15"),
  };

  const mockHandlers = {
    onCopy: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  const renderCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <SnippetCard snippet={mockSnippet} {...mockHandlers} {...props} />
      </BrowserRouter>
    );
  };

  it("renders snippet title and language", () => {
    renderCard();
    expect(screen.getByText("Test Snippet")).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("renders snippet description", () => {
    renderCard();
    expect(screen.getByText("A test snippet description")).toBeInTheDocument();
  });

  it("renders tags", () => {
    renderCard();
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("demo")).toBeInTheDocument();
  });

  it("calls onCopy when copy button is clicked", async () => {
    renderCard();
    const copyButton = screen.getByTitle("Copy code");
    fireEvent.click(copyButton);
    expect(mockHandlers.onCopy).toHaveBeenCalledWith(mockSnippet);
  });

  it("calls onEdit when edit button is clicked", () => {
    renderCard();
    const editButton = screen.getByTitle("Edit snippet");
    fireEvent.click(editButton);
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockSnippet);
  });

  it("shows delete confirmation on first delete click", () => {
    renderCard();
    const deleteButton = screen.getByTitle("Delete snippet");
    fireEvent.click(deleteButton);
    expect(screen.getByTitle("Click again to confirm")).toBeInTheDocument();
  });

  it("renders in list view mode", () => {
    renderCard({ viewMode: "list" });
    expect(screen.getByText("Test Snippet")).toBeInTheDocument();
  });

  it("renders in grid view mode", () => {
    renderCard({ viewMode: "grid" });
    expect(screen.getByText("Test Snippet")).toBeInTheDocument();
  });
});
