import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "next-themes";
import { Navbar } from "./Navbar";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

// PWAInstallButton renders null in jsdom by default (no beforeinstallprompt
// event fired, not an iOS UA) — no need to mock it, it contributes nothing
// to the DOM. Confirmed by inspecting its source: `if (!isIOS && !prompt)
// return null;`.

function renderNavbar() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Navbar />
    </ThemeProvider>,
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
  });

  it("renders the logo link pointing home", () => {
    renderNavbar();
    const logoLinks = screen.getAllByRole("link", { name: /^home$/i });
    const logoLink = logoLinks.find((link) => link.getAttribute("href") === "/");
    expect(logoLink).toBeDefined();
  });

  it("renders all 4 section links, twice each (desktop + mobile dropdown), with 'projects' labeled 'My Work'", () => {
    renderNavbar();

    const homeLinks = screen.getAllByRole("link", { name: /^home$/i });
    const aboutLinks = screen.getAllByRole("link", { name: /^about$/i });
    const workLinks = screen.getAllByRole("link", { name: /^my work$/i });
    const contactLinks = screen.getAllByRole("link", { name: /^contact$/i });

    // "home" also matches the logo's aria-label, hence the +1.
    expect(homeLinks.length).toBe(3);
    expect(aboutLinks).toHaveLength(2);
    expect(workLinks).toHaveLength(2);
    expect(contactLinks).toHaveLength(2);

    expect(aboutLinks[0]).toHaveAttribute("href", "#about");
    expect(workLinks[0]).toHaveAttribute("href", "#projects");
    expect(contactLinks[0]).toHaveAttribute("href", "#contact");
  });

  it("renders a ThemeToggleButton and a 'Hire me' CTA for both desktop and mobile layouts", async () => {
    renderNavbar();
    // ThemeToggleButton gates on a mount effect before rendering its button.
    const themeButtons = await screen.findAllByRole("button", { name: /toggle theme/i });
    expect(themeButtons).toHaveLength(2);

    const hireLinks = screen.getAllByRole("link", { name: /hire me/i });
    expect(hireLinks).toHaveLength(2);
    hireLinks.forEach((link) => expect(link).toHaveAttribute("href", "#contact"));
  });

  it("fires a navigation gaEvent with the desktop label when a desktop nav link is clicked", async () => {
    renderNavbar();
    const user = userEvent.setup();

    const [desktopAbout] = screen.getAllByRole("link", { name: /^about$/i });
    await user.click(desktopAbout);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "navigation",
      label: "about_desktop",
    });
  });

  it("fires a hero_cta gaEvent with the navbar label when 'Hire me' is clicked (desktop)", async () => {
    renderNavbar();
    const user = userEvent.setup();

    const [desktopHire] = screen.getAllByRole("link", { name: /hire me/i });
    await user.click(desktopHire);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "hero_cta",
      label: "hire_me_navbar",
    });
  });

  it("toggles the mobile menu open/closed via the menu button, updating aria-expanded and firing gaEvent", async () => {
    renderNavbar();
    const user = userEvent.setup();

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "navigation",
      label: "menu_open",
    });

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "navigation",
      label: "menu_close",
    });
  });

  it("closes the mobile menu and fires the mobile nav gaEvent when a mobile nav link is clicked", async () => {
    renderNavbar();
    const user = userEvent.setup();

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Second occurrence of each section link is the one inside the mobile
    // dropdown (DOM order: desktop links render before the mobile dropdown).
    const [, mobileContact] = screen.getAllByRole("link", { name: /^contact$/i });
    await user.click(mobileContact);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "navigation",
      label: "contact_mobile",
    });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the mobile menu and fires hire_me_navbar_mobile when the mobile 'Hire me' CTA is clicked", async () => {
    renderNavbar();
    const user = userEvent.setup();

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    await user.click(menuButton);

    const [, mobileHire] = screen.getAllByRole("link", { name: /hire me/i });
    await user.click(mobileHire);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "hero_cta",
      label: "hire_me_navbar_mobile",
    });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the mobile menu when the logo is clicked", async () => {
    renderNavbar();
    const user = userEvent.setup();

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    const [logoLink] = screen.getAllByRole("link", { name: /^home$/i });
    await user.click(logoLink);

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
