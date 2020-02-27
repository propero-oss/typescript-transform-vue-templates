import transformer from "src/main";
import { ModuleKind, ScriptTarget, transpileModule, TranspileOptions } from "typescript";

const transpileOptions: () => TranspileOptions = () => ({
  compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.Latest },
  transformers: { before: [transformer()] }
});

export function transpile(source: string) {
  return transpileModule(source, transpileOptions())
    .outputText.trim()
    .replace(/\r?\n/g, "");
}

export function expectTranspile(source: string) {
  return expect(transpile(source));
}
