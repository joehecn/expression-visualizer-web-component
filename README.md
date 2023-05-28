# \<expression-visualizer-web-component>

[![codecov](https://codecov.io/gh/joehecn/expression-visualizer-web-component/branch/main/graph/badge.svg?token=XVVTCISZZQ)](https://codecov.io/gh/joehecn/expression-visualizer-web-component)

## Demo
[storybook](https://joehecn.github.io/expression-visualizer-web-component/)

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i expression-visualizer-web-component
```

## Usage

```html
<script type="module">
  import 'expression-visualizer-web-component/expression-visualizer-web-component.js';
</script>

<expression-visualizer-web-component></expression-visualizer-web-component>
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`

## localization
```bash
# 提取消息
npx lit-localize extract

# xliff

# 构建本地化模板
npx lit-localize build
```

# npm publish
```bash
npm version patch # Bumping a new version
```

## TODO
- [x] localization
- [x] storybook
- [x] github
- [x] codecov
- [x] github pages
- [x] npm publish
- [ ] tests
