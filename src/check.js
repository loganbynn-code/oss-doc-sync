import { parseMarkdown } from "./markdown.js";

const severity = {
  error: "error",
  warning: "warning"
};

export function checkMarkdownPair({ sourcePath, sourceText, targetPath, targetText }) {
  const source = parseMarkdown(sourceText);
  const target = parseMarkdown(targetText);
  const issues = [
    ...compareHeadingOutline(source, target),
    ...compareSequence("code block", source.codeBlocks, target.codeBlocks, compareCodeBlock),
    ...compareSequence("link", source.links, target.links, compareLink),
    ...compareSequence("image", source.images, target.images, compareImage),
    ...compareSequence("inline code span", source.inlineCode, target.inlineCode, compareInlineCode)
  ];

  return {
    sourcePath,
    targetPath,
    summary: {
      errors: issues.filter((issue) => issue.severity === severity.error).length,
      warnings: issues.filter((issue) => issue.severity === severity.warning).length,
      source: countSummary(source),
      target: countSummary(target)
    },
    issues
  };
}

function countSummary(document) {
  return {
    headings: document.headings.length,
    codeBlocks: document.codeBlocks.length,
    links: document.links.length,
    images: document.images.length,
    inlineCode: document.inlineCode.length
  };
}

function compareHeadingOutline(source, target) {
  const sourceOutline = source.headings.map((heading) => heading.level);
  const targetOutline = target.headings.map((heading) => heading.level);

  if (sourceOutline.join(",") === targetOutline.join(",")) {
    return [];
  }

  return [{
    severity: severity.warning,
    rule: "heading-outline",
    message: "Heading levels differ between source and target documents.",
    sourceLine: source.headings[firstDifference(sourceOutline, targetOutline)]?.line,
    targetLine: target.headings[firstDifference(sourceOutline, targetOutline)]?.line,
    details: {
      sourceOutline,
      targetOutline
    }
  }];
}

function compareSequence(label, sourceItems, targetItems, compareItem) {
  const issues = [];
  const maxLength = Math.max(sourceItems.length, targetItems.length);

  if (sourceItems.length !== targetItems.length) {
    issues.push({
      severity: severity.error,
      rule: `${slug(label)}-count`,
      message: `The ${label} count differs: source has ${sourceItems.length}, target has ${targetItems.length}.`,
      sourceLine: sourceItems[Math.min(sourceItems.length - 1, targetItems.length)]?.line
        ?? sourceItems[Math.min(sourceItems.length - 1, targetItems.length)]?.startLine,
      targetLine: targetItems[Math.min(targetItems.length - 1, sourceItems.length)]?.line
        ?? targetItems[Math.min(targetItems.length - 1, sourceItems.length)]?.startLine
    });
  }

  for (let index = 0; index < maxLength; index += 1) {
    const sourceItem = sourceItems[index];
    const targetItem = targetItems[index];

    if (!sourceItem || !targetItem) {
      continue;
    }

    const itemIssues = compareItem(sourceItem, targetItem, index);
    issues.push(...itemIssues);
  }

  return issues;
}

function compareCodeBlock(source, target, index) {
  const issues = [];

  if (source.language !== target.language) {
    issues.push({
      severity: severity.warning,
      rule: "code-block-language",
      message: `Code block ${index + 1} language differs: source is "${source.language || "plain"}", target is "${target.language || "plain"}".`,
      sourceLine: source.startLine,
      targetLine: target.startLine
    });
  }

  if (source.content !== target.content) {
    issues.push({
      severity: severity.error,
      rule: "code-block-content",
      message: `Code block ${index + 1} content differs.`,
      sourceLine: source.startLine,
      targetLine: target.startLine
    });
  }

  return issues;
}

function compareLink(source, target, index) {
  if (source.href === target.href) {
    return [];
  }

  return [{
    severity: severity.error,
    rule: "link-url",
    message: `Link ${index + 1} URL differs: source points to "${source.href}", target points to "${target.href}".`,
    sourceLine: source.line,
    targetLine: target.line
  }];
}

function compareImage(source, target, index) {
  if (source.src === target.src) {
    return [];
  }

  return [{
    severity: severity.error,
    rule: "image-src",
    message: `Image ${index + 1} source differs: source uses "${source.src}", target uses "${target.src}".`,
    sourceLine: source.line,
    targetLine: target.line
  }];
}

function compareInlineCode(source, target, index) {
  if (source.text === target.text) {
    return [];
  }

  return [{
    severity: severity.warning,
    rule: "inline-code",
    message: `Inline code span ${index + 1} differs: source has \`${source.text}\`, target has \`${target.text}\`.`,
    sourceLine: source.line,
    targetLine: target.line
  }];
}

function firstDifference(source, target) {
  const maxLength = Math.max(source.length, target.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (source[index] !== target[index]) {
      return index;
    }
  }

  return 0;
}

function slug(value) {
  return value.replace(/\s+/g, "-");
}
