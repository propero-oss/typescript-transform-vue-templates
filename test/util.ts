import transformer from "src/main";
import { transpileModule, ModuleKind } from "typescript";

const transpileOptions = { compilerOptions: { module: ModuleKind.CommonJS, target: "esnext" }, transformers: { before: [transformer()] } };

export function transpile(source: string) {
  return transpileModule(source, transpileOptions as any)
    .outputText.trim()
    .replace(/\r?\n/g, "");
}

export function expectTranspile(source: string) {
  return expect(transpile(source));
}

export function logTranspile(source: string) {
  console.log(transpile(source));
}
