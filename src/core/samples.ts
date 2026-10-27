/*
 * Realistic tool outputs, generated from a seed so they are reproducible. Used by the tests, the playground presets
 * and the demo-workspace seed. They are synthetic, but shaped like the real thing an agent reads.
 */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const pick = <T,>(r: () => number, xs: T[]) => xs[Math.floor(r() * xs.length)];
const hex = (r: () => number, n: number) => Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join("");
const ts = (base: number, i: number) => new Date(base + i * 137).toISOString();

export function npmInstall(seed = 1) {
  const r = rng(seed), out: string[] = [];
  const pkgs = ["inflight@1.0.6", "glob@7.2.3", "rimraf@3.0.2", "@humanwhocodes/config-array@0.11.14", "abab@2.0.6", "domexception@4.0.0", "w3c-hr-time@1.0.2", "sourcemap-codec@1.4.8", "stable@0.1.8", "q@1.5.1"];
  for (let i = 0; i < 26; i++) out.push(`npm WARN deprecated ${pick(r, pkgs)}: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.`);
  for (let i = 0; i <= 100; i += 3) out.push(`[${"#".repeat(Math.floor(i / 5)).padEnd(20, ".")}] ${i}% reify:${pick(r, ["webpack", "typescript", "@babel/core", "eslint", "jest", "react-dom", "next", "esbuild"])}: timing reifyNode:node_modules/${pick(r, ["lodash", "rxjs", "date-fns", "zod"])} Completed in ${Math.floor(r() * 900)}ms`);
  for (let i = 0; i < 40; i++) out.push(`npm http fetch GET 200 https://registry.npmjs.org/${pick(r, ["@types/node", "semver", "chalk", "debug", "ms", "uuid", "yargs", "tslib"])} ${Math.floor(r() * 300)}ms (cache revalidated)`);
  out.push("npm ERR! code ERESOLVE", "npm ERR! ERESOLVE unable to resolve dependency tree", "npm ERR!", "npm ERR! While resolving: web@0.4.0", "npm ERR! Found: react@19.2.0", "npm ERR! node_modules/react", "npm ERR!   react@\"^19.2.0\" from the root project", "npm ERR!", "npm ERR! Could not resolve dependency:", "npm ERR! peer react@\"^18.0.0\" from react-beautiful-dnd@13.1.1", "npm ERR!", "npm ERR! Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps", "", `npm ERR! A complete log of this run can be found in: /Users/dev/.npm/_logs/2026-10-27T09_12_44_${Math.floor(r() * 999)}Z-debug-0.log`);
  return out.join("\n");
}

export function jestRun(seed = 2) {
  const r = rng(seed), out: string[] = [];
  const suites = ["auth", "billing", "cart", "orders", "search", "users", "webhooks", "inventory"];
  for (const s of suites) {
    out.push(`PASS src/${s}/${s}.service.test.ts (${(r() * 4 + 0.4).toFixed(2)} s)`, `  ${s[0].toUpperCase() + s.slice(1)}Service`);
    for (let i = 0; i < 14 + Math.floor(r() * 10); i++) out.push(`    ✓ ${pick(r, ["returns", "rejects", "creates", "updates", "handles", "retries", "caches", "validates"])} ${pick(r, ["an empty list", "invalid input", "a duplicate key", "the happy path", "a timeout", "pagination", "unicode names", "a missing record"])} (${Math.floor(r() * 40)} ms)`);
  }
  out.push("FAIL src/payments/refund.test.ts", "  RefundService", `    ✓ refunds a captured charge (${Math.floor(r() * 30)} ms)`, "    ✕ refunds a partially captured charge (41 ms)", "",
    "  ● RefundService › refunds a partially captured charge", "", "    expect(received).toEqual(expected) // deep equality", "", "    - Expected  - 1", "    + Received  + 1", "",
    "      Object {", "    -   \"amount\": 1250,", "    +   \"amount\": 2500,", "        \"currency\": \"usd\",", "      }", "",
    "      42 |     const refund = await svc.refund(charge.id, { partial: true });", "    > 43 |     expect(refund).toEqual({ amount: 1250, currency: \"usd\" });", "         |                    ^", "",
    "      at Object.<anonymous> (src/payments/refund.test.ts:43:20)", "      at processTicksAndRejections (node:internal/process/task_queues:95:5)", "",
    "Test Suites: 1 failed, 8 passed, 9 total", `Tests:       1 failed, ${140 + Math.floor(r() * 20)} passed, ${142 + Math.floor(r() * 20)} total`, "Snapshots:   0 total", `Time:        ${(r() * 10 + 8).toFixed(3)} s`, "Ran all test suites.");
  return out.join("\n");
}

