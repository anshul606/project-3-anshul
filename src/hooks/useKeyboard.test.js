import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useKeyboard, { useArrowKeyNavigation } from "./useKeyboard";

describe("useKeyboard", () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register keyboard event listener on mount", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard({ "ctrl+k": handler }));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  it("should remove keyboard event listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useKeyboard({ "ctrl+k": handler }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  it("should call handler when matching key combination is pressed", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard({ "ctrl+k": handler }));

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalled();
  });

  it("should not call handler when enabled is false", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard({ "ctrl+k": handler }, { enabled: false }));

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("should parse key combinations correctly", () => {
    const { result } = renderHook(() => useKeyboard({}));

    const parsed = result.current.parseKeyCombination("ctrl+shift+k");

    expect(parsed).toEqual({
      key: "k",
      ctrl: true,
      meta: false,
      shift: true,
      alt: false,
    });
  });
});

describe("useArrowKeyNavigation", () => {
  it("should navigate through items with arrow keys", () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const onSelect = vi.fn();

    renderHook(() => useArrowKeyNavigation(items, onSelect));

    // Simulate arrow down
    const downEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(downEvent);
    });

    expect(onSelect).toHaveBeenCalledWith({ id: 1 }, 0);
  });

  it("should loop to beginning when reaching end with loop enabled", () => {
    const items = [{ id: 1 }, { id: 2 }];
    const onSelect = vi.fn();

    renderHook(() => useArrowKeyNavigation(items, onSelect, { loop: true }));

    // Navigate to end
    const downEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(downEvent);
      window.dispatchEvent(downEvent);
      window.dispatchEvent(downEvent); // Should loop back to first
    });

    expect(onSelect).toHaveBeenLastCalledWith({ id: 1 }, 0);
  });
});
