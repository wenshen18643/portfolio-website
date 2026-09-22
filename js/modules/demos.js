import { chapters, treasuryChapter } from "../data/demos.js";
import { createDemoBot } from "./demo-bot.js";

/** Creates a text-only element without interpreting visitor input as HTML. */
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/** Creates one self-contained, narrated player and interactive sandbox. */
function createPlayer(root, entries, isTreasury = false) {
  let chapterIndex = 0;
  let sceneIndex = 0;
  let timer;
  let playing = false;
  let interactive = false;
  const bot = createDemoBot();
  const events = new AbortController();
  let requestController;
  const history = [];
  let waiting = false;
  let viewVersion = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  root.className = "demo-player";
  root.innerHTML = `
    <div class="chapter-tabs" aria-label="Demo chapters"></div>
    <div class="demo-stage">
      <div class="demo-narration"><span class="demo-eyebrow scene-count"></span><h4></h4><p></p><span class="demo-label">Interactive reconstruction · fictional data</span></div>
      <div class="demo-screen zone-dark"><div class="screen-bar"><span class="screen-name"></span><span class="screen-status">DEMO</span></div>
      <div class="account-strip" hidden>MT5 880042 · <span class="account-balance">Balance $10,000.00</span> · <span class="position-count">0 positions</span></div>
      <div class="demo-feed" role="log" aria-live="off" aria-label="Demo transcript"></div>
      <div class="demo-actions" hidden></div>
      <form class="demo-composer" hidden><label class="sr-only">Message the simulated assistant</label><input maxlength="240" autocomplete="off" placeholder="Ask a question…" aria-label="Message the simulated assistant"><button type="submit" aria-label="Send message">↑</button></form></div>
    </div>
    <div class="player-controls"><button class="play-button" type="button">▶ Play walkthrough</button><button class="previous-button" type="button" aria-label="Previous scene">←</button><input class="scene-seek" type="range" min="0" value="0" aria-label="Walkthrough scene"><button class="next-button" type="button" aria-label="Next scene">→</button><button class="try-button" type="button">Try it yourself ↗</button></div>
    <p class="scene-detail"></p>`;
  const find = (selector) => root.querySelector(selector);
  const feed = find(".demo-feed");
  const actions = find(".demo-actions");
  const composer = find(".demo-composer");
  const seek = find(".scene-seek");
  const tabs = find(".chapter-tabs");

  /** Stops this player without leaving a background timer. */
  function pause() {
    clearTimeout(timer);
    playing = false;
    find(".play-button").textContent = "▶ Play walkthrough";
  }

  /** Appends a safely rendered message and keeps the newest message visible. */
  function addMessage(sender, text) {
    const message = createElement(
      "div",
      `demo-message${["You", "Me"].includes(sender) ? " from-user" : ""}`,
    );
    message.append(
      createElement("span", "message-sender", sender),
      createElement("p", "", text),
    );
    feed.append(message);
    feed.scrollTop = feed.scrollHeight;
  }

  /** Replaces the available sandbox actions. */
  function setActions(options) {
    actions.replaceChildren();
    options.forEach(([label, callback]) => {
      const button = createElement("button", "", label);
      button.type = "button";
      button.addEventListener("click", callback);
      actions.append(button);
    });
  }

  /** Renders the selected walkthrough frame. */
  function renderScene() {
    const chapter = entries[chapterIndex];
    const scene = chapter.scenes[sceneIndex];
    root.dataset.surface = chapter.surface;
    root.setAttribute("aria-label", chapter.title);
    find(".scene-count").textContent =
      `SCENE ${String(sceneIndex + 1).padStart(2, "0")} / ${String(chapter.scenes.length).padStart(2, "0")}`;
    find(".demo-narration h4").textContent = scene.label;
    find(".demo-narration p").textContent = scene.text;
    find(".scene-detail").textContent = scene.detail;
    find(".screen-name").textContent =
      scene.view === "strategy"
        ? "strategy / getting started"
        : {
            chat: "Mei · WhatsApp demo",
            trading: "mei / execution harness",
            terminal: isTreasury
              ? "treasury / workflow"
              : "wen-shen / personal workspace",
          }[chapter.surface];
    find(".account-strip").hidden = chapter.surface !== "trading";
    find(".position-count").textContent =
      sceneIndex === 2 ? "1 simulated position" : "0 positions";
    feed.replaceChildren();
    scene.messages.forEach(([sender, text], index) => {
      addMessage(sender, text);
      if (playing && !reducedMotion.matches) {
        feed.lastElementChild.classList.add("message-enter");
        feed.lastElementChild.style.animationDelay = `${index * 450}ms`;
      }
    });
    seek.max = chapter.scenes.length - 1;
    seek.value = sceneIndex;
    seek.setAttribute("aria-valuetext", scene.label);
    find(".previous-button").disabled = sceneIndex === 0;
    find(".next-button").disabled = sceneIndex === chapter.scenes.length - 1;
    tabs
      .querySelectorAll("button")
      .forEach((button, index) =>
        button.setAttribute("aria-pressed", String(index === chapterIndex)),
      );
  }

  /** Returns to the narration and clears sandbox state. */
  function showWalkthrough() {
    viewVersion++;
    requestController?.abort();
    pause();
    interactive = false;
    root.classList.remove("is-interactive");
    actions.hidden = true;
    composer.hidden = true;
    feed.setAttribute("aria-live", "off");
    find(".try-button").textContent = "Try it yourself ↗";
    seek.disabled = false;
    renderScene();
  }

  /** Advances at reading pace while the player remains on screen. */
  function queueFrame() {
    timer = setTimeout(() => {
      if (sceneIndex >= entries[chapterIndex].scenes.length - 1) {
        pause();
        return;
      }
      sceneIndex++;
      renderScene();
      queueFrame();
    }, 6500);
  }

  /** Uses the server model for language and the local engine for account mutations. */
  async function sendBotMessage(text) {
    if (waiting) return;
    waiting = true;
    const currentVersion = viewVersion;
    addMessage("You", text);
    const status = find(".screen-status");
    status.textContent = "typing…";
    composer.querySelector("button").disabled = true;
    actions
      .querySelectorAll("button")
      .forEach((button) => (button.disabled = true));
    requestController = new AbortController();
    const timeout = setTimeout(() => requestController.abort(), 23000);
    let result;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(-12),
          context: bot.context(),
          mode: chapterIndex === 2 ? "personal" : "customer",
        }),
        signal: requestController.signal,
      });
      if (!response.ok) throw new Error("AI unavailable");
      const output = await response.json();
      if (requestController.signal.aborted || currentVersion !== viewVersion)
        return;
      if (typeof output.command === "string" && chapterIndex < 2)
        result = bot.send(output.command);
      else if (typeof output.reply === "string")
        result = {
          text: output.reply,
          suggestions: [],
          account: bot.snapshot(),
        };
      else throw new Error("Invalid reply");
      status.textContent = "AI · DEMO";
    } catch {
      if (
        events.signal.aborted ||
        !interactive ||
        currentVersion !== viewVersion
      )
        return;
      result =
        chapterIndex === 2
          ? {
              text: "AI is unavailable right now. You can still explore the guided personal workflow.",
              suggestions: [],
              account: bot.snapshot(),
            }
          : bot.send(text);
      status.textContent = "OFFLINE DEMO";
    } finally {
      clearTimeout(timeout);
      waiting = false;
      composer.querySelector("button").disabled = false;
    }
    if (!result || currentVersion !== viewVersion) return;
    history.push(
      { role: "user", content: text },
      { role: "assistant", content: result.text },
    );
    if (history.length > 12) history.splice(0, history.length - 12);
    addMessage("Mei", result.text);
    setActions(
      result.suggestions.map((choice) => [
        choice,
        () => sendBotMessage(choice),
      ]),
    );
    find(".account-balance").textContent =
      `Balance $${result.account.balance.toFixed(2)} · Equity $${result.account.equity.toFixed(2)}`;
    find(".position-count").textContent =
      `${result.account.positions.length} positions`;
  }

  /** Prepares an owner-only task example without executing commands. */
  function runPersonalTask(task) {
    addMessage("Me", task);
    addMessage(
      "Context",
      "Fictional owner session. Read sample workspace notes and available tools.",
    );
    addMessage(
      "Plan",
      /report|schedul/i.test(task)
        ? "Inspect the sample schedule and run log → flag the missing source → draft a corrected report."
        : "Inspect the sample workspace → outline the change → prepare a draft → run sample checks.",
    );
    setActions([
      [
        "Review draft",
        () => {
          addMessage(
            "Draft",
            "Source availability check added to the proposed workflow. Sample checks: passed. External actions: none.",
          );
          setActions([
            [
              "Approve simulated handoff",
              () => {
                addMessage(
                  "Handoff",
                  "Demo handoff approved. In a real workflow I would review the actual diff and results. Nothing has been written or executed here.",
                );
                showPersonalMenu();
              },
            ],
            [
              "Discard draft",
              () => {
                addMessage("Agent", "Draft discarded.");
                showPersonalMenu();
              },
            ],
          ]);
        },
      ],
    ]);
  }

  /** Offers bounded tasks inside the fictional owner session. */
  function showPersonalMenu() {
    setActions([
      [
        "Investigate a failed report",
        () => runPersonalTask("Investigate a failed scheduled report."),
      ],
      [
        "Prepare a workspace change",
        () => runPersonalTask("Prepare a workspace change."),
      ],
    ]);
  }

  /** Demonstrates the same sample claims through each treasury workflow. */
  function showTreasuryActions() {
    addMessage(
      "Sample claims",
      "Venue: RM 1,200 · receipt attached\nEquipment: RM 450 · receipt attached\nRefreshments: RM 180 · receipt missing",
    );
    setActions([
      [
        "Run the Python workflow",
        () =>
          addMessage(
            "Script output",
            "3 rows normalized · total RM 1,830 · missing receipt: refreshments RM 180. No spreadsheet changed.",
          ),
      ],
      [
        "Ask AI to review",
        () =>
          addMessage(
            "AI draft",
            "RM 1,650 has receipts. Hold RM 180 for review and request the missing receipt. Sample analysis only.",
          ),
      ],
      [
        "Preview scheduled run",
        () =>
          addMessage(
            "Scheduled preview",
            "Monday 09:00 · collect claims → check receipts → draft summary. Exception for review: RM 180. No real schedule created.",
          ),
      ],
    ]);
  }

  /** Opens a fresh sandbox, independent of the recorded walkthrough. */
  function startSandbox() {
    viewVersion++;
    pause();
    interactive = true;
    feed.replaceChildren();
    feed.setAttribute("aria-live", "polite");
    actions.hidden = false;
    composer.hidden = isTreasury;
    root.classList.add("is-interactive");
    seek.disabled = true;
    find(".previous-button").disabled = true;
    find(".next-button").disabled = true;
    find(".try-button").textContent = "Back to walkthrough";
    find(".scene-count").textContent = "YOUR TURN";
    find(".demo-narration h4").textContent = isTreasury
      ? "Same claims. Your approach."
      : [
          "Take the customer’s seat.",
          "You control the proposal.",
          "Borrow my workspace.",
        ][chapterIndex];
    find(".demo-narration p").textContent = isTreasury
      ? "Run each stage against a tiny fictional claims list."
      : [
          "Complete onboarding, explore the strategy website flow, or test the sample knowledge and injection branches.",
          "Change the order size and stop distance. The local harness checks risk before asking you to confirm.",
          "Choose a task, review the draft, then approve or discard the simulated handoff.",
        ][chapterIndex];
    find(".scene-detail").textContent =
      "Simulated account · fictional prices · no real orders. Your demo account stays with you between chapters.";
    if (isTreasury) showTreasuryActions();
    else if (chapterIndex < 2) {
      root.dataset.surface = "chat";
      find(".screen-name").textContent = "Mei";
      find(".account-strip").hidden = false;
      const account = bot.snapshot();
      find(".account-balance").textContent =
        `Balance $${account.balance.toFixed(2)} · Equity $${account.equity.toFixed(2)}`;
      find(".position-count").textContent =
        `${account.positions.length} positions`;
      addMessage(
        "Mei",
        "Hi Alex. What do you need checked? You can type naturally here — try a strategy, ask a question, or place a demo trade.",
      );
      setActions(
        [
          "Start onboarding",
          "Check strategies for gold",
          "Buy 0.01 gold",
          "Show positions",
        ].map((choice) => [choice, () => sendBotMessage(choice)]),
      );
    } else {
      addMessage(
        "Workspace",
        "Owner-only mode, shown through a fictional session. Choose a task or describe one below.",
      );
      showPersonalMenu();
    }
  }

  entries.forEach((chapter, index) => {
    const button = createElement(
      "button",
      "",
      `${String(index + 1).padStart(2, "0")} / ${chapter.short}`,
    );
    button.type = "button";
    button.addEventListener("click", () => {
      chapterIndex = index;
      sceneIndex = 0;
      showWalkthrough();
    });
    tabs.append(button);
  });
  tabs.hidden = entries.length === 1;
  find(".play-button").addEventListener("click", () => {
    if (playing) {
      pause();
      return;
    }
    if (interactive) showWalkthrough();
    if (sceneIndex === entries[chapterIndex].scenes.length - 1) sceneIndex = 0;
    playing = true;
    renderScene();
    find(".play-button").textContent = "Ⅱ Pause";
    queueFrame();
  });
  find(".try-button").addEventListener("click", () =>
    interactive ? showWalkthrough() : startSandbox(),
  );
  find(".previous-button").addEventListener("click", () => {
    pause();
    sceneIndex = Math.max(0, sceneIndex - 1);
    renderScene();
  });
  find(".next-button").addEventListener("click", () => {
    pause();
    sceneIndex = Math.min(
      entries[chapterIndex].scenes.length - 1,
      sceneIndex + 1,
    );
    renderScene();
  });
  seek.addEventListener("input", () => {
    pause();
    sceneIndex = Number(seek.value);
    renderScene();
  });
  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = composer.querySelector("input");
    const value = input.value.trim();
    if (!value) return;
    input.value = "";
    sendBotMessage(value);
  });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) pause();
    },
    { signal: events.signal },
  );
  reducedMotion.addEventListener("change", pause, { signal: events.signal });
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) pause();
    },
    { threshold: 0.15 },
  );
  observer.observe(root);
  renderScene();
  return () => {
    pause();
    requestController?.abort();
    observer.disconnect();
    events.abort();
  };
}

/** Mounts an experience-specific story and returns its cleanup function. */
export function mountDemo(root, experienceId) {
  return createPlayer(
    root,
    experienceId === "monash" ? [treasuryChapter] : chapters,
    experienceId === "monash",
  );
}
