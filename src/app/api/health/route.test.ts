import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  it("responde ok", async () => {
    const res = GET();
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
