import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SRC = path.join(ROOT, "src");

export const readText = (file) => readFile(file, "utf8");
export const readJson = async (file) => JSON.parse(await readText(file));

/** フォルダ内の指定拡張子のファイルを、名前順につないで返す。 */
export async function concatDir(dir, ext) {
  const names = (await readdir(dir)).filter((n) => n.endsWith(ext)).sort();
  const texts = await Promise.all(names.map((n) => readText(path.join(dir, n))));
  return texts.join("");
}

/** テンプレートの {{名前}} を埋める。埋めた中身はもう一度は置き換えない。 */
export function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`テンプレートの {{${key}}} に入れる値がありません`);
    return vars[key];
  });
}

/** スクリプトの __名前__ を埋める。 */
export function fillScript(script, vars) {
  return script.replace(/__([A-Z_]+)__/g, (whole, key) => (key in vars ? vars[key] : whole));
}

/** <script> の中に安全に置ける JSON にする。 */
export const scriptJson = (value) => JSON.stringify(value).replace(/<\//g, "<\\/");

export const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