export function pytestRun(seed = 3) {
  const r = rng(seed), out: string[] = ["============================= test session starts ==============================", "platform linux -- Python 3.12.4, pytest-8.3.2, pluggy-1.5.0 -- /usr/bin/python3", "rootdir: /work/api", "collected 186 items", ""];
  const mods = ["test_models", "test_views", "test_tasks", "test_serializers", "test_permissions", "test_pagination"];
  for (let i = 0; i < 185; i++) out.push(`tests/${pick(r, mods)}.py::test_${pick(r, ["create", "update", "list", "delete", "filter", "retry"])}_${pick(r, ["user", "invoice", "team", "token", "webhook"])}_${i} PASSED${" ".repeat(10)}[${String(Math.floor((i / 186) * 100)).padStart(3)}%]`);
  out.push("tests/test_tasks.py::test_retry_webhook_backoff FAILED                     [100%]", "", "=================================== FAILURES ===================================", "_________________________ test_retry_webhook_backoff __________________________", "",
    "    def test_retry_webhook_backoff():", "        delays = [backoff(n) for n in range(4)]", ">       assert delays == [1, 2, 4, 8]", "E       assert [1, 2, 4, 16] == [1, 2, 4, 8]", "E         At index 3 diff: 16 != 8", "", "tests/test_tasks.py:88: AssertionError",
    "=========================== short test summary info ============================", "FAILED tests/test_tasks.py::test_retry_webhook_backoff - assert [1, 2, 4, 16] == [1, 2, 4, 8]", `======================== 1 failed, 185 passed in ${(r() * 20 + 5).toFixed(2)}s =========================`);
  return out.join("\n");
}

export function goTest(seed = 4) {
  const r = rng(seed), out: string[] = [];
  for (let i = 0; i < 70; i++) { const n = `Test${pick(r, ["Parse", "Encode", "Route", "Cache", "Queue", "Lease"])}${pick(r, ["Empty", "Large", "Concurrent", "Unicode", "Timeout"])}${i}`; out.push(`=== RUN   ${n}`, `--- PASS: ${n} (0.0${Math.floor(r() * 9)}s)`); }
  out.push("=== RUN   TestLeaseExpiry", "    lease_test.go:57: lease still held after ttl: got owner=\"worker-2\", want \"\"", "--- FAIL: TestLeaseExpiry (2.01s)", "FAIL", "FAIL\tgithub.com/acme/queue/lease\t3.412s", "ok  \tgithub.com/acme/queue/codec\t0.211s", "ok  \tgithub.com/acme/queue/router\t0.534s");
  return out.join("\n");
}

export function kubectlLogs(seed = 5) {
  const r = rng(seed), base = Date.UTC(2026, 9, 27, 9, 0, 0), out: string[] = [];
  let i = 0;
  for (let k = 0; k < 160; k++) {
    const roll = r();
    if (roll < 0.55) out.push(`${ts(base, i++)} INFO  GET /healthz 200 ${(r() * 2).toFixed(2)}ms ip=10.0.${Math.floor(r() * 9)}.${Math.floor(r() * 250)}`);
    else if (roll < 0.85) out.push(`${ts(base, i++)} INFO  consumer=orders partition=${Math.floor(r() * 12)} offset=${Math.floor(r() * 1e6)} committed lag=${Math.floor(r() * 40)}`);
    else out.push(`${ts(base, i++)} DEBUG cache hit key=user:${hex(r, 8)} ttl=${Math.floor(r() * 300)}s`);
  }
  out.push(`${ts(base, i++)} WARN  pg pool saturated in_use=20 waiting=14`, `${ts(base, i++)} ERROR order-service: failed to commit offset: context deadline exceeded`, `${ts(base, i++)} ERROR   at kafka.(*Consumer).Commit (consumer.go:212)`, `${ts(base, i++)} ERROR   at main.(*Worker).loop (worker.go:88)`);
  for (let k = 0; k < 60; k++) out.push(`${ts(base, i++)} INFO  GET /healthz 200 ${(r() * 2).toFixed(2)}ms ip=10.0.${Math.floor(r() * 9)}.${Math.floor(r() * 250)}`);
  return out.join("\n");
}

export function dockerBuild(seed = 6) {
  const r = rng(seed), out: string[] = ["#0 building with \"desktop-linux\" instance using docker driver", "#1 [internal] load build definition from Dockerfile", "#1 transferring dockerfile: 912B done"];
  for (let s = 2; s < 9; s++) { out.push(`#${s} [${s - 1}/8] RUN ${pick(r, ["apt-get update", "npm ci", "go mod download", "pip install -r requirements.txt"])}`); for (let k = 0; k < 18; k++) out.push(`#${s} ${(r() * 30).toFixed(3)} ${pick(r, ["Get:", "Fetched", "added", "Downloading", "Collecting"])} ${pick(r, ["libssl3", "ca-certificates", "numpy-2.1.0", "github.com/aws/aws-sdk-go-v2", "typescript@5.6.3"])} ${Math.floor(r() * 900)} kB`); out.push(`#${s} DONE ${(r() * 40).toFixed(1)}s`); }
  out.push("#9 [8/8] RUN npm run build", "#9 4.211 > web@0.4.0 build", "#9 9.882 Error: Cannot find module '@/lib/env'", "#9 9.882 Require stack:", "#9 9.882 - /app/src/server.ts", "#9 ERROR: process \"/bin/sh -c npm run build\" did not complete successfully: exit code: 1", "------", "ERROR: failed to solve: process \"/bin/sh -c npm run build\" did not complete successfully: exit code: 1");
  return out.join("\n");
}

