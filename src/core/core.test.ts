import { describe, expect, it } from "vitest";
import { compress, detect, tokens } from "./index";
import { apiJson, dockerBuild, gitDiff, goTest, jestRun, kubectlLogs, npmInstall, pytestRun } from "./samples";

describe("detect", () => {
  it("routes each sample to the right compressor", () => {
    expect(detect(apiJson())).toBe("json");
    expect(detect(gitDiff())).toBe("diff");
    expect(detect(jestRun())).toBe("tests");
    expect(detect(pytestRun())).toBe("tests");
    expect(detect(goTest())).toBe("tests");
    expect(detect(kubectlLogs())).toBe("logs");
    expect(detect(npmInstall())).toBe("logs");
  });
});

describe("compress keeps what matters", () => {
  it("logs: the error survives, the health checks do not", () => {
    const r = compress(kubectlLogs());
    expect(r.text).toContain("failed to commit offset");
    expect(r.after).toBeLessThan(r.before * 0.3);
  });
  it("npm: the ERESOLVE explanation survives", () => {
    const r = compress(npmInstall());
    expect(r.text).toContain("ERESOLVE unable to resolve dependency tree");
    expect(r.text).toContain("peer react@");
    expect(r.after).toBeLessThan(r.before * 0.5);
  });
  it("jest: failures and totals kept, passing ticks dropped", () => {
    const r = compress(jestRun());
    expect(r.text).toContain("refunds a partially captured charge");
    expect(r.text).toContain("Tests:");
    expect(r.text).not.toMatch(/✓ returns/);
    expect(r.after).toBeLessThan(r.before * 0.4);
  });
  it("pytest and go test: the one failure is still there", () => {
    expect(compress(pytestRun()).text).toContain("assert [1, 2, 4, 16] == [1, 2, 4, 8]");
    expect(compress(goTest()).text).toContain("lease still held after ttl");
  });
  it("docker: the build error survives", () => {
    expect(compress(dockerBuild()).text).toContain("Cannot find module '@/lib/env'");
  });
  it("json: still valid JSON, long arrays marked", () => {
    const r = compress(apiJson(), { footer: false });
    const parsed = JSON.parse(r.text);
    expect(parsed).toHaveLength(4);
    expect(parsed[3]).toBe("… 37 more items");
    expect(r.after).toBeLessThan(r.before * 0.25);
  });
  it("diff: changes kept, lockfile summarised", () => {
    const r = compress(gitDiff());
    expect(r.text).toContain("+\tif l.clock.Since(l.renewedAt) >= l.ttl {");
    expect(r.text).toContain("[generated/lock file:");
    expect(r.text).not.toContain("sha512-");
  });
});

describe("safety", () => {
  it("leaves small outputs alone", () => {
    const r = compress("ok\n");
    expect(r.skipped).toBe("small");
    expect(r.text).toBe("ok\n");
  });
  it("is deterministic and ids are content hashes", () => {
    const a = compress(jestRun()), b = compress(jestRun());
    expect(a.text).toBe(b.text);
    expect(a.id).toBe(b.id);
    expect(a.id).toMatch(/^wh_[0-9a-f]{12}$/);
  });
  it("counts tokens", () => { expect(tokens("hello world")).toBeGreaterThan(0); });
});
