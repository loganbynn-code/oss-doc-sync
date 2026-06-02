#!/usr/bin/env node

import process from "node:process";
import { readFile } from "node:fs/promises";
import { checkMarkdownPair } from "../src/check.js";
import { formatJsonReport, formatMarkdownReport } from "../src/report.js";

const helpText = `oss-doc-sync

Check whether two Markdown files stayed structurally in sync.

Usage:
  oss-doc-sync <source.md> <target.md> [options]

Options:
  --format <markdown|json>     Output format. Default: markdown
  --fail-on <errors|warnings|none>
                              Exit with code 1 when the chosen level is present.
                              Default: errors
  --help                      Show this help message

Examples:
  oss-doc-sync README.md README.zh-CN.md
  oss-doc-sync docs/guide.md docs/guide.zh-CN.md --format json
`;

function parseArgs(argv) {
  const options = {
    format: "markdown",
    failOn: "errors"
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--format") {
      options.format = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--fail-on") {
      options.failOn = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    positional.push(arg);
  }

  if (!["markdown", "json"].includes(options.format)) {
    throw new Error("--format must be either markdown or json");
  }

  if (!["errors", "warnings", "none"].includes(options.failOn)) {
    throw new Error("--fail-on must be errors, warnings, or none");
  }

  return { positional, options };
}

function shouldFail(summary, failOn) {
  if (failOn === "none") {
    return false;
  }

  if (summary.errors > 0) {
    return true;
  }

  return failOn === "warnings" && summary.warnings > 0;
}

async function main() {
  const { positional, options } = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(`${helpText}\n`);
    return;
  }

  if (positional.length !== 2) {
    throw new Error("Expected exactly two Markdown file paths. Run with --help for usage.");
  }

  const [sourcePath, targetPath] = positional;
  const [sourceText, targetText] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(targetPath, "utf8")
  ]);

  const result = checkMarkdownPair({
    sourcePath,
    sourceText,
    targetPath,
    targetText
  });

  const output = options.format === "json"
    ? formatJsonReport(result)
    : formatMarkdownReport(result);

  process.stdout.write(`${output}\n`);

  if (shouldFail(result.summary, options.failOn)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`oss-doc-sync: ${error.message}\n`);
  process.exitCode = 1;
});
