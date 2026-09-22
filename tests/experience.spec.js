import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
});

for (const [id, title, count] of [
  ["beyond", "Beyond Photography", 4],
  ["monash", "Monash Engineering Club", 2],
  ["headspace", "HeadSpace SS15", 2],
  ["roblox", "Roblox", 1],
]) {
  test(`${id} opens a case study with explanation and media`, async ({
    page,
  }) => {
    const opener = page.locator(`[data-exp="${id}"]`);
    await opener.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#overlayTitle")).toHaveText(title);
    await expect(page.locator(".case-intro")).not.toBeEmpty();
    await expect(page.locator(".case-section")).toHaveCount(count);
    await expect(page.locator(".case-media").first()).toBeAttached();
    await expect(
      page.locator(".demo-player, .demo-composer, .chapter-tabs"),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(opener).toBeFocused();
  });
}

test("treasury keeps the original recordings with native controls", async ({
  page,
}) => {
  await page.locator('[data-exp="monash"]').click();
  const videos = page.locator(".case-media video");
  await expect(videos).toHaveCount(2);
  for (const video of await videos.all()) {
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).not.toHaveAttribute("autoplay");
    const response = await page.request.get(await video.getAttribute("src"));
    expect(response.ok()).toBe(true);
  }
  await expect(page.locator(".case-copy h3")).toHaveText([
    "First, I wrote the code.",
    "Then AI made it a daily workflow.",
  ]);
});

test("mobile case studies fit without empty media placeholders", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-exp="beyond"]').click();
  const scroll = page.locator(".case-scroll");
  expect(
    await scroll.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".case-video-placeholder")).toHaveCount(0);
  await expect(
    page.locator(
      ".case-video-placeholder button, .case-video-placeholder video",
    ),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Close experience detail" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Back to the portfolio" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close experience detail" }),
  ).toBeFocused();
  await page.screenshot({ path: "test-results/case-mobile.png" });
});

test("Roblox is a personal project inside experience and no AI calls are made", async ({
  page,
}) => {
  const apiCalls = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/chat")) apiCalls.push(request.url());
  });
  await expect(page.locator('#experience [data-exp="roblox"]')).toBeVisible();
  await expect(page.locator("#projects")).toHaveCount(0);
  await page.locator('[data-exp="roblox"]').click();
  await expect(page.locator(".case-roles")).toContainText("Personal project");
  await expect(page.getByRole("textbox")).toHaveCount(0);
  expect(apiCalls).toEqual([]);
});

test("Mei screenshots follow the customer journey and end with private Codex controls", async ({
  page,
}) => {
  await page.locator('[data-exp="beyond"]').click();
  const images = page.locator(".case-shot img");
  await expect(images).toHaveCount(8);
  const names = [
    "onboarding-profile",
    "onboarding-confirmation",
    "strategy-marketplace-redacted",
    "market-analysis",
    "trade-execution",
    "trade-updates",
    "codex-work",
    "codex-controls",
  ];
  for (let i = 0; i < names.length; i++) {
    const shot = images.nth(i);
    await expect(shot).toHaveAttribute("src", new RegExp(names[i]));
    await shot.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        shot.evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    await expect(shot).toHaveCSS("max-height", "none");
    const link = page.locator(".case-shot-link").nth(i);
    await expect(link).toHaveAttribute("href", await shot.getAttribute("src"));
    await expect(link).toHaveAttribute("target", "_blank");
  }
  await expect(page.locator(".case-shot").last()).toContainText(
    "/model gpt-5.6-sol medium",
  );
  await expect(page.locator(".case-shot").last()).toContainText("/exit");
  await expect(page.locator(".case-video-placeholder")).toHaveCount(0);
});

test("screenshots use the gallery width and captions sit below images", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('[data-exp="beyond"]').click();
  await expect(
    page.getByRole("heading", { name: "Keeping it running." }),
  ).toHaveCount(0);
  const shots = page.locator(".case-gallery").first().locator(".case-shot");
  const first = await shots.nth(0).boundingBox();
  const second = await shots.nth(1).boundingBox();
  expect(Math.abs(first.y - second.y)).toBeLessThan(2);
  expect(second.x).toBeGreaterThan(first.x);
  for (const shot of await shots.all()) {
    const image = await shot.locator("img").boundingBox();
    const caption = await shot.locator("figcaption").boundingBox();
    expect(caption.y).toBeGreaterThanOrEqual(image.y + image.height);
  }
});
