// Báo cáo SAST (Semgrep) dạng PDF: chạy Semgrep lấy JSON, dựng HTML, in PDF bằng Chromium của Playwright.
//
//   node scripts/ci/bao-cao-semgrep.mjs            # quét src, ra gate-semgrep.{json,html,pdf}
//   node scripts/ci/bao-cao-semgrep.mjs <thư mục>  # quét thư mục khác (để thử)
//
// Không làm gate đỏ: gate là scripts/ci/gate.mjs. Script này chỉ trình bày; mọi chuỗi từ Semgrep
// (đoạn code của PR, thông điệp luật) đều được escape trước khi đưa vào HTML.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2] ?? "src";
const CONFIGS = [".semgrep", "p/typescript", "p/react"];
const TEN = "gate-semgrep";

// 1. Chạy Semgrep lấy JSON (mọi mức; ERROR là mức chặn merge, còn lại để tham khảo).
const run = spawnSync(
  "semgrep",
  [
    "scan",
    ...CONFIGS.flatMap((c) => ["--config", c]),
    "--json",
    "--metrics=off",
    "--quiet",
    target,
  ],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
if (run.error || !run.stdout) {
  console.error("Không chạy được semgrep:", run.error?.message ?? run.stderr);
  process.exit(2);
}
const data = JSON.parse(run.stdout);
writeFileSync(`${TEN}.json`, run.stdout);

// 2. Gom số liệu.
const results = data.results ?? [];
const errors = results.filter((r) => r.extra.severity === "ERROR");
const files = new Set(results.map((r) => r.path));
const theoLuat = new Map();
for (const r of results) {
  const k = r.check_id;
  theoLuat.set(k, (theoLuat.get(k) ?? 0) + 1);
}
const sha = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).stdout.trim();
const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
  encoding: "utf8",
}).stdout.trim();
const now = new Date();

// 3. Dựng HTML (escape mọi chuỗi ngoài).
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
// Semgrep chưa đăng nhập thì JSON ghi extra.lines = "requires login": tự đọc đoạn code từ file (tối đa 6 dòng).
const cache = new Map();
const doanCode = (r) => {
  try {
    if (!cache.has(r.path)) cache.set(r.path, readFileSync(r.path, "utf8").split(/\r?\n/));
    const lines = cache.get(r.path);
    const end = Math.min(r.end.line, r.start.line + 5, lines.length);
    return Array.from({ length: end - r.start.line + 1 }, (_, i) => {
      const n = r.start.line + i;
      return `${String(n).padStart(4)}│ ${lines[n - 1] ?? ""}`;
    }).join("\n");
  } catch {
    return "(không đọc được file)";
  }
};
const mucVi = { ERROR: "Chặn merge", WARNING: "Cảnh báo", INFO: "Tham khảo" };
const dongKq = (r) => `
  <tr class="${esc(r.extra.severity)}">
    <td><span class="muc">${esc(mucVi[r.extra.severity] ?? r.extra.severity)}</span></td>
    <td><code>${esc(r.check_id)}</code></td>
    <td><code>${esc(r.path)}:${r.start.line}</code></td>
    <td>${esc(r.extra.message)}</td>
  </tr>
  <tr class="code ${esc(r.extra.severity)}"><td></td><td colspan="3"><pre>${esc(doanCode(r))}</pre></td></tr>`;

