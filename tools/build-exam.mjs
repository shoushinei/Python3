import path from "node:path";
import { SRC, concatDir, escapeAttr, fill, fillScript, readJson, readText, scriptJson } from "./lib.mjs";

const EXAM = path.join(SRC, "exam");
const NOTE_HREF = "../note/index.html";

/** 問題の答えの番号・章・教材への戻り先が正しいか確かめる。 */
function checkQuestions(course, questions, noteIds) {
  const errors = [];
  questions.forEach((q, i) => {
    const no = `問題 ${i + 1}`;
    if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans >= q.opts.length) errors.push(`${no}: 正解の番号 ${q.ans} が選択肢の範囲外です`);
    if (!course.exam.chapters[q.ch]) errors.push(`${no}: 章 ${q.ch} の名前が course.json にありません`);
    if (!noteIds.has(q.sec)) errors.push(`${no}: 教材に節 ${q.sec} がありません`);
  });
  if (errors.length) throw new Error(`${course.id} の模試に誤りがあります\n  ${errors.join("\n  ")}`);
}

export async function buildExam(course, noteIds) {
  const { exam } = course;
  const dir = path.join(SRC, "courses", course.id, "exam");
  const questions = await readJson(path.join(dir, "questions.json"));
  checkQuestions(course, questions, noteIds);

  const script = fillScript(await concatDir(path.join(EXAM, "scripts"), ".js"), {
    EXAM: scriptJson({
      chapters: exam.chapters,
      limitMinutes: exam.limitMinutes,
      passScore: exam.passScore,
      storagePrefix: exam.storagePrefix,
      noteHref: NOTE_HREF,
    }),
    QUESTIONS: scriptJson(questions),
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
