import { normalizeLanguage } from "../mei/language.js";
const markets = {
  XAUUSD: { price: 2400, contract: 100, move: 2, label: "gold" },
  BTCUSD: { price: 60000, contract: 1, move: 100, label: "bitcoin" },
  EURUSD: { price: 1.08, contract: 100000, move: 0.001, label: "euro" },
};
const strategies = ["Trend Follow", "Gold Intraday", "Reversal Watch"];
const questions = [
  ["Which language would you like to use?", ["English"]],
  ["What should I call you? Use a fictional name.", ["Alex", "Sam"]],
  ["What’s your trading experience?", ["Beginner", "Intermediate", "Advanced"]],
  ["Which markets interest you?", ["Gold", "Bitcoin", "Forex"]],
  [
    "Do you prefer scalping, intraday, or swing trading?",
    ["Scalping", "Intraday", "Swing"],
  ],
  ["What’s your risk appetite?", ["Low", "Medium", "High"]],
  [
    "Trading can result in losses. Do you accept the sample risk disclaimer?",
    ["I accept", "Decline"],
  ],
];

/** Finds a supported market from a conversational message. */
function findSymbol(text) {
  if (/gold|xau/i.test(text)) return "XAUUSD";
  if (/bitcoin|btc/i.test(text)) return "BTCUSD";
  if (/eur|forex/i.test(text)) return "EURUSD";
  return null;
}

