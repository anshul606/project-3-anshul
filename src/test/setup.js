import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock Firebase environment variables for testing
import.meta.env.VITE_FIREBASE_API_KEY = "test-api-key";
import.meta.env.VITE_FIREBASE_AUTH_DOMAIN = "test-project.firebaseapp.com";
import.meta.env.VITE_FIREBASE_PROJECT_ID = "test-project";
import.meta.env.VITE_FIREBASE_STORAGE_BUCKET = "test-project.appspot.com";
import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID = "123456789";
import.meta.env.VITE_FIREBASE_APP_ID = "1:123456789:web:abcdef";

// Cleanup after each test
afterEach(() => {
  cleanup();
});
