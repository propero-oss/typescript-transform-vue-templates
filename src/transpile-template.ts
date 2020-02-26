import { babelTranspileWith } from "src/babel-transpile-with";
import { compile } from "vue-template-compiler";
import { transformSync } from "@babel/core";

export function transpileTemplate(template: string) {
  const { render } = compile(template);
  const { code } = transformSync(`function render() {${render}}`, {
    plugins: [babelTranspileWith],
    parserOpts: { strictMode: false },
    compact: true,
    comments: false
  })!;
  const block = code!.replace(/^function\srender\(\)/, "// @ts-ignore\n").trim();
  return `{ render() ${block} }`;
}
