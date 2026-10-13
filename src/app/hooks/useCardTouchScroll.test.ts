import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCardTouchScroll } from "./useCardTouchScroll";

// jsdom has no layout, so give the element a fixed scrollable range:
// 300px of content in a 100px box → scrollTop runs 0..200.
function makeCard(scrollTop = 0) {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollHeight", { value: 300 });
  Object.defineProperty(el, "clientHeight", { value: 100 });
  el.scrollTop = scrollTop;
  document.body.appendChild(el);
  return el;
}

let time = 0;
function touch(el: HTMLElement, type: string, x: number, y: number) {
  time += 16;
  const event = new Event(type, { cancelable: true }) as TouchEvent;
  Object.defineProperty(event, "touches", { value: [{ clientX: x, clientY: y }] });
  Object.defineProperty(event, "timeStamp", { value: time });
  el.dispatchEvent(event);
  return event;
}

// Drags the finger from y0 to y1 in 10px steps; returns each move event.
function drag(el: HTMLElement, y0: number, y1: number) {
  touch(el, "touchstart", 50, y0);
  const moves: Event[] = [];
  const dir = Math.sign(y1 - y0);
  for (let y = y0 + dir * 10; dir * (y1 - y) >= 0; y += dir * 10) {
    moves.push(touch(el, "touchmove", 50, y));
  }
  return moves;
}

describe("useCardTouchScroll", () => {
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("scrolls the card's content and cancels native handling while it has room", () => {
    const el = makeCard();
    renderHook(() => useCardTouchScroll({ current: el }, true));
    expect(el.style.overflowY).toBe("hidden");

    const moves = drag(el, 400, 300);

    expect(el.scrollTop).toBe(100);
    expect(moves.every((e) => e.defaultPrevented)).toBe(true);
  });

  it("stops at the content's end and never scrolls the page itself", () => {
    const el = makeCard();
    renderHook(() => useCardTouchScroll({ current: el }, true));

    drag(el, 400, 0);

    expect(el.scrollTop).toBe(200);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("leaves the next swipe past the bottom to the browser, so the page scrolls natively", () => {
    const el = makeCard(200);
    renderHook(() => useCardTouchScroll({ current: el }, true));

    const moves = drag(el, 400, 200);

    expect(moves.some((e) => e.defaultPrevented)).toBe(false);
    expect(el.scrollTop).toBe(200);
  });

  it("leaves a swipe past the top to the browser too", () => {
    const el = makeCard(0);
    renderHook(() => useCardTouchScroll({ current: el }, true));

    const moves = drag(el, 200, 400);

    expect(moves.some((e) => e.defaultPrevented)).toBe(false);
  });

  it("at the bottom, a swipe back up still scrolls the card", () => {
    const el = makeCard(200);
    renderHook(() => useCardTouchScroll({ current: el }, true));

    const moves = drag(el, 200, 300);

    expect(el.scrollTop).toBe(100);
    expect(moves.every((e) => e.defaultPrevented)).toBe(true);
  });

  it("leaves horizontal swipes alone so the carousel still pans natively", () => {
    const el = makeCard(100);
    renderHook(() => useCardTouchScroll({ current: el }, true));

    touch(el, "touchstart", 50, 200);
    expect(touch(el, "touchmove", 70, 203).defaultPrevented).toBe(false);
    expect(touch(el, "touchmove", 120, 196).defaultPrevented).toBe(false);
    expect(el.scrollTop).toBe(100);
  });

  it("does nothing when disabled (hover devices keep native scrolling)", () => {
    const el = makeCard();
    renderHook(() => useCardTouchScroll({ current: el }, false));

    const moves = drag(el, 400, 100);

    expect(el.style.overflowY).toBe("");
    expect(el.scrollTop).toBe(0);
    expect(moves.some((e) => e.defaultPrevented)).toBe(false);
  });
});
