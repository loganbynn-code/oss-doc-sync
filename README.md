# oss-doc-sync

Check whether bilingual open source Markdown docs stayed structurally in sync.

`oss-doc-sync` is a small CLI for maintainers who publish documentation in more than one language. It does not try to judge translation quality. Instead, it protects the parts of Markdown docs that usually must stay aligned across languages: heading structure, code examples, links, images, and inline code.

## Why this exists

Many open source projects have a great English README and a helpful translated README, but the translated version quietly falls behind. A command changes, a link moves, or a release note gains a new section. Readers in the second language get stale instructions, and maintainers often notice only after someone files an issue.

This tool gives maintainers a quick sync report that can run locally or in CI.

## Install

```sh
npm install --save-dev oss-doc-sync
```

You can also run it before publishing by cloning this repository:

```sh
npm test
node ./bin/oss-doc-sync.js README.md examples/README.zh-CN.md --fail-on none
```

## Usage

```sh
npx oss-doc-sync README.md README.zh-CN.md
```

The command prints a Markdown report and exits with code 1 when errors are found.

```sh
npx oss-doc-sync docs/guide.md docs/guide.zh-CN.md --format json
```

## What it checks

- Heading outline: warns when heading levels drift.
- Code blocks: errors when code examples differ, warns when languages differ.
- Links: errors when URL order or values differ.
- Images: errors when image source order or values differ.
- Inline code: warns when inline code spans differ.

## GitHub Actions

```yaml
name: Docs sync
on: [pull_request]
jobs:
  docs-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx oss-doc-sync README.md README.zh-CN.md
```

## Exit behavior

```sh
oss-doc-sync README.md README.zh-CN.md --fail-on errors
oss-doc-sync README.md README.zh-CN.md --fail-on warnings
oss-doc-sync README.md README.zh-CN.md --fail-on none
```

The default is `--fail-on errors`.

## Roadmap

- Config file support for checking many document pairs.
- GitHub PR comments with the generated Markdown report.
- Section-level drift detection.
- Optional AI-assisted translation suggestions.

## Contributing

Issues and pull requests are welcome. Useful examples include real bilingual documentation structures, edge cases in Markdown parsing, and CI workflows from open source projects.

## License

MIT
