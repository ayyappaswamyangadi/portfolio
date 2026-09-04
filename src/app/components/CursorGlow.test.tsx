import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CursorGlow } from "./CursorGlow";

describe("CursorGlow", () => {
  it("renders a fixed, pointer-events-none, aria-hidden glow element starting at opacity 0", () => {
    const { container } = render(<CursorGlow />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.style.opacity).toBe("0");
    expect(el.style.position).toBe("fixed");
  });

  it("follows the mouse: a mousemove sets opacity to 1 and translates to the cursor position", () => {
    const { container } = render(<CursorGlow />);
    const el = container.firstElementChild as HTMLElement;

    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });

    expect(el.style.opacity).toBe("1");
    expect(el.style.transform).toContain("translate(120px, 80px)");
  });

  it("hides on document mouseleave and reappears on mouseenter", () => {
    const { container } = render(<CursorGlow />);
    const el = container.firstElementChild as HTMLElement;

    fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
    expect(el.style.opacity).toBe("1");

    fireEvent.mouseLeave(document.documentElement);
    expect(el.style.opacity).toBe("0");

    fireEvent.mouseEnter(document.documentElement);
    expect(el.style.opacity).toBe("1");
  });

  it("removes its listeners on unmount (no throw on further mouse events)", () => {
    const { unmount } = render(<CursorGlow />);
    unmount();
    expect(() => fireEvent.mouseMove(window, { clientX: 1, clientY: 1 })).not.toThrow();
  });
});
