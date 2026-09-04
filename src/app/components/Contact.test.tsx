import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Contact } from "./Contact";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    name: string;
    email: string;
    subject: string;
    message: string;
  }> = {},
) {
  const values = {
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Project enquiry",
    message: "This is a long enough message to pass validation easily.",
    ...overrides,
  };
  // userEvent shares mutable state across calls on the same `user` instance —
  // firing these concurrently (Promise.all) causes interleaved keystrokes
  // across fields, so each field must be typed sequentially.
  if (values.name) await user.type(screen.getByLabelText(/your name/i), values.name);
  if (values.email) await user.type(screen.getByLabelText(/email address/i), values.email);
  if (values.subject) await user.type(screen.getByLabelText(/subject/i), values.subject);
  if (values.message) await user.type(screen.getByLabelText(/message/i), values.message);
}

describe("Contact", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders all contact info entries and the form fields", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { name: /let's connect/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ayyappaswamy50@gmail.com/i })).toHaveAttribute(
      "href",
      "mailto:ayyappaswamy50@gmail.com",
    );
    expect(screen.getByRole("link", { name: /\+91 87925 94229/ })).toHaveAttribute(
      "href",
      "tel:+918792594229",
    );
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("shows validation errors and does not submit when fields are invalid", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText(/name must be at least 2 characters/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/subject must be at least 4 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/message must be at least 20 characters/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fires a gaEvent validation_error on a failed submit attempt", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() =>
      expect(gaEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "submit",
          category: "contact_form",
          label: expect.stringContaining("validation_error"),
        }),
      ),
    );
  });

  it("rejects an invalid email but accepts a valid one", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await fillValidForm(user, { email: "not-an-email" });
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it("submits successfully, shows a success message, and resets the form", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });
    const user = userEvent.setup();
    render(<Contact />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/message sent successfully/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.web3forms.com/submit",
      expect.objectContaining({ method: "POST" }),
    );

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Project enquiry",
    });

    await waitFor(() =>
      expect(screen.getByLabelText(/your name/i)).toHaveValue(""),
    );
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "submit",
      category: "contact_form",
      label: "success",
    });
  });

  it("shows an error message when the API responds with success: false", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ success: false }),
    });
    const user = userEvent.setup();
    render(<Contact />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "submit",
      category: "contact_form",
      label: "error",
    });
  });

  it("shows an error message when the fetch call itself throws", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("network down"),
    );
    const user = userEvent.setup();
    render(<Contact />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("disables the submit button and shows a loading label while submitting", async () => {
    let resolveFetch!: (value: unknown) => void;
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<Contact />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    const submitButton = screen.getByRole("button", { name: /sending/i });
    expect(submitButton).toBeDisabled();

    resolveFetch({ json: async () => ({ success: true }) });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled(),
    );
  });

  it("fires a gaEvent for clicking a contact info link", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole("link", { name: /ayyappaswamy50@gmail.com/i }));

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "contact_info",
      label: "Email me",
    });
  });
});
