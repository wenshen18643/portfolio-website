import { createDemoBot } from "./demo-bot.js";

/** Creates safe text content for conversation messages. */
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/** Mounts a conversational demo with Mei-derived onboarding and server replies. */
export function mountDemo(root, experienceId) {
  if (experienceId === "monash") {
    root.className = "treasury-evolution";
    root.innerHTML =
      "<p><strong>01 / Pure code</strong>Python pulled Asana data, cleaned it, and updated the budget tracker.</p><p><strong>02 / AI got better</strong>The workflow evolved from moving rows to helping review claims and spot missing information.</p><p><strong>03 / Scheduled work</strong>Prepare the review on a schedule and bring the exceptions back to me.</p>";
    return () => {};
  }
  const bot = createDemoBot();
  const history = [];
  let chapter = 0;
  let controller;
  let viewVersion = 0;
  let waiting = false;
  let disposed = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  root.className = "demo-player is-interactive";
  root.dataset.surface = "chat";
  root.innerHTML = `<div class="chapter-tabs" aria-label="Demo chapters"></div>
    <div class="demo-stage"><div class="demo-screen zone-dark">
    <div class="screen-bar"><span class="screen-name">Mei</span><span class="screen-status">DEMO</span></div>
    <div class="account-strip" hidden>MT5 880042 · <span class="account-balance"></span> · <span class="position-count"></span></div>
    <div class="demo-feed" role="log" aria-live="polite" aria-label="Demo transcript"></div>
    <form class="demo-composer"><input maxlength="500" autocomplete="off" placeholder="输入消息…" aria-label="Message the simulated assistant"><button type="submit" aria-label="Send message">↑</button></form>
    </div></div><p class="scene-detail">AI chat · fictional account and prices · no real orders</p>`;
  const find = (selector) => root.querySelector(selector);
  const feed = find(".demo-feed");
  const input = find("input");
  const sendButton = find(".demo-composer button");
  const status = find(".screen-status");

  /** Keeps the fictional account display synchronized with execution results. */
  function renderAccount() {
    const account = bot.snapshot();
    find(".account-balance").textContent =
      `Balance $${account.balance.toFixed(2)} · Equity $${account.equity.toFixed(2)}`;
    find(".position-count").textContent =
      `${account.positions.length} positions`;
  }

  /** Adds a message without reserving space for future bubbles. */
  function addMessage(sender, text) {
    const message = createElement(
      "div",
      `demo-message${sender === "You" ? " from-user" : ""}`,
    );
    message.append(
      createElement("span", "message-sender", sender),
      createElement("p", "", text),
    );
    feed.append(message);
    feed.scrollTo({
      top: feed.scrollHeight,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
    return message;
  }

  /** Makes a bounded server request using this turn's cancellation signal. */
  async function requestReply(body, signal) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        ...body,
        history: history.slice(-12),
        context: bot.context(),
        mode: chapter === 2 ? "personal" : "customer",
      }),
    });
    if (!response.ok) throw new Error("AI unavailable");
    return response.json();
  }

  /** Executes validated actions, then lets Mei phrase their actual results. */
  async function sendMessage(text) {
    if (waiting) return;
    waiting = true;
    const version = viewVersion;
    const requestController = new AbortController();
    controller = requestController;
    const timeout = setTimeout(() => requestController.abort(), 45000);
    addMessage("You", text);
    const typing = addMessage("Mei", "…");
    typing.classList.add("typing-message");
    sendButton.disabled = true;
    status.textContent = "typing…";
    let result;
    try {
      const output = await requestReply(
        { message: text },
        requestController.signal,
      );
      if (version !== viewVersion || disposed) return;
      if (typeof output.command === "string" && chapter < 2) {
        result = bot.send(output.command);
        renderAccount();
        const rendered = await requestReply(
          { phase: "render", message: text, toolResult: result.text },
          requestController.signal,
        );
        if (typeof rendered.reply !== "string")
          throw new Error("Invalid response");
        result.text = rendered.reply;
      } else if (typeof output.reply === "string")
        result = { text: output.reply };
      else throw new Error("Invalid response");
      if (version !== viewVersion || disposed) return;
      status.textContent = "AI · DEMO";
    } catch {
      if (version !== viewVersion || disposed) return;
      if (!result && chapter < 2) result = bot.send(text);
      const chinese = bot.context().profile.language === "Mandarin";
      if (chinese && bot.context().onboardingStep >= 1)
        result = bot.currentQuestion();
      else if (chinese)
        result = {
          text: "AI 暂时无法连接。模拟账户的最新状态显示在上方，请稍后再试。",
        };
      else
        result ||= { text: "AI is temporarily unavailable. Please try again." };
      status.textContent = "OFFLINE DEMO";
    } finally {
      clearTimeout(timeout);
      typing.remove();
      if (version === viewVersion) {
        waiting = false;
        sendButton.disabled = false;
      }
    }
    if (version !== viewVersion || disposed) return;
    history.push(
      { role: "user", content: text },
      { role: "assistant", content: result.text },
    );
    if (history.length > 12) history.splice(0, history.length - 12);
    addMessage("Mei", result.text);
    input.placeholder =
      bot.context().profile.language === "Mandarin"
        ? "输入消息…"
        : "Message Mei…";
    renderAccount();
  }

  /** Switches workspaces without leaving an old request attached to a new view. */
  function selectChapter(index) {
    controller?.abort();
    viewVersion++;
    waiting = false;
    sendButton.disabled = false;
    chapter = index;
    history.length = 0;
    feed.replaceChildren();
    status.textContent = "DEMO";
    find(".screen-name").textContent =
      index === 2 ? "Mei / Personal workspace" : "Mei";
    find(".account-strip").hidden = index !== 1;
    root
      .querySelectorAll(".chapter-tabs button")
      .forEach((button, item) =>
        button.setAttribute("aria-pressed", String(item === index)),
      );
    if (index === 0) addMessage("Mei", bot.send("start onboarding").text);
    else {
      bot.leaveOnboarding();
      addMessage(
        "Mei",
        index === 1
          ? "模拟账户 880042 已就绪。你可以让我查看策略、下单、查询持仓或平仓。比如：买入 0.01 手黄金，止损 2390，止盈 2420。"
          : "这里是个人工作区演示。你想让我帮你处理什么任务？",
      );
    }
    renderAccount();
  }
  ["Customer service", "Trading harness", "Personal mode"].forEach(
    (label, index) => {
      const button = createElement(
        "button",
        "",
        `${String(index + 1).padStart(2, "0")} / ${label}`,
      );
      button.type = "button";
      button.addEventListener("click", () => selectChapter(index));
      find(".chapter-tabs").append(button);
    },
  );
  find("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || waiting) return;
    input.value = "";
    sendMessage(text);
  });
  selectChapter(0);
  return () => {
    disposed = true;
    controller?.abort();
  };
}
