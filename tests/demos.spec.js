import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#work").scrollIntoViewIfNeeded();
});

test("walkthrough seeks, pauses and switches chapters without stale frames", async ({
  page,
}) => {
  const player = page.locator("#demo-player");
  await player.getByRole("button", { name: "Next scene", exact: true }).click();
  await expect(player.locator("h4")).toHaveText("One question at a time");
  await player.getByRole("button", { name: "Play walkthrough" }).click();
  await expect(player.getByRole("button", { name: "Pause" })).toBeVisible();
  await player
    .getByRole("button", { name: "Trading harness", exact: false })
    .click();
  await expect(player.locator("h4")).toHaveText("Start with the account");
  await expect(
    player.getByRole("button", { name: "Play walkthrough" }),
  ).toBeVisible();
});

test("onboarding requires explicit consent and marketplace requires verification", async ({
  page,
}) => {
  const player = page.locator("#demo-player");
  await player.getByRole("button", { name: "Try it yourself" }).click();
  await player.getByRole("button", { name: "Start onboarding" }).click();
  for (const name of [
    "English",
    "Alex",
    "Beginner",
    "Gold",
    "Intraday",
    "Low",
    "Use demo account",
    "Decline",
  ])
    await player.getByRole("button", { name, exact: true }).click();
  await expect(
    player.getByText("No account submitted.", { exact: false }),
  ).toBeVisible();
  await player.getByRole("button", { name: "Restart onboarding" }).click();
  for (const name of [
    "English",
    "Sam",
    "Advanced",
    "Forex",
    "Swing",
    "High",
    "Use demo account",
    "Accept disclaimer",
  ])
    await player.getByRole("button", { name, exact: true }).click();
  await expect(
    player.getByText("Demo account 880042 submitted for review.", {
      exact: false,
    }),
  ).toBeVisible();
  await player.getByRole("button", { name: "Strategy website" }).click();
  await player.getByRole("button", { name: "Choose sample strategy" }).click();
  await expect(
    player.getByRole("button", { name: "Set up on demo MT5" }),
  ).toHaveCount(0);
  await player
    .getByRole("button", { name: "Simulate email verification" })
    .click();
  await player.getByRole("button", { name: "Set up on demo MT5" }).click();
  await expect(
    player.getByText("Sample strategy attached", { exact: false }),
  ).toBeVisible();
});

test("trading blocks excess risk, supports cancellation and confirms once", async ({
  page,
}) => {
  const player = page.locator("#demo-player");
  await player
    .getByRole("button", { name: "Trading harness", exact: false })
    .click();
  await player.getByRole("button", { name: "Try it yourself" }).click();
  await player.getByLabel("Lots", { exact: true }).fill("1");
  await player.getByRole("button", { name: "Review demo order" }).click();
  await expect(player.getByText("Blocked:", { exact: false })).toBeVisible();
  await expect(
    player.getByRole("button", { name: "Confirm demo order" }),
  ).toHaveCount(0);
  await player.getByLabel("Lots", { exact: true }).fill("0.01");
  await player.getByRole("button", { name: "Review demo order" }).click();
  await player.getByRole("button", { name: "Cancel order" }).click();
  await expect(player.locator(".position-count")).toHaveText("0 positions");
  await player.getByRole("button", { name: "Review demo order" }).click();
  await player.getByRole("button", { name: "Confirm demo order" }).click();
  await expect(player.locator(".position-count")).toHaveText(
    "1 simulated position",
  );
  await expect(
    player.getByRole("button", { name: "Confirm demo order" }),
  ).toHaveCount(0);
});

test("questions are safely rendered with sample sources and injection explanation", async ({
  page,
}) => {
  const player = page.locator("#demo-player");
  await player.getByRole("button", { name: "Try it yourself" }).click();
  await player.getByRole("button", { name: "Ask about verification" }).click();
  await expect(
    player.getByText("Sample source:", { exact: false }),
  ).toBeVisible();
  await player.getByRole("button", { name: "Test prompt injection" }).click();
  await expect(
    player.getByText("An unguarded system", { exact: false }),
  ).toBeVisible();
  await player.getByRole("textbox").fill("<img src=x onerror=alert(1)>");
  await player
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await expect(player.locator(".demo-feed img")).toHaveCount(0);
  await expect(
    player.getByText("<img src=x onerror=alert(1)>", { exact: true }),
  ).toBeVisible();
});

test("personal and treasury examples finish locally", async ({ page }) => {
  const player = page.locator("#demo-player");
  await player
    .getByRole("button", { name: "Personal mode", exact: false })
    .click();
  await player.getByRole("button", { name: "Try it yourself" }).click();
  await player
    .getByRole("button", { name: "Investigate a failed report" })
    .click();
  await player.getByRole("button", { name: "Review draft" }).click();
  await player
    .getByRole("button", { name: "Approve simulated handoff" })
    .click();
  await expect(
    player.getByText("Demo handoff approved.", { exact: false }),
  ).toBeVisible();
  const treasury = page.locator("#treasury-player");
  await treasury.getByRole("button", { name: "Try it yourself" }).click();
  await treasury.getByRole("button", { name: "Preview scheduled run" }).click();
  await expect(
    treasury.getByText("Monday 09:00", { exact: false }),
  ).toBeVisible();
});

test("mobile reduced-motion layout has no overflow or browser errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.locator("#work").scrollIntoViewIfNeeded();
  await expect(page.locator("#demo-player h3")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("reduced-motion experience links and original proof remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.getByRole("button", { name: "Read the origin story" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#overlayBody img")).toBeVisible();
  await page.getByRole("button", { name: "Close experience detail" }).click();
  await page.getByRole("link", { name: "Watch it, then try it" }).click();
  await expect(page).toHaveURL(/#work$/);
});
