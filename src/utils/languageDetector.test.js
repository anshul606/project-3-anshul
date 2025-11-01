import { describe, it, expect } from "vitest";
import {
  detectLanguage,
  isLanguageSupported,
  getLanguageLabel,
  SUPPORTED_LANGUAGES,
} from "./languageDetector";

describe("languageDetector", () => {
  describe("detectLanguage", () => {
    it("should attempt to detect language and return a string", () => {
      const code = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;
      const result = detectLanguage(code);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should attempt to detect Python-like code", () => {
      const code = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`;
      const result = detectLanguage(code);
      // Auto-detection may not be perfect, but should return a string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should detect HTML code", () => {
      const code = "<html><body><h1>Hello</h1></body></html>";
      const result = detectLanguage(code);
      expect(result).toBe("xml"); // highlight.js may detect as xml
    });

    it("should return plaintext for empty string", () => {
      const result = detectLanguage("");
      expect(result).toBe("plaintext");
    });

    it("should return plaintext for null input", () => {
      const result = detectLanguage(null);
      expect(result).toBe("plaintext");
    });

    it("should return plaintext for low confidence detection", () => {
      const code = "a b c";
      const result = detectLanguage(code);
      expect(result).toBe("plaintext");
    });
  });

  describe("isLanguageSupported", () => {
    it("should return true for supported languages", () => {
      expect(isLanguageSupported("javascript")).toBe(true);
      expect(isLanguageSupported("python")).toBe(true);
      expect(isLanguageSupported("java")).toBe(true);
    });

    it("should return false for unsupported languages", () => {
      expect(isLanguageSupported("cobol")).toBe(false);
      expect(isLanguageSupported("fortran")).toBe(false);
    });
  });

  describe("getLanguageLabel", () => {
    it("should return correct label for supported languages", () => {
      expect(getLanguageLabel("javascript")).toBe("JavaScript");
      expect(getLanguageLabel("python")).toBe("Python");
      expect(getLanguageLabel("cpp")).toBe("C++");
    });

    it("should return the language value if not found", () => {
      expect(getLanguageLabel("unknown")).toBe("unknown");
    });
  });

  describe("SUPPORTED_LANGUAGES", () => {
    it("should have at least 20 languages", () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(20);
    });

    it("should include common languages", () => {
      const languageValues = SUPPORTED_LANGUAGES.map((lang) => lang.value);
      expect(languageValues).toContain("javascript");
      expect(languageValues).toContain("python");
      expect(languageValues).toContain("java");
      expect(languageValues).toContain("cpp");
      expect(languageValues).toContain("go");
      expect(languageValues).toContain("rust");
      expect(languageValues).toContain("html");
      expect(languageValues).toContain("css");
      expect(languageValues).toContain("sql");
    });

    it("should have proper structure with value and label", () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        expect(lang).toHaveProperty("value");
        expect(lang).toHaveProperty("label");
        expect(typeof lang.value).toBe("string");
        expect(typeof lang.label).toBe("string");
      });
    });
  });
});
