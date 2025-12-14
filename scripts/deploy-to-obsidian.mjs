import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

const getArgValue = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
};

const hasArg = (name) => args.includes(name);

const cwd = process.cwd();

const target =
  getArgValue("--plugin-dir") ??
  process.env.TG_OBSIDIAN_PLUGIN_DIR ??
  path.resolve(cwd, "../.obsidian/plugins/obsidian-textgenerator-plugin.bak01");

const dryRun = hasArg("--dry-run");

const filesToCopy = [
  { from: path.resolve(cwd, "main.js"), to: path.resolve(target, "main.js") },
  { from: path.resolve(cwd, "styles.css"), to: path.resolve(target, "styles.css") },
  { from: path.resolve(cwd, "manifest.json"), to: path.resolve(target, "manifest.json") },
];

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const missing = [];
  for (const f of filesToCopy) {
    if (!(await fileExists(f.from))) missing.push(f.from);
  }

  if (missing.length) {
    console.error(
      `[deploy] Missing build outputs:\n${missing.map((p) => `- ${p}`).join("\n")}\n\nRun: npm run build`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`[deploy] Target: ${target}`);
  if (dryRun) {
    console.log("[deploy] Dry run (no files copied).");
    for (const f of filesToCopy) console.log(`[deploy] Would copy: ${f.from} -> ${f.to}`);
    return;
  }

  await ensureDir(target);

  for (const f of filesToCopy) {
    await fs.copyFile(f.from, f.to);
    console.log(`[deploy] Copied: ${path.basename(f.to)}`);
  }

  console.log("[deploy] Done.");
}

main().catch((err) => {
  console.error("[deploy] Failed:", err);
  process.exitCode = 1;
});

