import assert from "node:assert/strict";
import test from "node:test";
import { checkMarkdownPair } from "../src/check.js";

test("checkMarkdownPair passes translated prose with matching protected content", () => {
  const result = checkMarkdownPair({
    sourcePath: "README.md",
    targetPath: "README.zh-CN.md",
    sourceText: `# Project

Install \`oss-doc-sync\`.

## Usage

\`\`\`sh
npx oss-doc-sync README.md README.zh-CN.md
\`\`\`

Read [docs](https://example.com).
`,
    targetText: `# 项目

安装 \`oss-doc-sync\`。

## 用法

\`\`\`sh
npx oss-doc-sync README.md README.zh-CN.md
\`\`\`

阅读 [文档](https://example.com)。
`
  });

  assert.equal(result.summary.errors, 0);
  assert.equal(result.summary.warnings, 0);
});

test("checkMarkdownPair reports mismatched code blocks and links", () => {
  const result = checkMarkdownPair({
    sourcePath: "README.md",
    targetPath: "README.zh-CN.md",
    sourceText: `# Project

\`\`\`sh
npm test
\`\`\`

[docs](https://example.com/docs)
`,
    targetText: `# 项目

\`\`\`sh
npm run test
\`\`\`

[文档](https://example.com/old-docs)
`
  });

  assert.equal(result.summary.errors, 2);
  assert.deepEqual(result.issues.map((issue) => issue.rule), [
    "code-block-content",
    "link-url"
  ]);
});

test("checkMarkdownPair warns when heading structure drifts", () => {
  const result = checkMarkdownPair({
    sourcePath: "README.md",
    targetPath: "README.zh-CN.md",
    sourceText: "# Project\n\n## Usage\n",
    targetText: "# 项目\n\n### 用法\n"
  });

  assert.equal(result.summary.errors, 0);
  assert.equal(result.summary.warnings, 1);
  assert.equal(result.issues[0].rule, "heading-outline");
});
