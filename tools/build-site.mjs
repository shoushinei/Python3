import path from "node:path";
import { SRC, fill, readText, scriptJson } from "./lib.mjs";

const SITE = path.join(SRC, "site");

/** トップが進み具合を出すために使う、講座ごとの情報。 */
function progressData(courses) {
  const data = {};
  for (const c of courses) {
    data[c.id] = {
      shortName: c.shortName,
      note: {
        title: c.note.title,
        prefix: c.note.storagePrefix,
        titles: c.note.chapters.map((ch) => ch.attrs["data-title"]),
        chapters: c.note.chapters.filter((ch) => !ch.attrs["data-app"]).map((ch) => ch.attrs["data-ch"]),
      },
    };
    if (c.exam) data[c.id].exam = { prefix: c.exam.storagePrefix };
  }
  return data;
}

export async function buildSite(courses) {
  const tokens = await readText(path.join(SRC, "shared", "tokens.css"));
  const styles = tokens + (await readText(path.join(SITE, "site.css")));
  const script = (await readText(path.join(SITE, "home.js"))).replace("__COURSES__", () => scriptJson(progressData(courses)));
  return {
    "index.html": fill(await readText(path.join(SITE, "index.html")), { styles, script }),
    "about/index.html": fill(await readText(path.join(SITE, "about.html")), { styles }),
  };
}
