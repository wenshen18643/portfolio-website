import { test, expect } from "@playwright/test";
import { createDemoBot } from "../js/modules/demo-bot.js";
import { normalizeLanguage } from "../js/mei/language.js";

async function openDemo(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Watch it, then try it" }).click();
  return page.locator("#experience-demo");
}

async function send(player, text) {
  await player.getByRole("textbox").fill(text);
  await player
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await expect(
    player.getByRole("button", { name: "Send message", exact: true }),
  ).toBeEnabled();
}

test("neutral welcome, no language buttons, and selected Chinese survives names", async ({
  page,
}) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  const player = await openDemo(page);
  await expect(
    player.getByRole("button", {
      name: /Play walkthrough|Try it yourself|English/,
    }),
  ).toHaveCount(0);
  await expect(
    player.getByText("Which language would you like to use?", { exact: false }),
  ).toBeVisible();
  await send(player, "Chinese");
  await send(player, "John");
  await expect(player.locator(".demo-message").last()).toContainText(
    "你有多少交易经验",
  );
  await send(player, "新手");
  await expect(player.locator(".demo-message").last()).toContainText(
    "你主要关注哪些市场",
  );
});

test("Mei aliases retain language and onboarding fields", () => {
  expect(normalizeLanguage("Chinese", {})).toEqual({
    field: "language",
    value: "Mandarin",
  });
  expect(normalizeLanguage("中文", {})).toEqual({
    field: "language",
    value: "Mandarin",
  });
  const bot = createDemoBot();
  bot.send("start onboarding");
  bot.send("Chinese");
  bot.send("John");
  bot.send("新手");
  expect(bot.context().profile).toMatchObject({
    language: "Mandarin",
    name: "John",
    tradingExperience: "新手",
  });
  expect(bot.send("English").text).toContain("markets");
  expect(bot.context().onboardingStep).toBe(3);
});

test("model presentation follows execution and does not execute twice on rendering failure", async ({
  page,
}) => {
  let failRender = false;
  await page.route("**/api/chat", (route) => {
    const body = route.request().postDataJSON();
    if (body.phase === "render")
      return route.fulfill({
        status: failRender ? 502 : 200,
        contentType: "application/json",
        body: JSON.stringify({ reply: "请确认这笔模拟订单。" }),
      });
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ command: body.message }),
    });
  });
  const player = await openDemo(page);
  await player
    .getByRole("button", { name: "Trading harness", exact: false })
    .click();
  await send(player, "buy 0.01 gold SL 2390 TP 2420");
  await expect(player.locator(".demo-message").last()).toContainText("请确认");
  failRender = true;
  await send(player, "yes");
  await expect(player.locator(".position-count")).toHaveText("1 positions");
  await expect(player.locator(".screen-status")).toHaveText("OFFLINE DEMO");
  await send(player, "yes");
  await expect(player.locator(".position-count")).toHaveText("1 positions");
});

test("chapter switches cancel late replies and mobile overlay remains usable", async ({
  page,
}) => {
  let release;
  await page.route("**/api/chat", async (route) => {
    await new Promise((resolve) => {
      release = resolve;
    });
    await route
      .fulfill({
        contentType: "application/json",
        body: '{"reply":"OLD RESPONSE"}',
      })
      .catch(() => {});
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const player = await openDemo(page);
  await player.getByRole("textbox").fill("hello");
  await player
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await expect.poll(() => Boolean(release)).toBe(true);
  await player
    .getByRole("button", { name: "Trading harness", exact: false })
    .click();
  release();
  await expect(player.getByText("OLD RESPONSE")).toHaveCount(0);
  expect(
    await page
      .locator(".overlay-grid")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  const gap = await page.evaluate(
    () =>
      document.querySelector(".chapter-tabs").getBoundingClientRect().top -
      document.querySelector(".ov-roles").getBoundingClientRect().bottom,
  );
  expect(gap).toBeLessThan(40);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("trade validation, cancellation, positions and P&L stay deterministic", () => {
  const bot = createDemoBot();
  bot.send("English");
  expect(bot.send("buy 1 gold SL 2390 TP 2420").text).toContain("blocked");
  bot.send("buy 0.01 gold SL 2390 TP 2420");
  bot.send("no");
  expect(bot.send("yes").account.positions).toHaveLength(0);
  bot.send("buy 0.01 gold SL 2390 TP 2420");
  bot.send("yes");
  expect(bot.send("show positions").text).toContain("DEMO-001");
  bot.send("advance market");
  bot.send("close all");
  expect(bot.send("yes").account.balance).toBe(10002);
});

test("restart clears the entire session and separate visitors remain independent", async ({
  page,
  context,
}) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  const player = await openDemo(page);
  await send(player, "Chinese");
  await send(player, "John");
  await player
    .getByRole("button", { name: "Trading harness", exact: false })
    .click();
  await send(player, "buy 0.01 gold SL 2390 TP 2420");
  await send(player, "yes");
  await expect(player.locator(".position-count")).toHaveText("1 positions");
  const otherPage = await context.newPage();
  const other = await openDemo(otherPage);
  await expect(
    other.getByText("Which language would you like to use?", { exact: false }),
  ).toBeVisible();
  await other
    .getByRole("button", { name: "Trading harness", exact: false })
    .click();
  await expect(other.locator(".position-count")).toHaveText("0 positions");
  await player
    .getByRole("button", { name: "Restart demo", exact: true })
    .click();
  await expect(
    player.getByText("Which language would you like to use?", { exact: false }),
  ).toBeVisible();
  await expect(player.getByText("John", { exact: true })).toHaveCount(0);
  await player
    .getByRole("button", { name: "Trading harness", exact: false })
    .click();
  await expect(player.locator(".position-count")).toHaveText("0 positions");
  await expect(player.locator(".account-balance")).toContainText(
    "Balance $10000.00",
  );
});

test("customer onboarding precedes the strategy marketplace and consent is required", () => {
  const bot = createDemoBot();
  bot.send("start onboarding");
  bot.send("English");
  expect(bot.send("show strategies").text).toContain("call you");
  for (const answer of ["Alex", "Beginner", "Gold", "Swing", "Low"])
    bot.send(answer);
  expect(bot.send("copy Gold Intraday").text).toContain("disclaimer");
  expect(bot.context().pending).toBeNull();
  expect(bot.send("i accept").text).toContain(
    "Next is the strategy marketplace",
  );
  expect(bot.send("copy Gold Intraday").text).toContain("Reply YES");
});

test("demo account is assigned automatically and risk leads directly to consent", () => {
  const bot = createDemoBot();
  expect(bot.context().profile.mt5Account).toBe("880042");
  bot.send("start onboarding");
  for (const answer of ["English", "Alex", "Beginner", "Gold", "Swing"])
    bot.send(answer);
  expect(bot.send("medium to high").text).toContain("risk disclaimer");
  expect(bot.context().onboardingStep).toBe(6);
  expect(bot.send("yes").text).toContain("strategy marketplace");
});
