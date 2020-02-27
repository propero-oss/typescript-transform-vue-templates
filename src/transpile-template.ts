import { babelTranspileWith } from "src/babel-transpile-with";
import { MethodDeclaration } from "typescript";
import { compile } from "vue-template-compiler";
import { transformSync } from "@babel/core";
import { template } from "@propero/typescript-transformer-source-templates";

export interface TranspileErrorResult {
  errors: string[];
  tips: string[];
  node?: MethodDeclaration;
}

export interface TranspileSuccessResult extends TranspileErrorResult {
  code: MethodDeclaration;
}

export type TranspileResult = TranspileSuccessResult | TranspileErrorResult;

export function transpileTemplate(tmpl: string): TranspileResult {
  const { render, errors, tips } = compile(tmpl);
  if (errors?.length || !render) return { errors, tips };
  const { code } = transformSync(`function render() {${render}}`, {
    plugins: [babelTranspileWith],
    parserOpts: { strictMode: false },
    compact: true,
    comments: false
  })!;
  if (!code) return { errors, tips };
  const unwrapped = code.replace(/^function/, "").trim();
  const node = template(unwrapped).objectMember<MethodDeclaration>();
  return { node, errors, tips };
}
