# oss-doc-sync

检查双语开源 Markdown 文档是否保持结构同步。

`oss-doc-sync` 是一个给维护者使用的小型 CLI，适合维护多语言文档的项目。它不会判断翻译质量，而是保护跨语言文档中通常必须保持一致的 Markdown 内容：标题结构、代码示例、链接、图片和行内代码。

## 为什么做这个

很多开源项目都有很好的英文 README，也有实用的翻译版 README，但翻译版很容易悄悄落后。一个命令变了，一个链接移动了，或者发布说明多了一个新章节。第二语言读者拿到的说明就会过期，而维护者往往要等到有人提 issue 才发现。

这个工具让维护者可以在本地或 CI 中快速生成同步报告。

## 安装

```sh
npm install --save-dev oss-doc-sync
```

你也可以在发布前克隆本仓库运行：

```sh
npm test
node ./bin/oss-doc-sync.js README.md examples/README.zh-CN.md --fail-on none
```

## 用法

```sh
npx oss-doc-sync README.md README.zh-CN.md
```

命令会打印 Markdown 报告，并在发现错误时以退出码 1 结束。

```sh
npx oss-doc-sync docs/guide.md docs/guide.zh-CN.md --format json
```

## 检查内容

- 标题结构：标题层级漂移时给出警告。
- 代码块：代码示例不一致时报错，代码语言不一致时警告。
- 链接：URL 顺序或内容不一致时报错。
- 图片：图片源顺序或内容不一致时报错。
- 行内代码：行内代码片段不一致时给出警告。

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

## 退出行为

```sh
oss-doc-sync README.md README.zh-CN.md --fail-on errors
oss-doc-sync README.md README.zh-CN.md --fail-on warnings
oss-doc-sync README.md README.zh-CN.md --fail-on none
```

默认值是 `--fail-on errors`。

## 路线图

- 支持配置文件，一次检查多组文档。
- 在 GitHub PR 中评论生成的 Markdown 报告。
- 支持章节级漂移检测。
- 可选的 AI 辅助翻译建议。

## 贡献

欢迎提交 issue 和 pull request。特别有帮助的贡献包括真实双语文档结构、Markdown 解析边界情况，以及来自开源项目的 CI 工作流。

## 许可证

MIT
