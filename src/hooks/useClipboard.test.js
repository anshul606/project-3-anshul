import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useClipboard from "./useClipboard";

describe("useClipboard", () => {
  let originalClipboard;
  let originalExecCommand;

  beforeEach(() => {
    // Save original values
    originalClipboard = navigator.clipboard;
    originalExecCommand = document.execCommand;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        writable: true,
      });
    }
    if (originalExecCommand) {
      document.execCommand = originalExecCommand;
    }
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current.isCopied).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.copyToClipboard).toBe("function");
    expect(typeof result.current.reset).toBe("function");
  });

  it("should copy text to clipboard using Clipboard API", async () => {
    // Mock Clipboard API
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    // Mock window.isSecureContext
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    let copyResult;
    await act(async () => {
      copyResult = await result.current.copyToClipboard("test code");
    });

    expect(copyResult).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith("test code");
    expect(result.current.isCopied).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should reset isCopied to false after 2 seconds", async () => {
    vi.useFakeTimers();

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard("test code");
    });

    expect(result.current.isCopied).toBe(true);

    // Fast-forward time by 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isCopied).toBe(false);

    vi.useRealTimers();
  });

  it("should handle clipboard API errors", async () => {
    // Mock Clipboard API to throw error
    const writeTextMock = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard access denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    let copyResult;
    await act(async () => {
      copyResult = await result.current.copyToClipboard("test code");
    });

    expect(copyResult).toBe(false);
    expect(result.current.isCopied).toBe(false);
    expect(result.current.error).toBe("Failed to copy to clipboard");
  });

  it("should preserve code formatting when copying", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    const codeWithFormatting = `function test() {
  const x = 10;
  return x * 2;
}`;

    await act(async () => {
      await result.current.copyToClipboard(codeWithFormatting);
    });

    expect(writeTextMock).toHaveBeenCalledWith(codeWithFormatting);
  });

  it("should reset state when reset is called", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard("test code");
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isCopied).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
