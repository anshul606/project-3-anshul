import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createSnippetDocument,
  createCollectionDocument,
  createTagDocument,
  validateSnippetData,
  validateCollectionData,
  COLLECTIONS,
} from "./firestoreService";

describe("Firestore Service", () => {
  describe("COLLECTIONS constants", () => {
    it("should have all required collection names", () => {
      expect(COLLECTIONS.USERS).toBe("users");
      expect(COLLECTIONS.SNIPPETS).toBe("snippets");
      expect(COLLECTIONS.COLLECTIONS).toBe("collections");
      expect(COLLECTIONS.TAGS).toBe("tags");
    });
  });

  describe("createSnippetDocument", () => {
    it("should create a valid snippet document with required fields", () => {
      const userId = "user123";
      const snippetData = {
        title: "Test Snippet",
        description: "A test snippet",
        code: 'console.log("test");',
        language: "javascript",
        tags: ["test", "javascript"],
      };

      const result = createSnippetDocument(userId, snippetData);

      expect(result.userId).toBe(userId);
      expect(result.title).toBe("Test Snippet");
      expect(result.description).toBe("A test snippet");
      expect(result.code).toBe('console.log("test");');
      expect(result.language).toBe("javascript");
      expect(result.tags).toEqual(["test", "javascript"]);
      expect(result.collectionId).toBeNull();
      expect(result.sharing.isShared).toBe(false);
      expect(result.sharing.sharedWith).toEqual([]);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.lastEditedBy).toBe(userId);
    });

    it("should use default values for missing fields", () => {
      const userId = "user123";
      const snippetData = {};

      const result = createSnippetDocument(userId, snippetData);

      expect(result.title).toBe("Untitled Snippet");
      expect(result.description).toBe("");
      expect(result.code).toBe("");
      expect(result.language).toBe("javascript");
      expect(result.tags).toEqual([]);
      expect(result.metadata.usageNotes).toBe("");
      expect(result.metadata.dependencies).toBe("");
      expect(result.metadata.author).toBe("");
    });

    it("should include metadata when provided", () => {
      const userId = "user123";
      const snippetData = {
        title: "Test",
        code: "test",
        metadata: {
          usageNotes: "Use this for testing",
          dependencies: "none",
          author: "John Doe",
        },
      };

      const result = createSnippetDocument(userId, snippetData);

      expect(result.metadata.usageNotes).toBe("Use this for testing");
      expect(result.metadata.dependencies).toBe("none");
      expect(result.metadata.author).toBe("John Doe");
    });
  });

  describe("createCollectionDocument", () => {
    it("should create a valid collection document", () => {
      const userId = "user123";
      const collectionData = {
        name: "My Collection",
        parentId: "parent123",
        path: ["parent123"],
        order: 1,
      };

      const result = createCollectionDocument(userId, collectionData);

      expect(result.userId).toBe(userId);
      expect(result.name).toBe("My Collection");
      expect(result.parentId).toBe("parent123");
      expect(result.path).toEqual(["parent123"]);
      expect(result.isTeamCollection).toBe(false);
      expect(result.teamMembers).toEqual([]);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.order).toBe(1);
    });

    it("should use default values for missing fields", () => {
      const userId = "user123";
      const collectionData = {};

      const result = createCollectionDocument(userId, collectionData);

      expect(result.name).toBe("New Collection");
      expect(result.parentId).toBeNull();
      expect(result.path).toEqual([]);
      expect(result.order).toBe(0);
    });

    it("should support team collections", () => {
      const userId = "user123";
      const collectionData = {
        name: "Team Collection",
        isTeamCollection: true,
        teamMembers: ["user456", "user789"],
      };

      const result = createCollectionDocument(userId, collectionData);

      expect(result.isTeamCollection).toBe(true);
      expect(result.teamMembers).toEqual(["user456", "user789"]);
    });
  });

  describe("createTagDocument", () => {
    it("should create a valid tag document", () => {
      const userId = "user123";
      const tagName = "javascript";

      const result = createTagDocument(userId, tagName);

      expect(result.userId).toBe(userId);
      expect(result.name).toBe("javascript");
      expect(result.usageCount).toBe(1);
      expect(result.lastUsed).toBeInstanceOf(Date);
    });
  });

  describe("validateSnippetData", () => {
    it("should validate correct snippet data", () => {
      const snippetData = {
        title: "Valid Snippet",
        description: "A valid description",
        code: 'console.log("valid");',
        language: "javascript",
      };

      const result = validateSnippetData(snippetData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject snippet without title", () => {
      const snippetData = {
        code: 'console.log("test");',
        language: "javascript",
      };

      const result = validateSnippetData(snippetData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
    });

    it("should reject snippet with empty title", () => {
      const snippetData = {
        title: "   ",
        code: 'console.log("test");',
        language: "javascript",
      };

      const result = validateSnippetData(snippetData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
    });

    it("should reject snippet without code", () => {
      const snippetData = {
        title: "Test",
        language: "javascript",
      };

      const result = validateSnippetData(snippetData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Code content is required");
    });

    it("should reject snippet without language", () => {
      const snippetData = {
        title: "Test",
        code: 'console.log("test");',
      };

      const result = validateSnippetData(snippetData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Programming language is required");
    });

    it("should reject snippet with title exceeding 200 characters", () => {
      const snippetData = {
        title: "a".repeat(201),
        code: 'console.log("test");',
        language: "javascript",
      };

      const result = validateSnippetData(snippetData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title must be less than 200 characters");
    });

    it("should reject snippet with description exceeding 2000 characters", () => {
      const snippetData = {
        title: "Test",
        description: "a".repeat(2001),
        code: 'console.log("test");',
        language: "javascript",
      };

      const result = validateSnippetData(snippetData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Description must be less than 2000 characters"
      );
    });
  });

  describe("validateCollectionData", () => {
    it("should validate correct collection data", () => {
      const collectionData = {
        name: "Valid Collection",
        path: ["parent1", "parent2"],
      };

      const result = validateCollectionData(collectionData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject collection without name", () => {
      const collectionData = {};

      const result = validateCollectionData(collectionData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Collection name is required");
    });

    it("should reject collection with empty name", () => {
      const collectionData = {
        name: "   ",
      };

      const result = validateCollectionData(collectionData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Collection name is required");
    });

    it("should reject collection with name exceeding 100 characters", () => {
      const collectionData = {
        name: "a".repeat(101),
      };

      const result = validateCollectionData(collectionData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Collection name must be less than 100 characters"
      );
    });

    it("should reject collection with path exceeding 5 levels", () => {
      const collectionData = {
        name: "Deep Collection",
        path: ["level1", "level2", "level3", "level4", "level5", "level6"],
      };

      const result = validateCollectionData(collectionData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Collection nesting cannot exceed 5 levels"
      );
    });
  });
});
