import path from "node:path";
import { SRC, concatDir, escapeAttr, fill, fillScript, readJson, readText, scriptJson } from "./lib.mjs";

const EXAM = path.join(SRC, "exam");
const NOTE_HREF = "../note/index.html";

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 解説の文章を HTML にする。`...` で囲んだところはコードの書体で出す。 */
function inline(text) {
  return text
    .split("`")
    .map((part, i) => (i % 2 ? `<code>${escapeHtml(part)}</code>` : escapeHtml(part)))
    .join("");
}

/** 対話モードの例を HTML にする。入力の行以外は出力として薄く出す。 */
function sampleHtml(text) {
  return text
    .split("\n")
    .map((line) => (/^(>>>|\.\.\.)( |$)|^\$ /.test(line) || !line ? escapeHtml(line) : `<span class="out">${escapeHtml(line)}</span>`))
    .join("\n");
}

/** 問題の答えの番号・章・教材への戻り先・解説がそろっているか確かめる。 */
function checkQuestions(course, questions, noteIds) {
  const errors = [];
  questions.forEach((q, i) => {
    const no = `問題 ${i + 1}`;
    if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans >= q.opts.length) errors.push(`${no}: 正解の番号 ${q.ans} が選択肢の範囲外です`);
    if (!course.exam.chapters[q.ch]) errors.push(`${no}: 章 ${q.ch} の名前が course.json にありません`);
    if (!noteIds.has(q.sec)) errors.push(`${no}: 教材に節 ${q.sec} がありません`);
    if (!Array.isArray(q.why) || q.why.length !== q.opts.length) errors.push(`${no}: why の数が選択肢の数と合いません`);
    for (const key of ["exp", "topic", "trap"]) if (!q[key]) errors.push(`${no}: ${key} がありません`);
    if (!q.points?.length) errors.push(`${no}: points がありません`);
    const texts = [q.exp, q.topic, q.trap, ...(q.points ?? []), ...(q.why ?? [])];
    if (texts.some((t) => typeof t === "string" && t.split("`").length % 2 === 0)) errors.push(`${no}: 解説の \` が閉じていません`);
  });
  if (errors.length) throw new Error(`${course.id} の模試に誤りがあります\n  ${errors.join("\n  ")}`);
}

/** 問題を画面で使う形にする（解説の文章を HTML に変える）。 */
function renderQuestion(q) {
  return {
    ...q,
    exp: inline(q.exp),
    why: q.why.map(inline),
    topic: inline(q.topic),
    points: q.points.map(inline),
    trap: inline(q.trap),
    sample: q.sample ? sampleHtml(q.sample) : "",
  };
}

export async function buildExam(course, noteIds) {
  const { exam } = course;
  const dir = path.join(SRC, "courses", course.id, "exam");
  const questions = await readJson(path.join(dir, "questions.json"));
  checkQuestions(course, questions, noteIds);

  const script = fillScript(await concatDir(path.join(EXAM, "scripts"), ".js"), {
    EXAM: scriptJson({
      id: course.id,
      chapters: exam.chapters,
      limitMinutes: exam.limitMinutes,
      passScore: exam.passScore,
      storagePrefix: exam.storagePrefix,
      noteHref: NOTE_HREF,
    }),
    QUESTIONS: scriptJson(questions.map(renderQuestion)),
  });
  const styles = (await readText(path.join(SRC, "shared", "tokens.css"))) + (await concatDir(path.join(EXAM, "styles"), ".css"));

  const html = fill(await readText(path.join(EXAM, "template.html")), {
    pageTitle: `${exam.title}｜${course.name}`,
    description: escapeAttr(exam.description),
    courseName: course.shortName,
    title: exam.title,
    intro: await readText(path.join(dir, "intro.html")),
    noteHref: NOTE_HREF,
    count: String(questions.length),
    limit: String(exam.limitMinutes),
    styles,
    script,
  });
  return { html };
}
