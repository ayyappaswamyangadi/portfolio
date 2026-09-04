import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#contact");
  });

  test("shows validation errors for empty required fields", async ({ page }) => {
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/name must be at least 2 characters/i)).toBeVisible();
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/subject must be at least 4 characters/i)).toBeVisible();
    await expect(page.getByText(/message must be at least 20 characters/i)).toBeVisible();
  });

  test("rejects a malformed email address", async ({ page }) => {
    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/email address/i).fill("not-an-email");
    await page.getByLabel(/^subject$/i).fill("Project enquiry");
    await page
      .getByLabel(/message/i)
      .fill("This is a long enough message to pass client-side validation.");
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });

  test("submits successfully and shows a success state", async ({ page }) => {
    await page.route("https://api.web3forms.com/submit", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Email sent" }),
      });
    });

    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/email address/i).fill("jane@example.com");
    await page.getByLabel(/^subject$/i).fill("Project enquiry");
    await page
      .getByLabel(/message/i)
      .fill("This is a long enough message to pass client-side validation.");
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/message sent successfully/i)).toBeVisible();
    // Form resets after a successful submit.
    await expect(page.getByLabel(/your name/i)).toHaveValue("");
  });

  test("shows an error state when the submission fails", async ({ page }) => {
    await page.route("https://api.web3forms.com/submit", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Invalid access key" }),
      });
    });

    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/email address/i).fill("jane@example.com");
    await page.getByLabel(/^subject$/i).fill("Project enquiry");
    await page
      .getByLabel(/message/i)
      .fill("This is a long enough message to pass client-side validation.");
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test("contact info links have correct mailto/tel hrefs", async ({ page }) => {
    await expect(page.getByRole("link", { name: /ayyappaswamy50@gmail.com/i })).toHaveAttribute(
      "href",
      "mailto:ayyappaswamy50@gmail.com",
    );
    await expect(page.getByRole("link", { name: "+91 87925 94229" })).toHaveAttribute(
      "href",
      "tel:+918792594229",
    );
  });
});
