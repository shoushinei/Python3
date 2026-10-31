import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { SRC, concatDir, escapeAttr, fill, fillScript, readJson, readText, scriptJson } from "./lib.mjs";

const NOTE = path.join(SRC, "note");
const MIME = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml" };

/** 章のフォルダを _chapter.html → 01-… → 02-… の順につなぐ。 */
async function readChapter(dir) {
  const names = (await readdir(dir)).filter((n) => n.endsWith(".html")).sort((a, b) => {
    if (a === "_chapter.html") return -1;
    if (b === "_chapter.html") return 1;
    return a.localeCompare(b);
  });
  const texts = await Promise.all(names.map((n) => readText(path.join(dir, n))));
  return texts.join("");
}

/** 本文の src="images/…" を data URI にして 1 枚の HTML に収める。 */
async function inlineImages(html, noteDir) {
  const names = [...new Set([...html.matchAll(/src="images\/([^"]+)"/g)].map((m) => m[1]))];
  const uris = {};
  for (const name of names) {
    const mime = MIME[path.extname(name).slice(1)];
    if (!mime) throw new Error(`対応していない画像形式です: ${name}`);
    const bytes = await readFile(path.join(noteDir, "images", name));
    uris[name] = `src="data:${mime};base64,${bytes.toString("base64")}"`;
  }
  return html.replace(/src="images\/([^"]+)"/g, (_, name) => uris[name]);
}

function sectionTag(attrs, index) {
  const list = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ");
  return `<section ${list}${index > 0 ? " hidden" : ""}>`;
}

/** 本文の中のページ内リンクが、どれも行き先を持つか確かめる。 */
function checkAnchors(course, html, chapters) {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const chapterHashes = new Set(chapters.map((c) => (c.attrs["data-app"] ? c.attrs["data-ch"] : `c${c.attrs["data-ch"]}`)));
  const broken = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((id) => !ids.has(id) && !chapterHashes.has(id));
  if (broken.length) throw new Error(`${course.id} の教材に行き先のないリンクがあります: ${[...new Set(broken)].join(", ")}`);
  return ids;
}

export async function buildNote(course) {
  const { note } = course;
  const noteDir = path.join(SRC, "courses", course.id, "note");
  const sections = [];
  for (const [i, chapter] of note.chapters.entries()) {
    const inner = await readChapter(path.join(noteDir, chapter.dir));
    sections.push(sectionTag(chapter.attrs, i) + inner + "</section>");
  }
  const body = await inlineImages(sections.join("\n\n"), noteDir);
  const ids = checkAnchors(course, body, note.chapters);

  const script = fillScript(await concatDir(path.join(NOTE, "scripts"), ".js"), {
    RUNNER: scriptJson(await readText(path.join(NOTE, "runner.py"))),
    STORAGE_PREFIX: scriptJson(note.storagePrefix),
    GLOSSARY: scriptJson(await readJson(path.join(noteDir, "glossary.json"))),
  });
  const styles = (await readText(path.join(SRC, "shared", "tokens.css"))) + (await concatDir(path.join(NOTE, "styles"), ".css"));

  const html = fill(await readText(path.join(NOTE, "template.html")), {
    pageTitle: `${note.title}｜${course.name}`,
    description: escapeAttr(note.description),
    brand: note.brand,
    links: note.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join(""),
    sections: body,
    styles,
    script,
  });
  return { html, ids };
}
