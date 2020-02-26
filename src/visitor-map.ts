import { expr } from "src/template";
import { transpileTemplate } from "src/transpile-template";
import {
  Identifier,
  isIdentifier,
  isStringLiteralLike,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind
} from "typescript";



export type VisitorMap = {
  [K in SyntaxKind]?: (node: any) => any;
};

export const visitorMap: VisitorMap = {
  [SyntaxKind.PropertyAssignment](node: PropertyAssignment) {
    const { name, initializer } = node;
    if (!isTemplateIdentifier(name)) return node;
    if (!isStringLiteralLike(initializer)) return node;
    const text = copyText(initializer.text);
    const compiled = transpileTemplate(text);
    return expr(compiled).expression<ObjectLiteralExpression>().properties[0];
  }
};

function isTemplateIdentifier(name: any): name is Identifier & { escapedText: "template" } {
  return isIdentifier(name) && name.escapedText === "template";
}

function copyText(text: string) {
  let copy = "";
  for (const char of text) copy += char.charAt(0);
  return copy;
}
