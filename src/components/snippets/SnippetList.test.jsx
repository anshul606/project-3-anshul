import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SnippetList from "./SnippetList";

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("SnippetList", () => {
  const mockSnippets = [
    {
      id: "1",
      title: "Snippet 1",
      description: "First snippet",
      code: "const x = 1;",
      language: "javascript",
      tags: ["test"],
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      title: "Snippet 2",
      description: "Second snippet",
      code: "const y = 2;",
      language: "python",
      tags: ["demo"],
      updatedAt: new Date("2024-01-16"),
    },
  ];

  const mockHandlers = {
    onCopy: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  const renderList = (props = {}) => {
    return render(
      <BrowserRouter>
        <SnippetList snippets={mockSnippets} {...mockHandlers} {...props} />
      </BrowserRouter>
    );
  };

  it("renders all snippets in grid view", () => {
    renderList({ viewMode: "grid" });
    expect(screen.getByText("Snippet 1")).toBeInTheDocument();
    expect(screen.getByText("Snippet 2")).toBeInTheDocument();
  });

  it("renders all snippets in list view", () => {
    renderList({ viewMode: "list" });
    expect(screen.getByText("Snippet 1")).toBeInTheDocument();
    expect(screen.getByText("Snippet 2")).toBeInTheDocument();
  });

  it("shows loading skeletons when loading", () => {
    renderList({ loading: true });
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty message when no snippets", () => {
    renderList({ snippets: [], emptyMessage: "No snippets available" });
    expect(screen.getByText("No snippets available")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    const customMessage = "Create your first snippet!";
    renderList({ snippets: [], emptyMessage: customMessage });
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