/** Creates an isolated, stateful account and conversation; no network or storage. */
export function createDemoBot() {
  const state = {
    balance: 10000,
    prices: Object.fromEntries(
      Object.entries(markets).map(([key, value]) => [key, value.price]),
    ),
    positions: [],
    history: [],
    tasks: [],
    pending: null,
    draft: null,
    onboarding: -1,
    profile: { mt5Account: "880042" },
    registered: false,
    verified: false,
    registration: null,
    lastStrategy: strategies[0],
    nextTicket: 1,
  };
  let suggestions = [];
  const money = (value) => value.toFixed(2);
  const pnl = (position) =>
    (state.prices[position.symbol] - position.entry) *
    (position.side === "BUY" ? 1 : -1) *
    position.lots *
    markets[position.symbol].contract;

  /** Returns a current account snapshot for rendering. */
  function snapshot() {
    const floating = state.positions.reduce(
      (total, position) => total + pnl(position),
      0,
    );
    return {
      balance: state.balance,
      equity: state.balance + floating,
      floating,
      positions: state.positions.map((position) => ({
        ...position,
        pnl: pnl(position),
      })),
      history: state.history.map((position) => ({ ...position })),
      tasks: state.tasks.map((task) => ({ ...task })),
      prices: { ...state.prices },
    };
  }

  /** Packages one assistant turn and its optional quick replies. */
  function reply(text, choices = []) {
    suggestions = state.profile.language === "Mandarin" ? [] : choices;
    return { text, suggestions, account: snapshot() };
  }

  /** Asks the next profile question without losing interrupted onboarding. */
  function askProfile() {
    if (state.profile.language === "Mandarin")
      return reply(
        [
          "你想用什么语言聊天？",
          "请问怎么称呼你？演示中可以使用化名。",
          "你有多少交易经验？是新手、中级、高级，还是专业交易者？",
          "你主要关注哪些市场？例如黄金、外汇或加密货币。",
          "你偏好哪种交易风格：短线、日内，还是波段？",
          "你的风险偏好是低、中，还是高？",
          "交易存在亏损风险。你是否接受这份演示风险声明？",
        ][state.onboarding],
      );
    return reply(
      questions[state.onboarding][0],
      questions[state.onboarding][1],
    );
  }

  /** Checks all order fields before creating a confirmable proposal. */
  function prepareOrder() {
    const order = state.draft;
    if (!order.symbol)
      return reply("Which market — gold, bitcoin, or EURUSD?", [
        "Gold",
        "Bitcoin",
        "EURUSD",
      ]);
    if (!order.lots)
      return reply("What lot size should I use?", ["0.01 lots", "0.05 lots"]);
    const price = state.prices[order.symbol];
    if (order.stop === undefined)
      return reply(
        `What stop-loss price? ${order.symbol} is ${price} in this simulation.`,
        [
          `SL ${price - (order.side === "BUY" ? 1 : -1) * markets[order.symbol].move * 5}`,
        ],
      );
    if (order.target === undefined)
      return reply("And the take-profit price?", [
        `TP ${price + (order.side === "BUY" ? 1 : -1) * markets[order.symbol].move * 10}`,
      ]);
    const direction = order.side === "BUY" ? 1 : -1;
    if (
      !Number.isFinite(order.lots) ||
      order.lots < 0.01 ||
      order.lots > 1 ||
      Math.abs(order.lots * 100 - Math.round(order.lots * 100)) > 0.00001
    ) {
      order.lots = null;
      return reply("Use 0.01–1.00 lots in steps of 0.01.", ["0.01 lots"]);
    }
    if (
      !Number.isFinite(order.stop) ||
      order.stop <= 0 ||
      (price - order.stop) * direction <= 0
    ) {
      delete order.stop;
      return reply(
        `For a ${order.side}, the stop must be ${direction === 1 ? "below" : "above"} ${price}. Send a new SL price.`,
      );
    }
    if (
      !Number.isFinite(order.target) ||
      order.target <= 0 ||
      (order.target - price) * direction <= 0
    ) {
      delete order.target;
      return reply(
        `For a ${order.side}, the target must be ${direction === 1 ? "above" : "below"} ${price}. Send a new TP price.`,
      );
    }
    const risk =
      Math.abs(price - order.stop) *
      order.lots *
      markets[order.symbol].contract;
    const totalRisk = state.positions.reduce(
      (total, position) =>
        total +
        Math.abs(position.entry - position.stop) *
          position.lots *
          markets[position.symbol].contract,
      0,
    );
    if (risk > 100 || totalRisk + risk > 200 || risk > state.balance) {
      state.draft = null;
      return reply(
        `Order blocked: $${money(risk)} stop risk. Demo limits are $100 per order and $200 across open positions. Try a smaller order.`,
      );
    }
    state.pending = { type: "trade", order: { ...order, entry: price } };
    state.draft = null;
    return reply(
      `${order.side} ${order.lots} lot ${order.symbol} at ${price}\nSL ${order.stop} · TP ${order.target}\nStop risk $${money(risk)} on demo MT5 880042. Reply YES to place it or NO to cancel.`,
      ["YES", "NO"],
    );
  }

  /** Extracts explicitly supplied trade fields, including follow-up answers. */
  function updateOrder(text) {
    const order = state.draft;
    order.symbol = findSymbol(text) || order.symbol;
    const lots =
      text.match(/(\d*\.?\d+)\s*lots?\b/i) ||
      text.match(/\b(?:buy|sell)\s+(\d*\.?\d+)/i) ||
      text.match(/\b(?:gold|bitcoin|xauusd|btcusd|eurusd)\s+(\d*\.?\d+)/i);
    if (lots) order.lots = Number(lots[1]);
    const stop = text.match(
      /\b(?:sl|stop(?:\s*loss)?)\s*[:=@]?\s*(-?\d*\.?\d+)/i,
    );
    const target = text.match(
      /\b(?:tp|take\s*profit|target)\s*[:=@]?\s*(-?\d*\.?\d+)/i,
    );
    if (stop) order.stop = Number(stop[1]);
    if (target) order.target = Number(target[1]);
    if (/^\d*\.?\d+$/.test(text)) {
      if (!order.lots) order.lots = Number(text);
      else if (order.stop === undefined) order.stop = Number(text);
      else if (order.target === undefined) order.target = Number(text);
    }
    return prepareOrder();
  }

  /** Realizes a position at the current fictional quote. */
  function closePosition(position) {
    const profit = pnl(position);
    state.balance += profit;
    state.history.push({
      ...position,
      exit: state.prices[position.symbol],
      profit,
    });
    state.positions = state.positions.filter(
      (item) => item.ticket !== position.ticket,
    );
    return `${position.ticket}: closed ${position.symbol} · P&L $${money(profit)}`;
  }

  /** Handles one message, preserving conversation and confirmation boundaries. */
  function send(raw) {
    let text = raw.trim().slice(0, 500);
    if (
      state.onboarding === questions.length - 1 &&
      /^(yes|yes please|confirm|是|好的|确认)[.!。！]*$/i.test(text)
    )
      text = "i accept";
    const language = normalizeLanguage(text, {});
    if (language) {
      state.profile.language = language.value;
      if (state.onboarding === 0) state.onboarding = 1;
      return state.onboarding >= 0
        ? askProfile()
        : reply(
            language.value === "Mandarin"
              ? "好的，我们用中文聊。有什么需要我帮你查看？"
              : `We’ll continue in ${language.value}. How can I help?`,
          );
    }
    if (!text) return reply("What would you like to check?", suggestions);
    if (
      state.onboarding >= 0 &&
      /\b(buy|sell|copy|claim|strategies|strats|marketplace)\b|策略市场|买入|卖出/.test(
        text.toLowerCase(),
      ) &&
      !/\?|\b(?:how|what|why)\b|什么|怎么/.test(text.toLowerCase())
    ) {
      return askProfile();
    }

    if (
      /ignore.{0,40}instruction|reveal.{0,40}(prompt|customer|secret)|bypass|system prompt/i.test(
        text,
      )
    )
      return reply(
        "I can explain account setup, but I can’t reveal private records or bypass verification. Retrieved text is a source, not an instruction. [Demo access guide §1]",
        suggestions,
      );
    if (
      /^(no|nope|cancel|decline)$/i.test(text) &&
      (state.pending || state.draft || state.registration)
    ) {
      state.pending = null;
      state.draft = null;
      state.registration = null;
      return reply("Cancelled. Nothing changed on your account.", [
        "Show positions",
        "Check strategies for gold",
      ]);
    }
    if (/^(yes|confirm|yes please|confirm demo order)$/i.test(text)) {
      if (!state.pending)
        return reply(
          "There’s no action waiting for confirmation. What would you like to do?",
          ["Buy 0.01 gold", "Check strategies for gold"],
        );
      const pending = state.pending;
      state.pending = null;
      if (pending.type === "trade") {
        const position = {
          ...pending.order,
          ticket: `DEMO-${String(state.nextTicket++).padStart(3, "0")}`,
        };
        state.positions.push(position);
        return reply(
          `Done — ${position.ticket}\n${position.side} ${position.lots} lot ${position.symbol} filled at ${position.entry}. SL ${position.stop}, TP ${position.target}.`,
          ["Show positions", "Advance market", "Close all positions"],
        );
      }
      if (pending.type === "close")
        return reply(
          pending.tickets
            .map((ticket) =>
              state.positions.find((position) => position.ticket === ticket),
            )
            .filter(Boolean)
            .map(closePosition)
            .join("\n") || "Those positions are already closed.",
          ["Show my P&L", "Trade history"],
        );
      if (!state.verified) {
        state.registration = "name";
        return reply(
          "You’ll need a marketplace profile first. What fictional name should I use?",
          ["Alex Demo"],
        );
      }
      if (state.tasks.some((task) => task.name === pending.name))
        return reply(`${pending.name} is already on your demo account.`, [
          "Show tasks",
        ]);
      state.tasks.push({ name: pending.name, status: "Active" });
      return reply(`${pending.name} is now set up on demo MT5 880042.`, [
        "Show tasks",
        "Deactivate all tasks",
      ]);
    }
    if (/^advance market$/i.test(text)) {
      if (state.pending || state.draft)
        return reply(
          "Confirm or cancel the current proposal before advancing the quote.",
          ["YES", "NO"],
        );
      for (const [symbol, market] of Object.entries(markets))
        state.prices[symbol] = Number(
          (state.prices[symbol] + market.move).toFixed(5),
        );
      const closed = state.positions
        .filter((position) =>
          position.side === "BUY"
            ? state.prices[position.symbol] >= position.target ||
              state.prices[position.symbol] <= position.stop
            : state.prices[position.symbol] <= position.target ||
              state.prices[position.symbol] >= position.stop,
        )
        .map(closePosition);
      return reply(
        `Sample quotes advanced one step.\n${closed.join("\n") || "Open positions marked to the new quotes."}\nEquity $${money(snapshot().equity)}.`,
        ["Show positions", "Advance market", "Close all positions"],
      );
    }
    if (/\b(close|exit)\b/i.test(text)) {
      if (state.pending || state.draft)
        return reply("Confirm or cancel the current proposal first.", [
          "YES",
          "NO",
        ]);
      const ticket = text.match(/DEMO-\d+/i)?.[0].toUpperCase();
      const symbol = findSymbol(text);
      const positions = state.positions.filter((position) =>
        ticket
          ? position.ticket === ticket
          : symbol
            ? position.symbol === symbol
            : true,
      );
      if (!positions.length)
        return reply("No matching open positions. Nothing to close.", [
          "Show positions",
        ]);
      state.pending = {
        type: "close",
        tickets: positions.map((position) => position.ticket),
      };
      return reply(
        `Close ${positions.length} position(s) at the current sample quote? Estimated P&L $${money(positions.reduce((total, position) => total + pnl(position), 0))}.`,
        ["YES", "NO"],
      );
    }
    if (
      /\b(positions?|balance|equity|profit|p&l|pnl|history)\b/i.test(text) &&
      !/\b(buy|sell|sl|tp)\b/i.test(text)
    ) {
      if (/history/i.test(text))
        return reply(
          state.history
            .map(
              (position) =>
                `${position.ticket} ${position.side} ${position.symbol} · realized $${money(position.profit)}`,
            )
            .join("\n") || "No closed trades yet.",
        );
      const account = snapshot();
      return reply(
        `Demo MT5 880042\nBalance $${money(account.balance)} · equity $${money(account.equity)}\nFloating P&L $${money(account.floating)} · realized $${money(state.balance - 10000)}\n${account.positions.map((position) => `${position.ticket} ${position.side} ${position.lots} ${position.symbol} @ ${position.entry} · $${money(position.pnl)}`).join("\n") || "No open positions."}`,
        ["Buy 0.01 gold", "Advance market", "Trade history"],
      );
    }
    if (/chart|price|quote/i.test(text)) {
      const symbol = findSymbol(text) || "XAUUSD";
      return reply(
        `${symbol}: ${state.prices[symbol]} (fictional quote).\nSample chart sequence: ${[4, 3, 5, 2, 1, 0].map((offset) => Number((state.prices[symbol] - offset * markets[symbol].move).toFixed(5))).join(" → ")}\nUse Advance market to move this scenario one step.`,
        ["Advance market", `Buy 0.01 ${symbol}`],
      );
    }
    if (/\b(task|tasks)\b/i.test(text)) {
      if (/deactivate|pause|stop/i.test(text))
        state.tasks.forEach((task) => (task.status = "Inactive"));
      else if (/activate|resume/i.test(text))
        state.tasks.forEach((task) => (task.status = "Active"));
      return reply(
        state.tasks
          .map((task) => `${task.name} · ${task.status} · MT5 880042`)
          .join("\n") || "No strategy tasks yet.",
        ["Check strategies for gold"],
      );
    }
    if (state.registration) {
      if (state.registration === "name") {
        state.profile.marketplaceName = text;
        state.registration = "email";
        return reply(
          `Thanks, ${text}. Use alex@example.test as your demo email.`,
          ["alex@example.test"],
        );
      }
      if (state.registration === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
          return reply(
            "Enter a valid fictional email, such as alex@example.test.",
          );
        state.registered = true;
        state.registration = "verify";
        return reply(
          "Demo profile created. Verification is still required. Open the simulated verification email to continue.",
          ["Verify demo email"],
        );
      }
      if (!/^verify demo email$/i.test(text))
        return reply("Your profile is waiting for email verification.", [
          "Verify demo email",
        ]);
      state.verified = true;
      state.registration = null;
      state.pending = { type: "strategy", name: state.lastStrategy };
      return reply(
        `Email verified. Set up ${state.lastStrategy} on demo MT5 880042?`,
        ["YES", "NO"],
      );
    }
    if (
      /\b(copy|claim|install|set up)\b/i.test(text) ||
      strategies.some((name) => text.toLowerCase() === name.toLowerCase())
    ) {
      if (state.pending || state.draft)
        return reply("Please confirm or cancel the current proposal first.", [
          "YES",
          "NO",
        ]);
      state.lastStrategy =
        strategies.find((name) =>
          text.toLowerCase().includes(name.toLowerCase()),
        ) || state.lastStrategy;
      state.pending = { type: "strategy", name: state.lastStrategy };
      return reply(
        `Claim ${state.lastStrategy} for demo MT5 880042? Reply YES to proceed or NO to cancel.`,
        ["YES", "NO"],
      );
    }
    if (/strateg|strats|best.*bitcoin/i.test(text)) {
      const symbol = findSymbol(text) || "XAUUSD";
      state.lastStrategy = symbol === "XAUUSD" ? strategies[1] : strategies[0];
      return reply(
        `For ${markets[symbol].label}, explore these fictional strategies:\n${strategies.map((name, index) => `${index + 1}. ${name}${state.tasks.some((task) => task.name === name) ? " — already claimed" : ""}`).join("\n")}\nWant to try ${state.lastStrategy}?`,
        ["Copy that for me", "How does verification work?"],
      );
    }
    if (/how|what is|why|\?/.test(text.toLowerCase())) {
      if (/risk|loss|profit|sl|stop/i.test(text))
        return reply(
          "A stop-loss limits the intended loss but cannot guarantee a live fill price. This simulator uses fixed contract sizes and caps proposed stop risk at $100 per order. [Demo risk guide §1]",
          suggestions,
        );
      if (/verif|register|account|setup/i.test(text))
        return reply(
          "Complete a marketplace profile, verify the demo email, then confirm setup on MT5 880042. Onboarding consent is a separate step. [Demo setup guide §2]",
          suggestions,
        );
      return reply(
        "I can help with onboarding, strategy setup, quotes, positions, or demo orders. Try “buy 0.01 gold SL 2390 TP 2420”.",
        suggestions,
      );
    }
    if (/\b(buy|sell)\b/i.test(text) || state.draft) {
      if (state.pending)
        return reply(
          "Confirm or cancel the current proposal before preparing another.",
          ["YES", "NO"],
        );
      if (!state.draft)
        state.draft = { side: /\bsell\b/i.test(text) ? "SELL" : "BUY" };
      return updateOrder(text);
    }
    if (/onboard|sign up|start onboarding|restart onboarding/i.test(text)) {
      if (state.profile.onboardingComplete)
        return reply(
          "Welcome back to the strategy marketplace. Explore Trend Follow, Gold Intraday, or Reversal Watch. Which would you like to try?",
        );
      state.onboarding = state.profile.language ? 1 : 0;
      return askProfile();
    }
    if (state.onboarding >= 0) {
      if (state.onboarding === 0)
        return reply(
          "What language would you like to use? Type its name, for example Chinese, English, or Bahasa Melayu.",
        );
      if (state.onboarding === questions.length - 1) {
        if (
          !/^(i accept|accept|agree|i agree|accept disclaimer|接受|我接受|同意|我同意)$/i.test(
            text,
          )
        ) {
          if (/decline|no|拒绝|不同意/i.test(text)) {
            state.onboarding = -1;
            return reply(
              "No account submitted. Come back whenever you’re ready.",
              ["Start onboarding"],
            );
          }
          return reply("Please explicitly accept or decline the disclaimer.", [
            "I accept",
            "Decline",
          ]);
        }
        state.onboarding = -1;
        state.profile.onboardingComplete = true;
        return reply(
          `Thanks, ${state.profile.name || "Alex"}. Demo MT5 880042 is submitted for review. In this demo, that review is simulated. Next is the strategy marketplace: Trend Follow, Gold Intraday, and Reversal Watch. Which would you like to explore? Marketplace registration and email verification are still required before strategy setup.`,
          ["Check strategies for gold", "Show balance"],
        );
      }
      const field = [
        null,
        "name",
        "tradingExperience",
        "markets",
        "tradingStyle",
        "riskAppetite",
      ][state.onboarding];
      if (field) state.profile[field] = text;
      state.onboarding++;
      return askProfile();
    }
    if (/^\/codex$/i.test(text))
      return reply(
        "This is the customer session. The personal workspace is in the Personal mode chapter.",
      );
    if (/^(hi|hey|hello|hi mei|nice|thanks)[.! ]*$/i.test(text))
      return reply(
        `Hi ${state.profile.name || "Alex"}. What do you need checked?`,
        ["Start onboarding", "Check strategies for gold", "Buy 0.01 gold"],
      );
    if (state.pending)
      return reply(
        "That action is still waiting. Reply YES to proceed or NO to cancel.",
        ["YES", "NO"],
      );
    return reply(
      "I didn’t catch that. I can check strategies, set up a demo profile, place orders, show P&L, or close positions.",
      ["Check strategies for gold", "Buy 0.01 gold", "Show positions"],
    );
  }
  return {
    send,
    snapshot,
    currentQuestion: askProfile,
    leaveOnboarding: () => {
      state.onboarding = -1;
    },
    context: () => ({
      ...snapshot(),
      pending: state.pending,
      draft: state.draft,
      onboardingStep: state.onboarding,
      profile: state.profile,
      registration: state.registration,
      lastStrategy: state.lastStrategy,
    }),
  };
}
