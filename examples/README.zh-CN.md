# oss-doc-sync

检查双语开源 Markdown 文档是否保持结构同步。

## 安装

```sh
npm install --save-dev oss-doc-sync
```

## 用法

```sh
npx oss-doc-sync README.md README.zh-CN.md
```

更多信息请查看 [project README](../README.md)。

## GitHub Action

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
