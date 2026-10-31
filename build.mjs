#!/usr/bin/env node
/**
 * src/ を docs/ に組み立てる。
 *
 *   node build.mjs          ビルド
 *   node build.mjs --check  ビルド結果が docs/ と一致するか検証（CI 用・書き込みなし）
 *
 * src/site/     トップ・このサイトについて → docs/index.html, docs/about/
 * src/courses/  試験ごとの本文と問題       → docs/<試験>/note/, docs/<試験>/exam/
 * src/note/     教材の共通の画面と動き
 * src/exam/     模試の共通の画面と動き
 *
 * 依存パッケージなし。Node 18 以上で動く。
 * 各ページは CSS も JS も画像も埋め込んだ 1 枚の HTML にしている。GitHub Pages でも、
 * ダウンロードして file:// で開いても同じように動かすため（コードの実行だけはネット接続が要る）。
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { buildExam } from "./tools/build-exam.mjs";
import { buildNote } from "./tools/build-note.mjs";
import { buildSite } from "./tools/build-site.mjs";
import { ROOT, readJson } from "./tools/lib.mjs";

const OUT_DIR = path.join(ROOT, "docs");
const COURSES_DIR = path.join(ROOT, "src", "courses");

const courseIds = (await readdir(COURSES_DIR, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
const courses = [];
const files = { ".nojekyll": "" };

for (const id of courseIds) {
  const course = await readJson(path.join(COURSES_DIR, id, "course.json"));
  const note = await buildNote(course);
  files[`${id}/note/index.html`] = note.html;
  if (course.exam) files[`${id}/exam/index.html`] = (await buildExam(course, note.ids)).html;
  courses.push(course);
}
Object.assign(files, await buildSite(courses));

async function listFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...(await listFiles(p, base)));
    else found.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return found;
}

const summary = `${Object.keys(files).length} ファイル（${courses.map((c) => c.shortName).join("・")}）`;

if (process.argv.includes("--check")) {
  const stale = [];
  for (const [rel, content] of Object.entries(files)) {
    const out = path.join(OUT_DIR, rel);
    const current = existsSync(out) ? await readFile(out, "utf8") : null;
    if (current !== content) stale.push(rel);
  }
  for (const rel of await listFiles(OUT_DIR)) if (!(rel in files)) stale.push(`${rel}（src/ に元がない）`);
  if (stale.length) {
    console.error("docs/ が src/ と一致しません。`node build.mjs` を実行してコミットしてください。\n  " + stale.join("\n  "));
    process.exit(1);
  }
  console.log(`check ok: ${summary}`);
} else {
  await rm(OUT_DIR, { recursive: true, force: true });
  for (const [rel, content] of Object.entries(files)) {
    const out = path.join(OUT_DIR, rel);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, content);
  }
  console.log(`built: ${summary}`);
}
