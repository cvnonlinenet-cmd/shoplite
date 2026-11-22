// Fixture cho `semgrep --test .semgrep`: mỗi dòng "ruleid:" phải bị luật bắt, mỗi dòng "ok:" phải không.
// File này không phải code của ứng dụng (nằm ngoài src/, không được tsc/ESLint/Vitest đọc).
/* eslint-disable */
// ruleid: shoplite.kt-1-doc-ghi-file-ngoai-repository
import { readFileSync } from "node:fs";
// ruleid: shoplite.kt-1-doc-ghi-file-ngoai-repository
import * as fs from "fs";
// ruleid: shoplite.kt-1-doc-ghi-file-ngoai-repository
import { writeFile } from "node:fs/promises";
// ruleid: shoplite.kt-1-doc-ghi-file-ngoai-repository
const fsCu = require("fs");
import { exec, execSync } from "node:child_process";
import { normalizeText } from "@/lib/format";

export function viDu(q: string, html: string) {
  // ok: shoplite.bm-1-regexp-tu-du-lieu-ngoai
  const hopLe = new RegExp("^[a-z]+$", "i");
  // ruleid: shoplite.bm-1-regexp-tu-du-lieu-ngoai
  const tuKhach = new RegExp(q, "i");
  // ruleid: shoplite.bm-1-regexp-tu-du-lieu-ngoai
  const khongNew = RegExp(normalizeText(q));
  // ok: shoplite.bm-1-regexp-tu-du-lieu-ngoai
  const dungCach = normalizeText("Bàn phím cơ").includes(normalizeText(q));

  // ruleid: shoplite.bm-5-chay-ma-dong
  eval(q);
  // ruleid: shoplite.bm-5-chay-ma-dong
  const fn = new Function("a", q);
  // ruleid: shoplite.bm-5-chay-ma-dong
  exec(`ls ${q}`);
  // ruleid: shoplite.bm-5-chay-ma-dong
  execSync(`echo ${q}`);
  // ok: shoplite.bm-5-chay-ma-dong
  execSync("git rev-parse HEAD");

  return [hopLe, tuKhach, khongNew, dungCach, fn, fsCu, fs, readFileSync, writeFile];
}

export function ThoHtml({ html }: { html: string }) {
  // ruleid: shoplite.bm-2-html-tho
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ChuThuong({ text }: { text: string }) {
  // ok: shoplite.bm-2-html-tho
  return <div>{text}</div>;
}
