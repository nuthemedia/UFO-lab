import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const requiredRoutes = ["/jacques", "/experiments/biorhythm", "/keyhoe"];
const expectedProject = {
  projectId: "prj_ln4BNuLGgoCFlY6FAJgAyvcQnz5C",
  projectName: "ufo-lab",
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    shell: false,
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(output || `${command} ${args.join(" ")} failed`);
  }

  return [result.stdout, result.stderr].filter(Boolean).join("\n");
}

function output(command, args) {
  return run(command, args, { capture: true }).trim();
}

function assertCleanWorktree() {
  const status = output("git", ["status", "--porcelain"]);

  if (status) {
    throw new Error(`Worktree must be clean before production deploy:\n${status}`);
  }
}

function assertMainHead() {
  run("git", ["fetch", "origin", "main"]);

  const head = output("git", ["rev-parse", "HEAD"]);
  const originMain = output("git", ["rev-parse", "origin/main"]);

  if (head !== originMain) {
    throw new Error("Production deploy must run from the current origin/main HEAD.");
  }
}

function assertVercelProject() {
  const projectPath = resolve(rootDir, ".vercel", "project.json");

  if (!existsSync(projectPath)) {
    throw new Error("Missing .vercel/project.json. Link this checkout to the canonical ufo-lab project first.");
  }

  const project = JSON.parse(readFileSync(projectPath, "utf8"));

  if (
    project.projectName !== expectedProject.projectName ||
    project.projectId !== expectedProject.projectId
  ) {
    throw new Error(
      `Wrong Vercel project link: ${project.projectName || "unknown"} (${project.projectId || "unknown"}). Expected ${expectedProject.projectName} (${expectedProject.projectId}).`,
    );
  }
}

function runBuildAndAssertRoutes() {
  const buildOutput = run("npm", ["run", "build"], { capture: true });
  process.stdout.write(buildOutput);

  for (const route of requiredRoutes) {
    if (!buildOutput.includes(route)) {
      throw new Error(`Build output is missing public route: ${route}`);
    }
  }

  restoreNextEnvIfGenerated();
}

function restoreNextEnvIfGenerated() {
  const status = output("git", ["status", "--porcelain", "--", "next-env.d.ts"]);

  if (status) {
    run("git", ["restore", "next-env.d.ts"]);
  }
}

function vercelCommand() {
  return process.env.VERCEL_CLI || "vercel";
}

try {
  assertMainHead();
  assertCleanWorktree();
  assertVercelProject();
  run("npm", ["run", "verify:production-routes"]);
  runBuildAndAssertRoutes();
  run(vercelCommand(), ["deploy", "--prod", "--yes"]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