export function apiJson(seed = 7) {
  const r = rng(seed);
  const items = Array.from({ length: 40 }, (_, i) => ({
    id: 4000 + i, node_id: "I_kwDO" + hex(r, 16), number: 812 + i, title: pick(r, ["Crash on empty config", "Add retry to webhook sender", "Docs: clarify rate limits", "Flaky test in lease package", "Support Postgres 17"]),
    state: pick(r, ["open", "closed"]), locked: false, assignee: r() < 0.5 ? null : { login: pick(r, ["mira", "tobi", "asha"]), id: Math.floor(r() * 1e7), avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(r() * 1e7)}?v=4`, type: "User", site_admin: false },
    labels: [{ id: Math.floor(r() * 1e9), name: pick(r, ["bug", "enhancement", "docs"]), color: hex(r, 6), default: false, description: null }],
    milestone: null, comments: Math.floor(r() * 30), created_at: new Date(Date.UTC(2026, 8, 1 + i)).toISOString(), updated_at: new Date(Date.UTC(2026, 9, 1 + (i % 26))).toISOString(), closed_at: null,
    author_association: "CONTRIBUTOR", active_lock_reason: null, reactions: { url: `https://api.github.com/repos/acme/queue/issues/${812 + i}/reactions`, total_count: Math.floor(r() * 9), "+1": 0, "-1": 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 },
    body: "### Steps to reproduce\n\n1. Start the worker with an empty config file.\n2. Send a webhook.\n3. Observe the crash.\n\n### Logs\n\n```\n" + "panic: runtime error: invalid memory address or nil pointer dereference\n".repeat(3) + "```\n\n### Environment\n\n- version 0.4." + i + "\n- linux/amd64",
    performed_via_github_app: null, state_reason: null,
  }));
  return JSON.stringify(items, null, 2);
}

export function gitDiff(seed = 8) {
  const r = rng(seed), out: string[] = [];
  out.push("diff --git a/src/lease/lease.go b/src/lease/lease.go", "index 3f1c2aa..9b0e7d1 100644", "--- a/src/lease/lease.go", "+++ b/src/lease/lease.go", "@@ -40,24 +40,27 @@ func (l *Lease) Renew(ctx context.Context) error {");
  for (let i = 0; i < 9; i++) out.push(` \t// ${pick(r, ["keep the owner stable across renewals", "renewal must not extend past ttl", "metrics are best effort"])}`);
  out.push("-\tif time.Since(l.renewedAt) > l.ttl {", "+\tif l.clock.Since(l.renewedAt) >= l.ttl {", "+\t\tl.owner = \"\"", " \t\treturn ErrExpired", " \t}");
  for (let i = 0; i < 10; i++) out.push(` \t${pick(r, ["l.mu.Lock()", "defer l.mu.Unlock()", "l.renewedAt = l.clock.Now()", "return nil"])}`);
  out.push("diff --git a/package-lock.json b/package-lock.json", "index 1a2b3c4..5d6e7f8 100644", "--- a/package-lock.json", "+++ b/package-lock.json", "@@ -1,9000 +1,9012 @@");
  for (let i = 0; i < 220; i++) out.push(`${pick(r, ["+", "-", " "])}      "integrity": "sha512-${hex(r, 40)}",`);
  out.push("diff --git a/src/lease/clock.go b/src/lease/clock.go", "new file mode 100644", "index 0000000..7c1d2e3", "--- /dev/null", "+++ b/src/lease/clock.go", "@@ -0,0 +1,90 @@");
  for (let i = 0; i < 90; i++) out.push(`+${pick(r, ["// Clock lets tests control time.", "type Clock interface { Now() time.Time; Since(time.Time) time.Duration }", "func (realClock) Now() time.Time { return time.Now() }", ""])}`);
  return out.join("\n");
}

export const presets = {
  "npm install": npmInstall, "Jest run": jestRun, "pytest": pytestRun, "go test": goTest,
  "kubectl logs": kubectlLogs, "docker build": dockerBuild, "API response": apiJson, "git diff": gitDiff,
} as const;
export type Preset = keyof typeof presets;
