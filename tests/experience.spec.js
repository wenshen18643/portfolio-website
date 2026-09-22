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
    if (id !== "roblox") {
      await expect(page.locator(".case-media").first()).toBeAttached();
    }
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
    page.getByRole("tab", { name: "Getting to know the customer" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close experience detail" }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: /Back to the portfolio/ }),
  ).toHaveCount(0);
  await page.screenshot({ path: "test-results/case-mobile.png" });
});

test("Roblox is the fourth scene in Experience and no AI calls are made", async ({
  page,
}) => {
  const apiCalls = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/chat")) apiCalls.push(request.url());
  });
  const scenes = page.locator("#experience .story-scene");
  await expect(scenes).toHaveCount(4);
  await expect(scenes.nth(0).locator(".story-company")).toHaveText(
    "HeadSpace SS15",
  );
  await expect(scenes.nth(1).locator(".story-company")).toHaveText(
    "Beyond Photography",
  );
  await expect(scenes.nth(2).locator(".story-company")).toHaveText("MUMEC");
  await expect(scenes.nth(3).locator(".story-company")).toHaveText(
    "Side Projects",
  );
  await expect(page.locator("#side-projects")).toHaveCount(0);
  await expect(
    page.locator(".roblox-project, .roblox-art, .build-block"),
  ).toHaveCount(0);
  await expect(page.locator("#projects")).toHaveCount(0);
  await scenes.nth(3).locator('[data-exp="roblox"]').click();
  await expect(page.locator(".case-intro")).toContainText(
    "personal game project",
  );
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(
    page.locator(".case-video-placeholder, .case-media video"),
  ).toHaveCount(0);
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
    const section = shot.locator("xpath=ancestor::section");
    await page
      .locator(`#${await section.getAttribute("aria-labelledby")}`)
      .click();
    const panel = shot.locator("..");
    const label = await panel.getAttribute("aria-labelledby");
    if (label) await page.locator(`#${label}`).click();
    await shot.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        shot.evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    await expect(shot).toHaveCSS("max-height", "none");
  }
  await expect(page.locator(".case-shot").last()).toContainText(
    "/model gpt-5.6-sol medium",
  );
  await expect(page.locator(".case-shot").last()).toContainText("/exit");
  await expect(page.locator(".case-video-placeholder")).toHaveCount(0);
});

test("workflow tabs support keyboard navigation without image links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('[data-exp="beyond"]').click();
  const gallery = page.locator(".case-gallery").first();
  const tabs = gallery.getByRole("tab");
  await expect(gallery.getByRole("tabpanel")).toHaveCount(1);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(gallery.locator(".case-shot").nth(0)).toBeHidden();
  await expect(gallery.locator(".case-shot").nth(1)).toBeVisible();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await expect(page.locator(".case-gallery a, .case-shot-open")).toHaveCount(0);
  await expect(gallery.locator("figcaption").first()).toHaveCSS(
    "font-size",
    "18px",
  );
  await expect(
    page.getByRole("tablist", { name: "Case study chapters" }).getByRole("tab"),
  ).toHaveCount(4);
});

test("chapter tabs replace the visible section and omit employment dates", async ({
  page,
}) => {
  await page.locator('[data-exp="beyond"]').click();
  const tabs = page
    .getByRole("tablist", { name: "Case study chapters" })
    .getByRole("tab");
  await expect(page.locator(".case-section:visible")).toHaveCount(1);
  await expect(page.locator(".case-roles")).toHaveCount(0);
  const initialScroll = await page
    .locator(".case-scroll")
    .evaluate((e) => e.scrollTop);
  await tabs.last().click();
  await expect(page.locator(".case-section:visible")).toHaveCount(1);
  await expect(page.locator(".case-section:visible h3")).toHaveText(
    "A coding workspace inside WhatsApp.",
  );
  expect(await page.locator(".case-scroll").evaluate((e) => e.scrollTop)).toBe(
    initialScroll,
  );
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await expect(page.locator(".case-section:visible h3")).toHaveText(
    "It started in WhatsApp.",
  );
});