const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>Báo cáo SAST (Semgrep) - ShopLite</title>
<style>
  body { font: 11pt/1.45 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 0; }
  h1 { font-size: 18pt; margin: 0 0 4px; } h2 { font-size: 13pt; margin: 20px 0 6px; }
  .meta { color: #555; font-size: 9.5pt; }
  .tong { display: flex; gap: 14px; margin: 14px 0; }
  .o { border: 1px solid #ddd; border-radius: 6px; padding: 8px 14px; min-width: 110px; }
  .o b { display: block; font-size: 18pt; } .o.do b { color: #b3261e; } .o.xanh b { color: #1b7f3b; }
  table { border-collapse: collapse; width: 100%; font-size: 9.5pt; }
  th, td { border: 1px solid #ddd; padding: 5px 7px; vertical-align: top; text-align: left; }
  th { background: #f3f3f3; }
  tr.code td { background: #fafafa; border-top: none; }
  pre { margin: 0; white-space: pre-wrap; word-break: break-all; font-size: 8.5pt; }
  code { font-size: 9pt; }
  .muc { padding: 1px 6px; border-radius: 4px; font-weight: 600; white-space: nowrap; }
  tr.ERROR .muc { background: #fde7e5; color: #b3261e; }
  tr.WARNING .muc { background: #fff4d6; color: #8a5a00; }
  tr.INFO .muc { background: #e8f0fe; color: #1a4fa0; }
  .ok { padding: 14px; border: 1px solid #bfe3c8; background: #eefaf1; border-radius: 6px; }
</style></head><body>
<h1>Báo cáo SAST (Semgrep) - ShopLite</h1>
<div class="meta">Nhánh <code>${esc(branch)}</code> · commit <code>${esc(sha)}</code> · ${esc(now.toLocaleString("vi-VN"))} ·
Semgrep ${esc(data.version)} · luật: ${CONFIGS.map((c) => `<code>${esc(c)}</code>`).join(", ")} · quét: <code>${esc(target)}</code></div>
<div class="tong">
  <div class="o ${errors.length ? "do" : "xanh"}"><b>${errors.length}</b>chặn merge (ERROR)</div>
  <div class="o"><b>${results.length - errors.length}</b>cảnh báo / tham khảo</div>
  <div class="o"><b>${files.size}</b>file có phát hiện</div>
  <div class="o"><b>${(data.paths?.scanned ?? []).length}</b>file đã quét</div>
</div>
${results.length === 0 ? `<p class="ok">Không có phát hiện nào. Gate <code>bao-mat</code> xanh ở bước Semgrep.</p>` : ""}
${
  theoLuat.size
    ? `<h2>Theo luật</h2><table><tr><th>Luật</th><th>Số phát hiện</th></tr>${[...theoLuat]
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => `<tr><td><code>${esc(k)}</code></td><td>${n}</td></tr>`)
        .join("")}</table>`
    : ""
}
${
  results.length
    ? `<h2>Chi tiết</h2><table><tr><th>Mức</th><th>Luật</th><th>Vị trí</th><th>Thông điệp</th></tr>${results
        .sort(
          (a, b) =>
            (a.extra.severity === "ERROR" ? -1 : 1) - (b.extra.severity === "ERROR" ? -1 : 1) ||
            a.path.localeCompare(b.path) ||
            a.start.line - b.start.line,
        )
        .map(dongKq)
        .join("")}</table>`
    : ""
}
${
  (data.errors ?? []).length
    ? `<h2>Lỗi khi quét (${data.errors.length})</h2><ul>${data.errors
        .slice(0, 20)
        .map((e) => `<li><code>${esc(e.path ?? "")}</code> ${esc(e.message ?? e.type)}</li>`)
        .join("")}</ul>`
    : ""
}
<p class="meta">Luật của nhóm ở <code>.semgrep/shoplite.yml</code>, mã luật trùng <code>.github/review-checklist.md</code>.
Chạy lại ở máy: <code>node scripts/ci/bao-cao-semgrep.mjs</code>.</p>
</body></html>`;
writeFileSync(`${TEN}.html`, html);

// 4. In PDF bằng Chromium của Playwright (đã có trong devDependencies cho E2E).
const { chromium } = await import("@playwright/test");
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: `${TEN}.pdf`,
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
  });
} finally {
  await browser.close();
}
console.log(
  `Semgrep: ${results.length} phát hiện (${errors.length} ERROR) trong ${files.size} file → ${resolve(`${TEN}.pdf`)} (kèm .html, .json)`,
);
