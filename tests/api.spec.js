import { test, expect } from "@playwright/test";
import handler from "../api/chat.js";

async function request(body, method = "POST") {
  const response = {
    statusCode: 0,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(value) {
      this.body = JSON.parse(value);
    },
  };
  await handler(
    { method, body, headers: { "x-real-ip": "api-test" } },
    response,
  );
  return response;
}

test("server protects credentials, validates input and bounds provider failures", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = "server-only-test-key";
  try {
    expect((await request({}, "GET")).statusCode).toBe(405);
    expect((await request({ message: "x".repeat(501) })).statusCode).toBe(400);
    globalThis.fetch = async (_url, options) => {
      expect(options.headers.Authorization).toBe("Bearer server-only-test-key");
      expect(JSON.parse(options.body).messages[0].role).toBe("system");
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"command":"YES"}' } }],
        }),
      };
    };
    const unconfirmed = await request({ message: "what will this do?" });
    expect(unconfirmed.body.command).toBeUndefined();
    expect(unconfirmed.body.reply).toContain("Please reply YES");
    expect((await request({ message: "yes" })).body.command).toBe("YES");
    globalThis.fetch = async () => ({ ok: false });
    const failed = await request({ message: "hello" });
    expect(failed.statusCode).toBe(502);
    expect(JSON.stringify(failed)).not.toContain("server-only-test-key");
    delete process.env.OPENROUTER_API_KEY;
    expect((await request({ message: "hello" })).statusCode).toBe(503);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
});
