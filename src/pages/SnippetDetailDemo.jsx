import { useState } from "react";
import { SnippetDetail } from "../components/snippets";

/**
 * Demo page for SnippetDetail component
 * Shows the component with sample data
 */
const SnippetDetailDemo = () => {
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  // Sample snippets for demo
  const sampleSnippets = [
    {
      id: "1",
      userId: "user123",
      title: "React useState Hook Example",
      description:
        "A simple example demonstrating the useState hook in React for managing component state.",
      code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
      language: "javascript",
      tags: ["react", "hooks", "state-management"],
      collectionId: null,
      metadata: {
        usageNotes:
          "This is a basic counter component. Use it as a starting point for understanding React state management.",
        dependencies: "react@18.0.0 or higher",
        author: "John Doe",
      },
      sharing: {
        isShared: false,
        sharedWith: [],
      },
      createdAt: new Date("2024-01-15T10:30:00"),
      updatedAt: new Date("2024-01-20T14:45:00"),
      lastEditedBy: "user123",
    },
    {
      id: "2",
      userId: "user123",
      title: "Python List Comprehension",
      description:
        "Efficient way to create lists in Python using list comprehension syntax.",
      code: `# Basic list comprehension
squares = [x**2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print(even_squares)  # [0, 4, 16, 36, 64]

# Nested list comprehension
matrix = [[i*j for j in range(3)] for i in range(3)]
print(matrix)  # [[0, 0, 0], [0, 1, 2], [0, 2, 4]]`,
      language: "python",
      tags: ["python", "list-comprehension", "functional-programming"],
      collectionId: "col1",
      metadata: {
        usageNotes:
          "List comprehensions are more concise and often faster than traditional for loops. Use them for simple transformations.",
        dependencies: "Python 3.x",
        author: "Jane Smith",
      },
      sharing: {
        isShared: true,
        sharedWith: [
          { userId: "user456", permission: "read" },
          { userId: "user789", permission: "write" },
        ],
      },
      createdAt: new Date("2024-02-01T09:15:00"),
      updatedAt: new Date("2024-02-10T16:20:00"),
      lastEditedBy: "user789",
    },
    {
      id: "3",
      userId: "user123",
      title: "SQL JOIN Query",
      description:
        "Example of INNER JOIN to combine data from multiple tables.",
      code: `SELECT 
  users.id,
  users.name,
  users.email,
  orders.order_id,
  orders.total_amount,
  orders.order_date
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.order_date >= '2024-01-01'
ORDER BY orders.order_date DESC;`,
      language: "sql",
      tags: ["sql", "database", "joins"],
      collectionId: null,
      metadata: {
        usageNotes:
          "This query retrieves user information along with their orders. Adjust the date filter as needed.",
        dependencies: "PostgreSQL 12+ or MySQL 8+",
        author: "Bob Johnson",
      },
      sharing: {
        isShared: true,
        sharedWith: [{ userId: "user456", permission: "read" }],
      },
      createdAt: new Date("2024-01-25T11:00:00"),
      updatedAt: new Date("2024-01-25T11:00:00"),
      lastEditedBy: "user123",
    },
  ];

  const handleEdit = (snippet) => {
    console.log("Edit snippet:", snippet);
    alert(`Edit functionality would open editor for: ${snippet.title}`);
  };

  const handleDelete = async (snippetId) => {
    console.log("Delete snippet:", snippetId);
    // Simulate async delete
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert(`Snippet deleted: ${snippetId}`);
    setSelectedSnippet(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Snippet Detail Component Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Snippet List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sample Snippets
              </h2>
              <div className="space-y-2">
                {sampleSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => setSelectedSnippet(snippet)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSnippet?.id === snippet.id
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {snippet.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {snippet.language}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Snippet Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden h-[800px]">
              {selectedSnippet ? (
                <SnippetDetail
                  snippet={selectedSnippet}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClose={() => setSelectedSnippet(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                    <p className="text-gray-500 text-lg">
                      Select a snippet to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Component Features
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Full snippet information display
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Syntax highlighting with line numbers
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Copy to clipboard with confirmation
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Edit and delete actions
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Delete confirmation modal
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Sharing status and shared users list
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              All metadata fields displayed
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Toast notifications for user feedback
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetailDemo;
