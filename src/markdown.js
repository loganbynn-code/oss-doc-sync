const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const linkPattern = /(?<!!)\[([^\]\n]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const imagePattern = /!\[([^\]\n]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const inlineCodePattern = /`([^`\n]+)`/g;

export function parseMarkdown(text) {
  const lines = text.split(/\r?\n/);
  const headings = [];
  const codeBlocks = [];
  const links = [];
  const images = [];
  const inlineCode = [];

  let activeFence = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const fence = line.match(/^```([A-Za-z0-9_+-]*)\s*$/);

    if (fence) {
      if (activeFence) {
        codeBlocks.push({
          language: activeFence.language,
          content: activeFence.lines.join("\n").trim(),
          startLine: activeFence.startLine,
          endLine: lineNumber
        });
        activeFence = null;
      } else {
        activeFence = {
          language: fence[1] || "",
          lines: [],
          startLine: lineNumber
        };
      }
      return;
    }

    if (activeFence) {
      activeFence.lines.push(line);
      return;
    }

    const heading = line.match(headingPattern);
    if (heading) {
      headings.push({
        level: heading[1].length,
        text: heading[2].trim(),
        line: lineNumber
      });
    }

    collectMatches(line, linkPattern, (match) => {
      links.push({
        text: match[1],
        href: match[2],
        line: lineNumber
      });
    });

    collectMatches(line, imagePattern, (match) => {
      images.push({
        alt: match[1],
        src: match[2],
        line: lineNumber
      });
    });

    collectMatches(line, inlineCodePattern, (match) => {
      inlineCode.push({
        text: match[1],
        line: lineNumber
      });
    });
  });

  if (activeFence) {
    codeBlocks.push({
      language: activeFence.language,
      content: activeFence.lines.join("\n").trim(),
      startLine: activeFence.startLine,
      endLine: lines.length
    });
  }

  return {
    headings,
    codeBlocks,
    links,
    images,
    inlineCode
  };
}

function collectMatches(line, pattern, onMatch) {
  pattern.lastIndex = 0;
  let match = pattern.exec(line);

  while (match) {
    onMatch(match);
    match = pattern.exec(line);
  }
}
