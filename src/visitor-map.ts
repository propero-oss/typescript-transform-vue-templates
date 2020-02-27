import { transpileTemplate } from "src/transpile-template";
import { Identifier, isIdentifier, isStringLiteralLike, PropertyAssignment, SyntaxKind, TransformationContext } from "typescript";

export type VisitorMap = {
  [K in SyntaxKind]?: (node: any, visitor: any, context: TransformationContext) => any;
};

export const visitorMap: VisitorMap = {
  [SyntaxKind.PropertyAssignment](node: PropertyAssignment, next) {
    const text = extractTemplate(node);
    if (!text) return next();
    const { node: render } = transpileTemplate(text);
    return render ? next(render) : next();
  }
};

function extractTemplate(node: PropertyAssignment) {
  return isTemplateIdentifier(node.name) && isStringLiteralLike(node.initializer) ? node.initializer.text : false;
}

function isTemplateIdentifier(name: any): name is Identifier & { escapedText: "template" } {
  return isIdentifier(name) && name.escapedText === "template";
}
