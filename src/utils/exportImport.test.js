import { describe, it, expect } from "vitest";
import {
  exportSnippetsToJSON,
  validateImportedSnippet,
  parseJSONImport,
  convertVSCodeSnippets,
  parseVSCodeImport,
  detectImportFormat,
} from "./exportImport";

describe("exportImport", () => {
  describe("exportSnippetsToJSON", () => {
    it("should export snippets to JSON format", () => {
      const snippets = [
        {
          title: "Test Snippet",
          description: "Test description",
          code: "console.log('test');",
          language: "javascript",
          tags: ["test"],
          metadata: {
            usageNotes: "Test notes",
            dependencies: "",
            author: "Test Author",
          },
        },
      ];

      const result = exportSnippetsToJSON(snippets);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe("Test Snippet");
      expect(parsed[0].code).toBe("console.log('test');");
    });

    it("should export without metadata when option is false", () => {
      const snippets = [
        {
          title: "Test",
          code: "test",
          language: "javascript",
          tags: [],
        },
      ];

      const result = exportSnippetsToJSON(snippets, {
        includeMetadata: false,
      });
      const parsed = JSON.parse(result);

      expect(parsed[0].metadata).toBeUndefined();
      expect(parsed[0].createdAt).toBeUndefined();
    });
  });

  describe("validateImportedSnippet", () => {
    it("should validate a valid snippet", () => {
      const snippet = {
        title: "Valid Snippet",
        code: "console.log('test');",
        language: "javascript",
        tags: ["test"],
      };

      const result = validateImportedSnippet(snippet);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject snippet with missing title", () => {
      const snippet = {
        code: "test",
        language: "javascript",
      };

      const result = validateImportedSnippet(snippet);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing or invalid title");
    });

    it("should reject snippet with missing code", () => {
      const snippet = {
        title: "Test",
        language: "javascript",
      };

      const result = validateImportedSnippet(snippet);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing or invalid code");
    });

    it("should reject snippet with invalid tag format", () => {
      const snippet = {
        title: "Test",
        code: "test",
        language: "javascript",
        tags: ["valid-tag", "invalid tag with spaces"],
      };

      const result = validateImportedSnippet(snippet);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Invalid tag format");
    });

    it("should reject snippet with title exceeding limit", () => {
      const snippet = {
        title: "a".repeat(201),
        code: "test",
        language: "javascript",
      };

      const result = validateImportedSnippet(snippet);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title exceeds 200 characters");
    });
  });

  describe("parseJSONImport", () => {
    it("should parse valid JSON import", () => {
      const json = JSON.stringify([
        {
          title: "Test",
          code: "test",
          language: "javascript",
          tags: [],
        },
      ]);

      const result = parseJSONImport(json);
      expect(result.success).toBe(true);
      expect(result.validCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(result.snippets[0].title).toBe("Test");
    });

    it("should handle invalid JSON", () => {
      const result = parseJSONImport("invalid json");
      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].errors[0]).toContain("Invalid JSON format");
    });

    it("should separate valid and invalid snippets", () => {
      const json = JSON.stringify([
        {
          title: "Valid",
          code: "test",
          language: "javascript",
          tags: [],
        },
        {
          title: "Invalid",
          // missing code
          language: "javascript",
        },
      ]);

      const result = parseJSONImport(json);
      expect(result.success).toBe(true);
      expect(result.validCount).toBe(1);
      expect(result.errorCount).toBe(1);
    });
  });

  describe("convertVSCodeSnippets", () => {
    it("should convert VS Code snippet format", () => {
      const vscodeSnippets = {
        "Console Log": {
          prefix: "log",
          body: ["console.log('$1');"],
          description: "Log to console",
        },
      };

      const result = convertVSCodeSnippets(vscodeSnippets, "javascript");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Console Log");
      expect(result[0].code).toBe("console.log('$1');");
      expect(result[0].language).toBe("javascript");
      expect(result[0].tags).toContain("log");
    });

    it("should handle multi-line body", () => {
      const vscodeSnippets = {
        "For Loop": {
          prefix: "for",
          body: ["for (let i = 0; i < array.length; i++) {", "  // code", "}"],
          description: "For loop",
        },
      };

      const result = convertVSCodeSnippets(vscodeSnippets, "javascript");
      expect(result[0].code).toContain("\n");
      expect(result[0].code.split("\n")).toHaveLength(3);
    });
  });

  describe("parseVSCodeImport", () => {
    it("should parse VS Code snippet file", () => {
      const json = JSON.stringify({
        "Test Snippet": {
          prefix: "test",
          body: ["test code"],
          description: "Test",
        },
      });

      const result = parseVSCodeImport(json, "javascript");
      expect(result.success).toBe(true);
      expect(result.validCount).toBe(1);
      expect(result.snippets[0].title).toBe("Test Snippet");
    });
  });

  describe("detectImportFormat", () => {
    it("should detect VS Code format", () => {
      const content = JSON.stringify({
        "Snippet Name": {
          prefix: "test",
          body: ["code"],
        },
      });

      const format = detectImportFormat(content);
      expect(format).toBe("vscode");
    });

    it("should detect standard JSON format", () => {
      const content = JSON.stringify([
        {
          title: "Test",
          code: "test",
          language: "javascript",
        },
      ]);

      const format = detectImportFormat(content);
      expect(format).toBe("json");
    });

    it("should default to json for invalid content", () => {
      const format = detectImportFormat("invalid");
      expect(format).toBe("json");
    });
  });
});
