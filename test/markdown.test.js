import assert from "node:assert/strict";
import test from "node:test";
import { parseMarkdown } from "../src/markdown.js";

test("parseMarkdown collects sync-sensitive Markdown structures", () => {
  const document = parseMarkdown(`# Title

Install \`oss-doc-sync\`.

![Logo](./logo.png)

See [docs](https://example.com/docs).

\`\`\`sh
npx oss-doc-sync README.md README.zh-CN.md
\`\`\`
`);

  assert.deepEqual(document.headings, [
    { level: 1, text: "Title", line: 1 }
  ]);
  assert.equal(document.inlineCode[0].text, "oss-doc-sync");
  assert.equal(document.images[0].src, "./logo.png");
  assert.equal(document.links[0].href, "https://example.com/docs");
  assert.equal(document.codeBlocks[0].language, "sh");
  assert.equal(document.codeBlocks[0].content, "npx oss-doc-sync README.md README.zh-CN.md");
});
