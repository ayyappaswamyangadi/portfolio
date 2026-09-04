import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./components/Home", () => ({
  default: () => <div data-testid="home-mock" />,
}));
vi.mock("./components/About", () => ({
  About: () => <div data-testid="about-mock" />,
}));
vi.mock("./components/Projects", () => ({
  Projects: () => <div data-testid="projects-mock" />,
}));
vi.mock("./components/Contact", () => ({
  Contact: () => <div data-testid="contact-mock" />,
}));
vi.mock("./components/ScrollToTop", () => ({
  ScrollToTop: () => <div data-testid="scrolltotop-mock" />,
}));

import Landing from "./page";

describe("Landing (page.tsx composition)", () => {
  it("renders Home, About, Projects, Contact, and ScrollToTop in order", () => {
    render(<Landing />);

    const ids = ["home-mock", "about-mock", "projects-mock", "contact-mock", "scrolltotop-mock"];
    const nodes = ids.map((id) => screen.getByTestId(id));

    nodes.forEach((node) => expect(node).toBeInTheDocument());

    // Confirm document order matches the expected section order.
    for (let i = 0; i < nodes.length - 1; i++) {
      const relation = nodes[i].compareDocumentPosition(nodes[i + 1]);
      expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});
