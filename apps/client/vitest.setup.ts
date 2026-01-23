/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: false positive */
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

afterEach(() => {
	cleanup();
});

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;
