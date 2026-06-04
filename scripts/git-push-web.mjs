import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "H:\\dev\\aeterna";
const logPath = "H:\\OneDrive\\Desktop\\AETERNA-PUSH-REZULTATAS.txt";

function run(cmd) {
  return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
}

const lines = [];
try {
  lines.push("=== " + new Date().toISOString() + " ===");
  lines.push(run("git status -sb"));
  lines.push(run("git remote -v"));
  run("git add web/");
  lines.push("=== STAGED ===");
  lines.push(run("git diff --cached --name-only"));
  try {
    run('git commit -m "fix(web): static demo routes, full nav, memorial JSON fix"');
    lines.push("COMMIT: ok");
  } catch (e) {
    run('git commit --allow-empty -m "chore(web): trigger Vercel production redeploy"');
    lines.push("COMMIT: empty (redeploy)");
  }
  lines.push("HASH: " + run("git rev-parse HEAD").trim());
  lines.push("FILES:\n" + run("git show --name-only --pretty=format: HEAD"));
  lines.push("PUSH:\n" + run("git push origin main"));
  lines.push("SUCCESS: true");
} catch (e) {
  lines.push("ERROR: " + (e.stderr || e.stdout || e.message));
  lines.push("SUCCESS: false");
}

writeFileSync(logPath, lines.join("\n"), "utf8");
console.log(lines.join("\n"));
