export function formatMarkdownReport(result) {
  const status = result.summary.errors === 0 && result.summary.warnings === 0
    ? "PASS"
    : "NEEDS REVIEW";

  const lines = [
    "# Documentation Sync Report",
    "",
    `Status: **${status}**`,
    "",
    `Source: \`${result.sourcePath}\``,
    `Target: \`${result.targetPath}\``,
    "",
    "## Summary",
    "",
    `- Errors: ${result.summary.errors}`,
    `- Warnings: ${result.summary.warnings}`,
    `- Headings: ${result.summary.source.headings} source / ${result.summary.target.headings} target`,
    `- Code blocks: ${result.summary.source.codeBlocks} source / ${result.summary.target.codeBlocks} target`,
    `- Links: ${result.summary.source.links} source / ${result.summary.target.links} target`,
    `- Images: ${result.summary.source.images} source / ${result.summary.target.images} target`,
    `- Inline code spans: ${result.summary.source.inlineCode} source / ${result.summary.target.inlineCode} target`
  ];

  if (result.issues.length === 0) {
    lines.push("", "No sync issues found.");
    return lines.join("\n");
  }

  lines.push("", "## Issues", "");

  result.issues.forEach((issue) => {
    const locations = [
      issue.sourceLine ? `source line ${issue.sourceLine}` : null,
      issue.targetLine ? `target line ${issue.targetLine}` : null
    ].filter(Boolean).join(", ");

    lines.push(`- [${issue.severity.toUpperCase()}] ${issue.message}`);

    if (locations) {
      lines.push(`  Location: ${locations}`);
    }
  });

  return lines.join("\n");
}

export function formatJsonReport(result) {
  return JSON.stringify(result, null, 2);
}
